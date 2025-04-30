// utils/api.js
import { gaiaChat } from './gaia'

// Modelo de exemplo disponível no seu Gaia node
const CHAT_MODEL = 'Llama-3-8B-Instruct-262k-Q5_K_M'

export async function validateDocument(text) {
  const system = {
    role: 'system',
    content: 'Você é um extrator de documentos brasileiros. '
  }
  // Perguntas como mensagens de usuário
  const ask = async question => {
    const messages = [
      system,
      { role:'user', content: `Documento:\n${text}` },
      { role:'user', content: question }
    ]
    return await gaiaChat(messages, CHAT_MODEL)
  }
  const name    = await ask('Qual o nome completo do titular?')
  const cpf     = await ask('Qual é o número do CPF?')
  const address = await ask('Qual é o endereço completo?')
  return { name, cpf, address }
}

export async function validateLinkContent(text) {
  const system = {
    role:'system',
    content: 'Classifique este texto como "relevante" ou "não relevante" para e-sports e FURIA.'
  }
  const user   = { role:'user', content: `Conteúdo extraído:\n${text}` }
  const question = { role:'user', content: 'É relevante? Responda apenas "relevante" ou "não relevante".' }

  const answer = await gaiaChat([system, user, question], CHAT_MODEL)
  // se vier algo com “relevante”, marcamos true
  return { relevant: answer?.toLowerCase().includes('relevante') }
}