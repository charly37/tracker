// models/User.js

import mongoose from 'mongoose'
import Holding from './Holding'

const PortfolioSchema = new mongoose.Schema({
  uniqueIdentification: String,
  name: String,
  valueCached: Number,
  avgYieldCached: Number,
  annotations: [{
    key: String,
    value: String
  }],
  stats: [{
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


PortfolioSchema.methods.refresh = async function () {
  console.log('Entering refresh for Portfolio: ', this.name);

  let actualValue = 0.0
  let aAvgYeild = 0.0
  

  const aHoldings = await Holding.find({portfolio:this.uniqueIdentification})
  for (const aOneHolding of aHoldings) { 
    //FOREACH fails for await - https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    //aHoldings.forEach(aOneHolding => {
    //console.log('calling refresh for aOneHolding: ',aOneHolding.name);
    aOneHolding.refresh(this.avgYieldCached)
    //console.log('actualValueCached: ',aOneHolding.actualValueCached);
    actualValue = actualValue + aOneHolding.actualValueCached
    //console.log('refresh aOneAsset: ',aRefreshStatus);
    const aYieldFromHolding = await aOneHolding.getYield()
    //const aYieldFromHolding = aOneHolding.getYield()
    //console.log('aYieldFromHolding: ',aYieldFromHolding, ' and type: ',typeof(aYieldFromHolding));
    aAvgYeild = aAvgYeild + aYieldFromHolding

  }
  //});
  const aNbHoldings=aHoldings.length
  //console.log('aNbHoldings: ',aNbHoldings);

  //console.log('aAvgYeild: ',aAvgYeild);
  aAvgYeild = aAvgYeild / aNbHoldings
  //console.log('aAvgYeild: ',aAvgYeild);

  this.valueCached = Math.round((actualValue + Number.EPSILON) * 100) / 100;
  this.avgYieldCached = Math.round((aAvgYeild + Number.EPSILON) * 100) / 100;
  this.save()
  return
}

module.exports = mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema)