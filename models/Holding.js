import mongoose from 'mongoose'
import Transaction from './Transaction'
import Asset from './Asset'
import aConf from "../lib/myConfig.json";

const HoldingSchema = new mongoose.Schema({
  uniqueIdentification: String,
  name: String,
  actualValueCached: Number,
  lastRefresh: Date,
  annotations: [{
    key: String,
    value: String
  }],
  portfolio: String,
  assetInfo: String
})

HoldingSchema.methods.myvalidation = function (aRefreshNameToo = true) {
  //console.log('Entering validation for : ', this.uniqueIdentification);

  //Mandatory annotation for notes for all asset type
  const aCheckHoldingTypeMandatoryAnnotation = this.annotations.find(({ key }) => key === 'myNotes');
  console.log(aCheckHoldingTypeMandatoryAnnotation)

  if (!aCheckHoldingTypeMandatoryAnnotation) {
    console.error('Missing mandatory annotation myNotes');
    throw 'Missing mandatory annotation myNotes'
  }

  console.log("all check OK")
  return
}

function getCompanyInfo(iTicker) {
  let aCompanyInfoUrl = "https://mboum.com/api/v1/qu/quote/statistics/?symbol=" + iTicker
  return fetch(aCompanyInfoUrl, {
    "method": "GET",
    "headers": { "X-Mboum-Secret": process.env.MBOUM_KEY }
  })
    .then((res) => res.json())
    .catch(error => {
      console.error('There was an error to get stock info!', error);
    });
};

function setStockInfo(iTicker) {
  let aStockInfoUrl = "https://mboum.com/api/v1/qu/quote/?symbol=" + iTicker
  return fetch(aStockInfoUrl, {
    "method": "GET",
    "headers": { "X-Mboum-Secret": process.env.MBOUM_KEY }
  })
    .then((res) => res.json())
    .catch(error => {
      console.error('There was an error to get stock info!', error);
    });
};

// `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
function getCompanyAndStockInfo(iTicker) {
  //console.log("building promise with holding: ", iHolding);
  return Promise.all([getCompanyInfo(iTicker), setStockInfo(iTicker)])
}


HoldingSchema.methods.refresh = async function () {
  //console.error('Entering holding refresh for : ', this);
  const aPreviousRefreshDate = this.lastRefresh
  //console.log('aPreviousRefreshDate: ',aPreviousRefreshDate);
  const aNow = new Date()
  //console.log('aNow: ',aNow);
  const aDelta = Math.abs(aNow - aPreviousRefreshDate) / 1000
  //console.log('aDelta:', aDelta);
  if (aDelta < aConf.REFRESH_TIMER) {
    //console.log('Refresh not needed for holding');
    return
  }
  //call refresh on asset??
  let actualValue = 0
  const aAsset = await Asset.find({uniqueIdentification:this.assetInfo})
  //console.log('aAsset: ',aAsset);
  const aActualAssetPrice=aAsset[0].unitValue

  //call refresh on all Tx
  const aMyHoldingId= this.uniqueIdentification
  const transactions = await Transaction.find({holdingInfo:aMyHoldingId})
  transactions.forEach(aOneTrx => {
    //console.log('calling refresh for aOneTrx: ',aOneTrx);
    aOneTrx.refresh(aActualAssetPrice)
    //console.log('refresh aOneAsset: ',aRefreshStatus);
    actualValue = actualValue +1
  });

  this.actualValueCached=actualValue

  //console.log('Saving');
  const aCurrentDate = new Date().toISOString()
  //console.log('aCurrentDate:',aCurrentDate);
  this.lastRefresh = aCurrentDate
  this.save()

  return
}

module.exports = mongoose.models.Holding || mongoose.model('Holding', HoldingSchema)