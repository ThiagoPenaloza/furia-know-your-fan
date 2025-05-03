import mongoose from 'mongoose'

const AccountSchema = new mongoose.Schema({
  provider:          { type: String, required: true },
  type:              String,
  providerAccountId: String,
  access_token:      String,
  expires_at:        Number,
  id_token:          String,
  refresh_token:     String,
  scope:             String,
  token_type:        String,

  /* mesmo tipo que está salvo na collection “accounts” */
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

export default mongoose.models.Account ||
       mongoose.model('Account', AccountSchema)