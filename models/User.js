// models/User.js
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  /* ===== obrigatórios do Next-Auth ===== */
  name          : { type:String, required:true },
  email         : { type:String, required:true, unique:true, lowercase:true },
  emailVerified : { type:Date },
  image         : { type:String },

  /* ===== login local ===== */
  password      : { type:String, required:true, select:false },

  /* ===== seus campos extras ===== */
  cpf           : { type:String, required:true, unique:true },
  birthDate     : { type:Date,   required:true },
  phone         : { type:String, required:true },
  
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
    steam: String,
    epic: String,
    battleNet: String,
    riotGames: String,
    origin: String,
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
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/* hash da senha */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt   = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.models.User || mongoose.model('User', UserSchema);