// models/User.js

import mongoose from 'mongoose'

const PortfolioSchema = new mongoose.Schema({
  uniqueIdentification: String,
  name: String,
  value: Number,
  annotations: [{
    key: String,
    value: String
  }],
  holdings: [{
    type: String
  }]
})

PortfolioSchema.methods.myvalidation = function (aRefreshNameToo = true) {
  console.error('Entering validation for : ', this.uniqueIdentification);
  return
}


PortfolioSchema.methods.refresh = function () {
  console.error('Entering refresh for Portfolio: ', this.name);
  this.value = 7.0
  this.save()
  return this.name
}

module.exports = mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema)