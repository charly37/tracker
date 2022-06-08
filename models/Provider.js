// models/User.js

import mongoose from 'mongoose'

const ProviderSchema = new mongoose.Schema({
  uniqueIdentification: String,
  name: String,
  assetType: String
})

module.exports = mongoose.models.Provider || mongoose.model('Provider', ProviderSchema)