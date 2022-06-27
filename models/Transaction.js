// models/User.js

import mongoose from 'mongoose'
import aConf from "../lib/myConfig.json";

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
  gainCached: Number,
  paidByUnit: Number,
  lastRefresh: Date,
  uniqueIdentification: String
})

TransactionSchema.methods.refresh = function (iActualPrice) {
  //console.log('Entering transaction refresh for : ', this, ' with price: ',iActualPrice);
  const aPreviousRefreshDate = this.lastRefresh
  //console.log('aPreviousRefreshDate: ',aPreviousRefreshDate);
  const aNow = new Date()
  //console.log('aNow: ',aNow);
  const aDelta = Math.abs(aNow - aPreviousRefreshDate) / 1000
  //console.log('aConf.REFRESH_TIMER:', aConf.REFRESH_TIMER);
  if (aDelta < 5) {
    console.log('Refresh not needed for transaction');
    return
  }

  
  //console.log('this.gainCached : ', this.gainCached);
  //if ("gainCached" in this){
    if (this.gainCached !== undefined){
    //console.log('gainCached is defined in Trx: ',this);
    this.gainCached =  Math.round(((iActualPrice - this.paidByUnit) + Number.EPSILON) * 100) / 100;
  }
  else{
    console.error('gainCached is NOT defined in Trx: ',this);
  }

  //console.log('Saving');
  const aCurrentDate = new Date().toISOString()
  //console.log('aCurrentDate:',aCurrentDate);
  this.lastRefresh = aCurrentDate
  this.save()
}

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)