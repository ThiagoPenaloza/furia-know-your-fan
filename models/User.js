// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cpf: { type: String, required: true, unique: true },
  birthDate: { type: Date, required: true },
  phone: { type: String, required: true },
  
  // Address
  address: {
    street: { type: String, required: true },
    number: { type: String, required: true },
    complement: { type: String },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  
  // Fan Interests
  favoriteGames: [String],
  favoriteTeams: [String],
  favoritePlayers: [String],
  attendedEvents: [String],
  purchasedMerchandise: [String],
  
  // Social Media
  socialMedia: {
    instagram: { 
      username: String,
      connected: { type: Boolean, default: false },
      accessToken: String,
      userData: mongoose.Schema.Types.Mixed,
      lastSync: Date
    },
    twitter: { 
      username: String,
      connected: { type: Boolean, default: false },
      accessToken: String,
      userData: mongoose.Schema.Types.Mixed,
      lastSync: Date
    },
    facebook: { 
      username: String,
      connected: { type: Boolean, default: false },
      accessToken: String,
      userData: mongoose.Schema.Types.Mixed,
      lastSync: Date
    },
    twitch: { 
      username: String,
      connected: { type: Boolean, default: false },
      accessToken: String,
      userData: mongoose.Schema.Types.Mixed,
      lastSync: Date
    },
    youtube: { 
      username: String,
      connected: { type: Boolean, default: false },
      accessToken: String,
      userData: mongoose.Schema.Types.Mixed,
      lastSync: Date
    },
  },
  
  // Gaming Profiles
  gamingProfiles: {
    steam: { type: String },
    epic: { type: String },
    battleNet: { type: String },
    riotGames: { type: String },
    origin: { type: String },
  },
  
  // Document Verification
  documents: {
    idDocument: {
      filename: String,
      verified: { type: Boolean, default: false },
      verificationDate: Date
    },
    selfie: {
      filename: String,
      verified: { type: Boolean, default: false },
      verificationDate: Date
    },
  },
  
  // Social Media Analysis
  socialAnalysis: {
    esportsInteractions: [
      {
        platform: String,
        organization: String,
        interactionType: String,
        content: String,
        date: Date
      }
    ],
    followedPages: [
      {
        platform: String,
        pageName: String,
        pageType: String,
        followedSince: Date
      }
    ],
    sentiment: {
      towardsFuria: { type: Number, min: -1, max: 1 },
      towardsEsports: { type: Number, min: -1, max: 1 }
    }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);