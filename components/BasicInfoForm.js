import { useState, useEffect } from 'react'

export default function BasicInfoForm({ value, onChange }) {
  // form interno para controlar campos
  const [form, setForm] = useState(value)

  // toda vez que form muda, avisamos o pai (index.js) via onChange
  useEffect(() => {
    onChange(form)
  }, [form, onChange])

  // handler genérico para inputs
  function handleInput(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <label>
        Nome:<br/>
        <input
          name="name"
          value={form.name}
          onChange={handleInput}
          placeholder="Seu nome completo"
          style={{ width: '100%' }}
        />
      </label>

      <label>
        Endereço:<br/>
        <input
          name="address"
          value={form.address}
          onChange={handleInput}
          placeholder="Rua, número, cidade, estado"
          style={{ width: '100%' }}
        />
      </label>

      <label>
        CPF:<br/>
        <input
          name="cpf"
          value={form.cpf}
          onChange={handleInput}
          placeholder="000.000.000-00"
          style={{ width: '100%' }}
        />
      </label>

      <label>
        Interesses (e-sports, times, jogos):<br/>
        <input
          name="interests"
          value={form.interests}
          onChange={handleInput}
          placeholder="Ex: CS:GO, LoL, esports em geral"
          style={{ width: '100%' }}
        />
      </label>

      <label>
        Atividades no último ano:<br/>
        <input
          name="activities"
          value={form.activities}
          onChange={handleInput}
          placeholder="Ex: assisti a X eventos"
          style={{ width: '100%' }}
        />
      </label>

      <label>
        Eventos frequentados:<br/>
        <input
          name="events"
          value={form.events}
          onChange={handleInput}
          placeholder="Ex: ESL Pro League, Red Bull Campus"
          style={{ width: '100%' }}
        />
      </label>

      <label>
        Compras relacionadas:<br/>
        <input
          name="purchases"
          value={form.purchases}
          onChange={handleInput}
          placeholder="Ex: merchandise oficial"
          style={{ width: '100%' }}
        />
      </label>
    </div>
  )
}