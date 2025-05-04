import formidable                                               from 'formidable'
import { S3Client, PutObjectCommand }                           from '@aws-sdk/client-s3'
import { TextractClient, AnalyzeDocumentCommand }               from '@aws-sdk/client-textract'
import { RekognitionClient, CompareFacesCommand }               from '@aws-sdk/client-rekognition'
import fs                                                       from 'fs'
import dbConnect                                                from '../../lib/db'
import User                                                     from '../../models/User'


// utilidade local para remover acentos sem depender de pacote externo
const removeAccents = (s = '') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/*  Next API – precisamos desligar o bodyParser para usar formidable  */
export const config = { api: { bodyParser: false } }

/* ───────────────────────── helpers ────────────────────────── */
const s3  = new S3Client({  region: process.env.AWS_REGION })
const tex = new TextractClient({ region: process.env.AWS_REGION })
const rek = new RekognitionClient({ region: process.env.AWS_REGION })

const upload = async (file, key) =>
  s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key   : key,
    Body  : file
  }))

const pick = v => Array.isArray(v) ? v[0] : v
const norm = (s = '') =>
  removeAccents(s)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

/* ───────────────────────── handler ────────────────────────── */
export default async function handler (req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    /* ----------- 1) Faz parse multipart/form-data ------------- */
    const { fields, files } = await new Promise((ok, err) =>
      formidable({ maxFileSize: 10 * 1024 * 1024 }).parse(req, (e,fld,fls)=>e?err(e):ok({fields:fld,files:fls}))
    )

    const userId    = pick(fields.userId)
    const name      = pick(fields.name)
    const cpf       = pick(fields.cpf)
    const birthDate = pick(fields.birthDate)

    const frontFile = pick(files.idDocumentFront)
    const backFile  = pick(files.idDocumentBack)
    const selfie    = pick(files.selfie)

    /* ----------- 2) Envia os arquivos para o S3 --------------- */
    const frontKey = `kyc/${userId}/doc-front-${Date.now()}`
    const backKey  = `kyc/${userId}/doc-back-${Date.now()}`
    const selfieKey= `kyc/${userId}/selfie-${Date.now()}`

    await Promise.all([
      upload(fs.createReadStream(frontFile.filepath), frontKey),
      upload(fs.createReadStream(backFile.filepath) , backKey ),
      upload(fs.createReadStream(selfie.filepath)   , selfieKey)
    ])

    /* ----------- 3) TEXTRACT – extrai dados do documento ------ */
    const analyze = async key => tex.send(new AnalyzeDocumentCommand({
      Document:{ S3Object:{ Bucket:process.env.AWS_S3_BUCKET, Name:key }},
      FeatureTypes:['FORMS']
    }))

    const [texFront, texBack] = await Promise.all([analyze(frontKey), analyze(backKey)])

    const text = [...texFront.Blocks, ...texBack.Blocks]
      .filter(b => b.BlockType==='LINE')
      .map(b => b.Text)
      .join(' ')
    const textNorm = norm(text)

    /* comparações */
    const nameParts  = norm(name).split(' ')
    const hits       = nameParts.filter(p => p.length > 2 && textNorm.includes(p)).length

    // critério antigo (metade do nome, mínimo 2 palavras)
    // const matchedName = hits >= Math.max(2, Math.ceil(nameParts.length / 2))

    // critério novo – basta 1 palavra encontrada
    const matchedName = hits >= 1

    const cpfDigits  = cpf.replace(/\D/g,'')
    const cpfRegex   = new RegExp(cpfDigits.split('').join('[^0-9]*'))
    const matchedCPF = cpfRegex.test(textNorm)

    const matchedBirth = textNorm.includes(
      new Date(birthDate).getFullYear().toString()
    )

    /* ----------- 4) REKOGNITION – compara as faces ------------ */
    const cmp = await rek.send(new CompareFacesCommand({
      SourceImage:{ S3Object:{ Bucket:process.env.AWS_S3_BUCKET, Name:frontKey }},
      TargetImage:{ S3Object:{ Bucket:process.env.AWS_S3_BUCKET, Name:selfieKey }},
      SimilarityThreshold:80
    }))
    const faceMatch = (cmp.FaceMatches?.[0]?.Similarity ?? 0) >= 80

    /* ----------- 5) Consolida resultado ----------------------- */
    const reasons = []
    if(!matchedName)  reasons.push('nome')
    if(!matchedCPF)   reasons.push('CPF')
    if(!matchedBirth) reasons.push('nascimento')
    if(!faceMatch)    reasons.push('rosto')

    const approved = reasons.length===0
    const reason   = approved ? null : `Campos não encontrados: ${reasons.join(', ')}`

    /* ----------- 6) Persiste no usuário ----------------------- */
    await dbConnect()
    await User.findByIdAndUpdate(userId, {
      $set: {
        'identity.frontKey' : frontKey,
        'identity.backKey'  : backKey,
        'identity.selfieKey': selfieKey,
        'identity.status'   : approved ? 'approved' : 'rejected',
        'identity.reason'   : reason
      }
    })

    return res.json({ approved, reason })
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .json({ error: 'Falha na verificação de identidade', details: err.message })
  }
}