// models/Fan.js
import mongoose from 'mongoose';

const FanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, informe seu nome']
  },
  email: {
    type: String,
    required: [true, 'Por favor, informe seu email'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, informe um email válido']
  },
  cpf: {
    type: String,
    required: [true, 'Por favor, informe seu CPF'],
    unique: true
  },
  birthDate: {
    type: Date,
    required: [true, 'Por favor, informe sua data de nascimento']
  },
  phone: {
    type: String,
    required: [true, 'Por favor, informe seu telefone']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Por favor, informe sua rua']
    },
    number: {
      type: String,
      required: [true, 'Por favor, informe o número']
    },
    complement: {
      type: String
    },
    neighborhood: {
      type: String,
      required: [true, 'Por favor, informe seu bairro']
    },
    city: {
      type: String,
      required: [true, 'Por favor, informe sua cidade']
    },
    state: {
      type: String,
      required: [true, 'Por favor, informe seu estado']
    },
    zipCode: {
      type: String,
      required: [true, 'Por favor, informe seu CEP']
    }
  },
  favoriteGames: {
    type: [String],
    default: []
  },
  favoriteTeams: {
    type: [String],
    default: []
  },
  favoritePlayers: {
    type: [String],
    default: []
  },
  attendedEvents: {
    type: [String],
    default: []
  },
  purchasedMerchandise: {
    type: [String],
    default: []
  },
  socialMedia: {
    instagram: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    facebook: {
      type: String,
      default: ''
    },
    twitch: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    }
  },
  gamingProfiles: {
    steam: {
      type: String,
      default: ''
    },
    epic: {
      type: String,
      default: ''
    },
    battleNet: {
      type: String,
      default: ''
    },
    riotGames: {
      type: String,
      default: ''
    },
    origin: {
      type: String,
      default: ''
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Atualizar o timestamp updatedAt antes de salvar
FanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Verificar se o modelo já foi compilado para evitar erros
export default mongoose.models.Fan || mongoose.model('Fan', FanSchema);
