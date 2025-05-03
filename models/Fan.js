// models/Fan.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const FanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cpf: {
    type: String,
    required: [true, 'Por favor, informe seu CPF'],
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false           // não vem por padrão em queries
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
      username: String,
      avatar: String,
      connected: { type: Boolean, default: false },
      accessToken: String,
      userData: mongoose.Schema.Types.Mixed,
      lastSync: Date
    },
    twitter: {
      username: String,
      avatar: String,
      connected: { type: Boolean, default: false },
      accessToken: String,
      userData: mongoose.Schema.Types.Mixed,
      lastSync: Date
    },
    facebook: {
      username: String,
      avatar: String,
      connected: { type: Boolean, default: false },
      accessToken: String,
      userData: mongoose.Schema.Types.Mixed,
      lastSync: Date
    },
    twitch: {
      username: String,
      avatar: String,
      connected: { type: Boolean, default: false },
      accessToken: String,
      userData: mongoose.Schema.Types.Mixed,
      lastSync: Date
    },
    youtube: {
      username: String,
      avatar: String,
      connected: { type: Boolean, default: false },
      accessToken: String,
      userData: mongoose.Schema.Types.Mixed,
      lastSync: Date
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

// Antes de salvar, hash da senha se modificada
FanSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Verificar se o modelo já foi compilado para evitar erros
FanSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.models.Fan || mongoose.model('Fan', FanSchema);
