// pages/form.js
import { useState }    from 'react';
import { useRouter }   from 'next/router';
import { signIn }      from 'next-auth/react';

import styles from '../styles/Form.module.css';

export default function FanForm() {
  const router                    = useRouter();
  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  /* ---------- estado inicial ---------- */
  const [formData, setFormData] = useState({
    /* ── Informações básicas ── */
    name      : '',
    email     : '',
    cpf       : '',
    password  : '',
    birthDate : '',
    phone     : '',
    address   : {
      street      : '',
      number      : '',
      complement  : '',
      neighborhood: '',
      city        : '',
      state       : '',
      zipCode     : '',
    },

    /* ── Interesses (raw strings) ── */
    favoriteGamesRaw: '',
    favoriteTeamsRaw: '',
    favoritePlayersRaw: '',
    attendedEventsRaw: '',
    purchasedMerchandiseRaw: '',

    /* ── Interesses (arrays) ── */
    favoriteGames       : [],
    favoriteTeams       : [],
    favoritePlayers     : [],
    attendedEvents      : [],
    purchasedMerchandise: [],

    /* ── Documentos ── */
    idDocumentFront : null,
    idDocumentBack  : null,
    selfie          : null,
  });

  /* ---------- helpers de input ---------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: { ...formData[section], [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleArrayInputChange = (e, field) => {
    const rawField = `${field}Raw`;
    const rawValue = e.target.value;

    setFormData({
      ...formData,
      [rawField]: rawValue,
      [field]: rawValue
        .split(/[,\n]/)
        .map(item => item.trim())
        .filter(Boolean)
    });
  };

  const handleFileUpload = (e, field) => {
    setFormData({ ...formData, [field]: e.target.files[0] });
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
              zipCode: cep,
            }
          }));
        }
      } catch (error) {
        console.error('CEP fetch error:', error);
      }
    }
  };

  /* ---------- navegação ---------- */
  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Validation checks
    const requiredFields = {
      'name': 'Nome',
      'email': 'Email',
      'cpf': 'CPF',
      'password': 'Senha',
      'birthDate': 'Data de Nascimento',
      'phone': 'Telefone',
      'address.street': 'Rua',
      'address.number': 'Número',
      'address.neighborhood': 'Bairro',
      'address.city': 'Cidade',
      'address.state': 'Estado',
      'address.zipCode': 'CEP'
    };

    const missingFields = [];

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (field.includes('.')) {
        const [section, key] = field.split('.');
        if (!formData[section][key]) missingFields.push(label);
      } else {
        if (!formData[field]) missingFields.push(label);
      }
    });

    if (missingFields.length > 0) {
      setErrorMsg(`Por favor, preencha os seguintes campos obrigatórios: ${missingFields.join(', ')}`);
      setLoading(false);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'idDocument' || key === 'selfie') return;

        if (Array.isArray(value)) {
          data.append(key, JSON.stringify(value));
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subVal]) =>
            data.append(`${key}.${subKey}`, subVal)
          );
        } else {
          data.append(key, value);
        }
      });

      if (formData.idDocumentFront) data.append('idDocumentFront', formData.idDocumentFront);
      if (formData.idDocumentBack)  data.append('idDocumentBack',  formData.idDocumentBack);
      if (formData.selfie)         data.append('selfie',         formData.selfie);

      const res       = await fetch('/api/submit-fan-data', { method:'POST', body:data });
      const resJson   = await res.json();                     // <- pega o JSON
      if (!res.ok)   { setErrorMsg(resJson.error || 'Erro de cadastro'); return; }

      /*  resJson deve conter o id recém-criado.
          Ajuste abaixo caso seu endpoint use outro campo              */
      const savedUserId =
            resJson.userId          ??
            resJson.id              ??
            resJson._id             ??
            resJson.user?._id       ??
            resJson.user?.id;

      if (!savedUserId) {
        throw new Error('ID do usuário não retornado pelo servidor');
      }

      /* ---------- chama verificação de identidade ---------- */
      const verifyFD = new FormData();
      verifyFD.append('userId',    savedUserId);
      verifyFD.append('name',      formData.name);
      verifyFD.append('cpf',       formData.cpf);
      verifyFD.append('birthDate', formData.birthDate);
      verifyFD.append('idDocumentFront', formData.idDocumentFront);
      verifyFD.append('idDocumentBack',  formData.idDocumentBack);
      verifyFD.append('selfie',    formData.selfie);

      const verRes   = await fetch('/api/verify-id', { method:'POST', body:verifyFD });
      const { approved, reason } = await verRes.json();

      if (!approved) {
        /* ← NOVO: apaga o usuário recém-criado */
        await fetch(`/api/users/${savedUserId}`, { method: 'DELETE' });

        setErrorMsg(`Verificação de identidade falhou: ${reason || ''}`);
        return;                                // sai sem logar
      }

      /* ---------- login automático + redirect ---------- */
      await signIn('credentials', {
        email      : formData.email,
        password   : formData.password,
        callbackUrl: '/profile'
      });

    } catch (err) {
      setErrorMsg('Ocorreu um erro ao enviar o formulário. Por favor, verifique suas informações e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

        <h1 className={styles.title}>Perfil de Fã FURIA</h1>
        <p className={styles.subtitle}>
          {step === 1 && 'Informações Pessoais'}
          {step === 2 && 'Seus Interesses em Esports'}
          {step === 3 && 'Verificação de Identidade'}
          {step === 4 && 'Revisão e Envio'}
        </p>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* ---------- STEP 1 ---------- */}
          {step === 1 && (
            <div className={styles.formStep}>
              {/* campos pessoais */}
              <div className={styles.inputGroup}>
                <label htmlFor="name">Nome Completo *</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">E-mail *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="cpf">CPF *</label>
                <input
                  id="cpf"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Senha *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Crie uma senha"
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength={6}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="birthDate">Data de Nascimento *</label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone">Telefone *</label>
                <input
                  id="phone"
                  name="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* endereço */}
              <div className={styles.inputGroup}>
                <label htmlFor="address.zipCode">CEP *</label>
                <input
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  onBlur={handleCepBlur}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address.street">Rua *</label>
                <input
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="address.number">Número *</label>
                  <input
                    id="address.number"
                    name="address.number"
                    value={formData.address.number}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="address.complement">Complemento</label>
                  <input
                    id="address.complement"
                    name="address.complement"
                    value={formData.address.complement}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address.neighborhood">Bairro *</label>
                <input
                  id="address.neighborhood"
                  name="address.neighborhood"
                  value={formData.address.neighborhood}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="address.city">Cidade *</label>
                  <input
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="address.state">Estado *</label>
                  <input
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.nextButton} onClick={nextStep}>
                  Próximo
                </button>
              </div>
            </div>
          )}

          {/* ---------- STEP 2 ---------- */}
          {step === 2 && (
            <div className={styles.formStep}>
              <div className={styles.inputGroup}>
                <label htmlFor="favoriteGames">Jogos Favoritos</label>
                <textarea
                  id="favoriteGames"
                  placeholder="CS:GO, Valorant…"
                  value={formData.favoriteGamesRaw}
                  onChange={e => handleArrayInputChange(e, 'favoriteGames')}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="favoriteTeams">Times Favoritos</label>
                <textarea
                  id="favoriteTeams"
                  placeholder="FURIA, LOUD…"
                  value={formData.favoriteTeamsRaw}
                  onChange={e => handleArrayInputChange(e, 'favoriteTeams')}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="favoritePlayers">Jogadores Favoritos</label>
                <textarea
                  id="favoritePlayers"
                  placeholder="arT, KSCERATO…"
                  value={formData.favoritePlayersRaw}
                  onChange={e => handleArrayInputChange(e, 'favoritePlayers')}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="attendedEvents">Eventos que Participou</label>
                <textarea
                  id="attendedEvents"
                  placeholder="ESL One, BLAST…"
                  value={formData.attendedEventsRaw}
                  onChange={e => handleArrayInputChange(e, 'attendedEvents')}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="purchasedMerchandise">Produtos Comprados</label>
                <textarea
                  id="purchasedMerchandise"
                  placeholder="Camisa, Mousepad…"
                  value={formData.purchasedMerchandiseRaw}
                  onChange={e => handleArrayInputChange(e, 'purchasedMerchandise')}
                />
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.backButton} onClick={prevStep}>
                  Voltar
                </button>
                <button type="button" className={styles.nextButton} onClick={nextStep}>
                  Próximo
                </button>
              </div>
            </div>
          )}

          {/* ---------- STEP 3 ---------- */}
          {step === 3 && (
            <div className={styles.formStep}>
              <h3>Verificação de Identidade</h3>
              <p className={styles.info}>
                Para garantir a autenticidade do seu perfil precisamos verificar
                sua identidade.
              </p>

              {/* Documento – FRENTE */}
              <div className={styles.inputGroup}>
                <label htmlFor="idDocumentFront">Documento (frente) *</label>
                <input
                  type="file"
                  id="idDocumentFront"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'idDocumentFront')}
                  required={!formData.idDocumentFront}
                />
                {formData.idDocumentFront && (
                  <p className={styles.fileInfo}>
                    Arquivo: {formData.idDocumentFront.name}
                  </p>
                )}
              </div>

              {/* Documento – VERSO */}
              <div className={styles.inputGroup}>
                <label htmlFor="idDocumentBack">Documento (verso) *</label>
                <input
                  type="file"
                  id="idDocumentBack"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'idDocumentBack')}
                  required={!formData.idDocumentBack}
                />
                {formData.idDocumentBack && (
                  <p className={styles.fileInfo}>
                    Arquivo: {formData.idDocumentBack.name}
                  </p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="selfie">Selfie com Documento *</label>
                <input
                  type="file"
                  id="selfie"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'selfie')}
                  required={!formData.selfie}
                />
                {formData.selfie && (
                  <p className={styles.fileInfo}>
                    Arquivo: {formData.selfie.name}
                  </p>
                )}
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.backButton} onClick={prevStep}>
                  Voltar
                </button>
                <button type="button" className={styles.nextButton} onClick={nextStep}>
                  Próximo
                </button>
              </div>
            </div>
          )}

          {/* ---------- STEP 4 ---------- */}
          {step === 4 && (
            <div className={styles.formStep}>
              <h3>Revisão e Envio</h3>
              <p className={styles.info}>
                Revise suas informações antes de enviar.
              </p>

              <div className={styles.reviewSection}>
                <h4>Informações Pessoais</h4>
                <p><strong>Nome:</strong> {formData.name}</p>
                <p><strong>E-mail:</strong> {formData.email}</p>
                <p><strong>CPF:</strong> {formData.cpf}</p>
                <p><strong>Nascimento:</strong> {formData.birthDate}</p>
                <p><strong>Telefone:</strong> {formData.phone}</p>
                <p>
                  <strong>Endereço:</strong>{' '}
                  {formData.address.street}, {formData.address.number},{' '}
                  {formData.address.neighborhood}, {formData.address.city} -{' '}
                  {formData.address.state}, {formData.address.zipCode}
                </p>
              </div>

              <div className={styles.reviewSection}>
                <h4>Interesses</h4>
                <p>
                  <strong>Jogos:</strong>{' '}
                  {formData.favoriteGames.join(', ') || 'Nenhum'}
                </p>
                <p>
                  <strong>Times:</strong>{' '}
                  {formData.favoriteTeams.join(', ') || 'Nenhum'}
                </p>
                <p>
                  <strong>Jogadores:</strong>{' '}
                  {formData.favoritePlayers.join(', ') || 'Nenhum'}
                </p>
              </div>

              <div className={styles.reviewSection}>
                <h4>Documentos</h4>
                <p>
                  <strong>Documento (frente):</strong>{' '}
                  {formData.idDocumentFront ? 'Enviado' : 'Não enviado'}
                </p>
                <p>
                  <strong>Documento (verso):</strong>{' '}
                  {formData.idDocumentBack ? 'Enviado' : 'Não enviado'}
                </p>
                <p>
                  <strong>Selfie:</strong>{' '}
                  {formData.selfie ? 'Enviada' : 'Não enviada'}
                </p>
              </div>

              <div className={styles.termsGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" required />
                  Concordo com os{' '}
                  <a href="/terms" target="_blank">Termos de Uso</a> e{' '}
                  <a href="/privacy" target="_blank">Política de Privacidade</a>
                </label>
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.backButton} onClick={prevStep}>
                  Voltar
                </button>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar Cadastro'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
