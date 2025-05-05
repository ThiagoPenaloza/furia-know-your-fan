# 🦁 FURIA | Know Your Fan — Plataforma de Engajamento para Fãs de Esports

<p align="center" style="background-color: white; padding: 20px; border-radius: 8px;">
  <img src="https://github.com/user-attachments/assets/3cbf797e-9d5c-4a27-85e8-64a9fa806cf4" alt="FURIA Logo" width="300">
</p>

> Plataforma web criada para o **Challenge #2: Know Your Fan** da FURIA, com foco em conhecer e engajar fãs através de tecnologias modernas de autenticação e redes sociais.

📱 **[Acesse a Demo](https://furia-know-your-fan-ten.vercel.app)**  
📹 **[Assista à Apresentação](https://youtu.be/-Ry3eH-4wtY)**

---

## 🧠 Visão Geral

A aplicação coleta dados detalhados dos fãs, realiza verificação de identidade, conecta redes sociais e valida perfis de jogos competitivos.  
Tudo isso com uma interface moderna, fluida e mobile-first.

### Objetivo do Desafio

> Criar uma solução para clubes de esports conhecerem melhor seus fãs, possibilitando experiências e serviços personalizados com base em dados reais.

---

## ✨ Funcionalidades Principais

- Cadastro multi-etapas com verificação na AWS.
- Login tradicional e social (Twitter, Google, Twitch)
- Upload e validação automática de documentos com AWS Rekognition e Textract
- Conexão com redes sociais para análise de engajamento
- Validação de perfis competitivos (HLTV, Faceit, Steam, etc)
- Perfil do fã completo e dinâmico

---

## 🛠️ Tecnologias

### Frontend
- **Next.js**: Framework React com renderização do lado do servidor
- **React**: Biblioteca para construção de interfaces
- **GSAP**: Biblioteca de animações avançadas
- **CSS Modules**: Estilos isolados por componente

### Backend
- **API Routes do Next.js**: Endpoints RESTful integrados
- **NextAuth.js**: Sistema de autenticação completo
- **MongoDB (Mongoose)**: Banco de dados não-relacional

### Serviços Cloud
- **AWS S3**: Armazenamento seguro de documentos e imagens
- **AWS Textract**: OCR para extração de texto de documentos
- **AWS Rekognition**: Serviço de comparação facial e análise de imagens

### Integrações
- **Twitter API**: Conexão de conta e verificação de seguidores
- **Twitch API**: Conexão de conta e dados de perfil
- **YouTube API**: Conexão de conta e dados de canal
- **ViaCEP**: Preenchimento automático de endereço por CEP

---

## 🧱 Estrutura do Projeto

```
furia-know-your-fan/
├── components/        # Componentes React reutilizáveis
│   ├── auth/          # Componentes de autenticação
│   ├── forms/         # Componentes de formulários
│   ├── layout/        # Componentes de layout
│   ├── profile/       # Componentes de perfil
│   └── ui/            # Componentes de UI genéricos
├── lib/               # Utilitários e configurações
│   ├── api/           # Funções auxiliares para API
│   ├── auth/          # Configuração de autenticação
│   ├── aws/           # Configuração de serviços AWS
│   └── db/            # Configuração de banco de dados
├── models/            # Modelos do Mongoose
├── pages/             # Páginas e API routes
│   ├── api/           # Endpoints da API
│   │   ├── auth/      # Endpoints de autenticação
│   │   ├── profiles/  # Endpoints de perfis de jogos
│   │   └── social/    # Endpoints de redes sociais
│   └── ...            # Páginas da aplicação
├── public/            # Arquivos estáticos
├── styles/            # Arquivos CSS
└── ...
```

---

## 🔐 Segurança

- Hash de senhas com **bcrypt**
- Armazenamento criptografado em **AWS S3**
- Gerenciamento de sessões seguro via **NextAuth**
- Proteções ativas contra **CSRF**, **XSS** e ataques de força bruta
- Estrutura pronta para **compliance com a LGPD**

---

## 🧪 Instalação Local

### Pré-requisitos

- Node.js 14+
- MongoDB
- Conta na AWS (S3, Textract, Rekognition)
- Credenciais das APIs (Google, Twitter, Twitch)

### Passo a passo

1. Clone o repositório:
   ```bash
   git clone https://github.com/ThiagoPenaloza/furia-know-your-fan.git
   cd furia-know-your-fan
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```
   # Base URL
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key

   # MongoDB
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/furia-know-your-fan

   # OAuth Providers
   TWITTER_CLIENT_ID=your-twitter-client-id
   TWITTER_CLIENT_SECRET=your-twitter-client-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   TWITCH_CLIENT_ID=your-twitch-client-id
   TWITCH_CLIENT_SECRET=your-twitch-client-secret

   # AWS
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-s3-bucket-name
   ```

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:3000` no navegador.

---

## 📝 Uso

### Landing Page

![image](https://github.com/user-attachments/assets/1e6ac429-c154-40eb-b76b-61f73dee347e)


A página inicial apresenta uma visão geral da plataforma e convida os usuários a participarem do programa de fãs da FURIA.

### Cadastro

1. Clique em "Participar" na página inicial
2. Preencha suas informações pessoais (Nome, Email, CPF, etc.)
3. Informe seus interesses em esports
4. Complete a verificação de identidade
5. Revise e confirme seus dados

### Perfil do Usuário

Após o cadastro, você será redirecionado para seu perfil, onde poderá:

1. Visualizar e editar suas informações
2. Conectar suas redes sociais
3. Adicionar perfis de jogos competitivos
4. Verificar seu status de verificação

### Conexão com Redes Sociais

1. Acesse seu perfil
2. Navegue até a seção "Redes Sociais"
3. Clique no botão correspondente à plataforma desejada
4. Autorize o acesso quando solicitado
5. Aguarde a sincronização de dados

### Perfis de Jogos

1. Acesse seu perfil
2. Navegue até a seção "Perfis de Jogos"
3. Clique em "Adicionar Perfil"
4. Selecione a plataforma e insira o link do seu perfil
5. Aguarde a validação automática

---

## 📬 Contato

**Thiago Peñaloza**  
💼 [LinkedIn](https://linkedin.com/in/thiagopenaloza)  
📧 thiagopenalozaofficial@gmail.com  

---

**Made with ❤️ for the FURIA Challenge**
