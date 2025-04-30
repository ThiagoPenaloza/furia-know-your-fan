import { useEffect, useState } from 'react'
import Tesseract from 'tesseract.js'

export default function DocUploadOCR({ value, onChange }) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    onChange(value)
  }, [value, onChange])

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const { data: { text } } = await Tesseract.recognize(reader.result, 'por')
        onChange({ text })
      } catch (err) {
        console.error(err)
        alert('Erro no OCR')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <input type="file" accept="image/*,application/pdf" onChange={handleFile} />
      {loading && <p>Processando OCR…</p>}
      {value.text && (
        <div>
          <h4>Texto extraído:</h4>
          <pre style={{
            background: '#f5f5f5',
            padding: 8,
            maxHeight: 200,
            overflow: 'auto'
          }}>
            {value.text}
          </pre>
        </div>
      )}
    </div>
  )
}