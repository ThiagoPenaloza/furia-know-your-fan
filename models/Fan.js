// models/Fan.js
import mongoose from 'mongoose';

const FanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cpf: { type: String, required: true },
  birthDate: { type: Date, required: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    number: { type: String, required: true },
    complement: String,
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  favoriteGames: [String],
  favoriteTeams: [String],
  favoritePlayers: [String],
  attendedEvents: [String],
  purchasedMerchandise: [String],
  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String,
    twitch: String,
    youtube: String
  },
  gamingProfiles: {
    steam: String,
    epic: String,
    battleNet: String,
    riotGames: String,
    origin: String
  },
  idDocument: String, // armazene URL ou referência no GridFS
  selfie: String // idem
});

export default mongoose.models.Fan || mongoose.model('Fan', FanSchema);
