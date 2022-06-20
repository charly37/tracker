// models/User.js

import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema({
  holdingInfo: String,
  name: String,
  provider: String,
  action: {
    type: String,
    enum: ['buy', 'sell'],
    default: 'buy'
  },
  date: Date,
  quantity: Number,
  paidByUnit: Number,
  uniqueIdentification: String
})

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)