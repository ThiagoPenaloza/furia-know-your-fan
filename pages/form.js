// pages/form.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Form.module.css';

export default function FanForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    cpf: '',
    birthDate: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
    
    // Fan Interests
    favoriteGames: [],
    favoriteTeams: [],
    favoritePlayers: [],
    attendedEvents: [],
    purchasedMerchandise: [],
    
    // Social Media
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      twitch: '',
      youtube: '',
    },
    
    // Gaming Profiles
    gamingProfiles: {
      steam: '',
      epic: '',
      battleNet: '',
      riotGames: '',
      origin: '',
    },
    
    // Document Verification
    idDocument: null,
    selfie: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleArrayInputChange = (e, field) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [field]: value.split(',').map(item => item.trim())
    });
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      [field]: file
    });
  };

  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData object to handle file uploads
      const data = new FormData();
      
      // Add all form data except files
      Object.keys(formData).forEach(key => {
        if (key !== 'idDocument' && key !== 'selfie') {
          if (typeof formData[key] === 'object' && !Array.isArray(formData[key]) && formData[key] !== null) {
            // Handle nested objects
            Object.keys(formData[key]).forEach(nestedKey => {
              data.append(`${key}.${nestedKey}`, formData[key][nestedKey]);
            });
          } else {
            data.append(key, JSON.stringify(formData[key]));
          }
        }
      });
      
      // Add files
      if (formData.idDocument) {
        data.append('idDocument', formData.idDocument);
      }
      
      if (formData.selfie) {
        data.append('selfie', formData.selfie);
      }
      
      // Send data to API
      const response = await fetch('/api/submit-fan-data', {
        method: 'POST',
        body: data,
      });
      
      if (response.ok) {
        router.push('/success');
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Perfil de Fã FURIA</h1>
        <p className={styles.subtitle}>
          {step === 1 && "Informações Pessoais"}
          {step === 2 && "Seus Interesses em Esports"}
          {step === 3 && "Redes Sociais e Perfis de Jogos"}
          {step === 4 && "Verificação de Identidade"}
          {step === 5 && "Revisão e Envio"}
        </p>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className={styles.formStep}>
              <div className={styles.inputGroup}>
                <label htmlFor="name">Nome Completo *</label>
                <input
                  type="text"
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
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
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
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="address.zipCode">CEP *</label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="address.street">Rua *</label>
                <input
                  type="text"
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
                    type="text"
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
                    type="text"
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
                  type="text"
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
                    type="text"
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
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.buttonGroup}>
                <button 
                  type="button" 
                  className={styles.nextButton}
                  onClick={nextStep}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Fan Interests */}
          {step === 2 && (
            <div className={styles.formStep}>
              <div className={styles.inputGroup}>
                <label htmlFor="favoriteGames">Jogos Favoritos</label>
                <textarea
                  id="favoriteGames"
                  placeholder="CS:GO, Valorant, League of Legends, etc. (separados por vírgula)"
                  value={formData.favoriteGames.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'favoriteGames')}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="favoriteTeams">Times Favoritos</label>
                <textarea
                  id="favoriteTeams"
                  placeholder="FURIA, LOUD, paiN, etc. (separados por vírgula)"
                  value={formData.favoriteTeams.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'favoriteTeams')}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="favoritePlayers">Jogadores Favoritos</label>
                <textarea
                  id="favoritePlayers"
                  placeholder="arT, KSCERATO, yuurih, etc. (separados por vírgula)"
                  value={formData.favoritePlayers.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'favoritePlayers')}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="attendedEvents">Eventos que Participou no Último Ano</label>
                <textarea
                  id="attendedEvents"
                  placeholder="ESL One Rio, BLAST Premier, etc. (separados por vírgula)"
                  value={formData.attendedEvents.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'attendedEvents')}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="purchasedMerchandise">Produtos que Comprou no Último Ano</label>
                <textarea
                  id="purchasedMerchandise"
                  placeholder="Camisa FURIA, Mousepad, etc. (separados por vírgula)"
                  value={formData.purchasedMerchandise.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'purchasedMerchandise')}
                />
              </div>
              
              <div className={styles.buttonGroup}>
                <button 
                  type="button" 
                  className={styles.backButton}
                  onClick={prevStep}
                >
                  Voltar
                </button>
                <button 
                  type="button" 
                  className={styles.nextButton}
                  onClick={nextStep}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Social Media and Gaming Profiles */}
          {step === 3 && (
            <div className={styles.formStep}>
              <h3>Redes Sociais</h3>
              <p className={styles.info}>Conecte suas redes sociais para melhorarmos sua experiência</p>
              
              <div className={styles.inputGroup}>
                <label htmlFor="socialMedia.instagram">Instagram</label>
                <input
                  type="text"
                  id="socialMedia.instagram"
                  name="socialMedia.instagram"
                  placeholder="@seu_usuario"
                  value={formData.socialMedia.instagram}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="socialMedia.twitter">Twitter</label>
                <input
                  type="text"
                  id="socialMedia.twitter"
                  name="socialMedia.twitter"
                  placeholder="@seu_usuario"
                  value={formData.socialMedia.twitter}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="socialMedia.facebook">Facebook</label>
                <input
                  type="text"
                  id="socialMedia.facebook"
                  name="socialMedia.facebook"
                  placeholder="URL do seu perfil"
                  value={formData.socialMedia.facebook}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="socialMedia.twitch">Twitch</label>
                <input
                  type="text"
                  id="socialMedia.twitch"
                  name="socialMedia.twitch"
                  placeholder="seu_usuario"
                  value={formData.socialMedia.twitch}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="socialMedia.youtube">YouTube</label>
                <input
                  type="text"
                  id="socialMedia.youtube"
                  name="socialMedia.youtube"
                  placeholder="URL do seu canal"
                  value={formData.socialMedia.youtube}
                  onChange={handleInputChange}
                  />
                </div>
                
                <h3>Perfis de Jogos</h3>
                <p className={styles.info}>Adicione seus perfis de jogos para conectar com outros fãs</p>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="gamingProfiles.steam">Steam</label>
                  <input
                    type="text"
                    id="gamingProfiles.steam"
                    name="gamingProfiles.steam"
                    placeholder="ID ou URL do perfil"
                    value={formData.gamingProfiles.steam}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="gamingProfiles.epic">Epic Games</label>
                  <input
                    type="text"
                    id="gamingProfiles.epic"
                    name="gamingProfiles.epic"
                    placeholder="Nome de usuário"
                    value={formData.gamingProfiles.epic}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="gamingProfiles.battleNet">Battle.net</label>
                  <input
                    type="text"
                    id="gamingProfiles.battleNet"
                    name="gamingProfiles.battleNet"
                    placeholder="Nome de usuário"
                    value={formData.gamingProfiles.battleNet}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="gamingProfiles.riotGames">Riot Games</label>
                  <input
                    type="text"
                    id="gamingProfiles.riotGames"
                    name="gamingProfiles.riotGames"
                    placeholder="Nome de usuário"
                    value={formData.gamingProfiles.riotGames}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="gamingProfiles.origin">Origin/EA</label>
                  <input
                    type="text"
                    id="gamingProfiles.origin"
                    name="gamingProfiles.origin"
                    placeholder="Nome de usuário"
                    value={formData.gamingProfiles.origin}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.buttonGroup}>
                  <button 
                    type="button" 
                    className={styles.backButton}
                    onClick={prevStep}
                  >
                    Voltar
                  </button>
                  <button 
                    type="button" 
                    className={styles.nextButton}
                    onClick={nextStep}
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 4: Document Verification */}
            {step === 4 && (
              <div className={styles.formStep}>
                <h3>Verificação de Identidade</h3>
                <p className={styles.info}>
                  Para garantir a segurança e autenticidade do seu perfil, precisamos verificar sua identidade.
                  Suas informações serão tratadas com total confidencialidade.
                </p>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="idDocument">Documento de Identidade (RG ou CNH) *</label>
                  <input
                    type="file"
                    id="idDocument"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'idDocument')}
                    required={!formData.idDocument}
                  />
                  {formData.idDocument && (
                    <p className={styles.fileInfo}>
                      Arquivo selecionado: {formData.idDocument.name}
                    </p>
                  )}
                  <p className={styles.fileHelp}>
                    Envie uma foto ou PDF do seu documento oficial com foto.
                  </p>
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
                      Arquivo selecionado: {formData.selfie.name}
                    </p>
                  )}
                  <p className={styles.fileHelp}>
                    Envie uma selfie sua segurando o documento de identidade com seu rosto visível.
                  </p>
                </div>
                
                <div className={styles.buttonGroup}>
                  <button 
                    type="button" 
                    className={styles.backButton}
                    onClick={prevStep}
                  >
                    Voltar
                  </button>
                  <button 
                    type="button" 
                    className={styles.nextButton}
                    onClick={nextStep}
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 5: Review and Submit */}
            {step === 5 && (
              <div className={styles.formStep}>
                <h3>Revisão e Envio</h3>
                <p className={styles.info}>
                  Revise suas informações antes de enviar. Você poderá editar seu perfil posteriormente.
                </p>
                
                <div className={styles.reviewSection}>
                  <h4>Informações Pessoais</h4>
                  <p><strong>Nome:</strong> {formData.name}</p>
                  <p><strong>E-mail:</strong> {formData.email}</p>
                  <p><strong>CPF:</strong> {formData.cpf}</p>
                  <p><strong>Data de Nascimento:</strong> {formData.birthDate}</p>
                  <p><strong>Telefone:</strong> {formData.phone}</p>
                  <p><strong>Endereço:</strong> {formData.address.street}, {formData.address.number}, {formData.address.neighborhood}, {formData.address.city} - {formData.address.state}, {formData.address.zipCode}</p>
                </div>
                
                <div className={styles.reviewSection}>
                  <h4>Interesses</h4>
                  <p><strong>Jogos Favoritos:</strong> {formData.favoriteGames.join(', ') || 'Nenhum informado'}</p>
                  <p><strong>Times Favoritos:</strong> {formData.favoriteTeams.join(', ') || 'Nenhum informado'}</p>
                  <p><strong>Jogadores Favoritos:</strong> {formData.favoritePlayers.join(', ') || 'Nenhum informado'}</p>
                </div>
                
                <div className={styles.reviewSection}>
                  <h4>Redes Sociais</h4>
                  <p><strong>Instagram:</strong> {formData.socialMedia.instagram || 'Não informado'}</p>
                  <p><strong>Twitter:</strong> {formData.socialMedia.twitter || 'Não informado'}</p>
                  <p><strong>Twitch:</strong> {formData.socialMedia.twitch || 'Não informado'}</p>
                </div>
                
                <div className={styles.reviewSection}>
                  <h4>Perfis de Jogos</h4>
                  <p><strong>Steam:</strong> {formData.gamingProfiles.steam || 'Não informado'}</p>
                  <p><strong>Riot Games:</strong> {formData.gamingProfiles.riotGames || 'Não informado'}</p>
                  <p><strong>Battle.net:</strong> {formData.gamingProfiles.battleNet || 'Não informado'}</p>
                </div>
                
                <div className={styles.reviewSection}>
                  <h4>Documentos</h4>
                  <p><strong>Documento de Identidade:</strong> {formData.idDocument ? 'Enviado' : 'Não enviado'}</p>
                  <p><strong>Selfie com Documento:</strong> {formData.selfie ? 'Enviada' : 'Não enviada'}</p>
                </div>
                
                <div className={styles.termsGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      required
                    />
                    Concordo com os <a href="/terms" target="_blank">Termos de Uso</a> e <a href="/privacy" target="_blank">Política de Privacidade</a>
                  </label>
                </div>
                
                <div className={styles.buttonGroup}>
                  <button 
                    type="button" 
                    className={styles.backButton}
                    onClick={prevStep}
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar Cadastro'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }
