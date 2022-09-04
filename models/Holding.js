import mongoose from 'mongoose'
import Transaction from './Transaction'
import Asset from './Asset'
import aConf from "../lib/myConfig.json";

//maybe use map ?? https://mongoosejs.com/docs/schematypes.html#maps

const HoldingSchema = new mongoose.Schema({
  uniqueIdentification: String,
  name: String,
  actualValueCached: Number,
  lastRefresh: Date,
  valueSplitProviderCached: [{
    provider: String,
    amount: Number
  }],
  sharesSplitProviderCached: [{
    provider: String,
    amount: Number
  }],
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

HoldingSchema.methods.getYield = async function () {
  //console.log('Entering validation for : ', this.uniqueIdentification);

  //Mandatory annotation for notes for all asset type
  const aAsset = await Asset.find({ uniqueIdentification: this.assetInfo })
  //console.log('aAsset: ',aAsset);
  const aAssetYield = aAsset[0].getYield()
  //console.log('aAssetYield: ',aAssetYield, ' and type: ',typeof(aAssetYield));
  return aAssetYield
}

HoldingSchema.methods.refreshAnnotations = function (iAvgYield, iAsset) {
  //Here we check if yield is high relative to the portfolio
  if (iAsset.getYield() > iAvgYield) {
    //console.log('good yield compare to portfolio');
    //console.log("We are below -10% compare to 200d avg.");
    const aHighYieldPortAnnot = this.annotations.find(({ value }) => value === 'HighYieldP');
    if (aHighYieldPortAnnot) {
      //console.log('Warning already there. Nothing to do');
    }
    else {
      //console.log('200daysLow Warning do not exists. creating it');
      let aNewAnotation = { key: "goodWarning", value: "HighYieldP" }
      this.annotations.push(aNewAnotation)
    }


  }
  else {
    //need to remove it if we are not anymore close to 200 days low
    const aHighYieldPortAnnot = this.annotations.find(({ value }) => value === 'HighYieldP');
    if (aHighYieldPortAnnot) {
      console.log("We are not higher than Portfolio yield. need to remove it");
      //console.log("this.annotations BEFORE: ", this.annotations)
      this.annotations = this.annotations.filter(e => e.value !== 'HighYieldP')
      //console.log("this.annotations AFTER: ", this.annotations)
    }

  }
}

HoldingSchema.methods.refresh = async function (iAvgYield) {
  //console.error('Entering holding refresh for : ', this.name);
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
  //console.log('Refreshing holding : ', this.name);
  //call refresh on asset??
  let actualValue = 0
  const aAsset = await Asset.find({ uniqueIdentification: this.assetInfo })
  //console.log('aAsset: ',aAsset);
  //aAsset.refresh()
  const aActualAssetPrice = aAsset[0].unitValue

  //Clean up cache - otherwise you keep wrong/old provider forever in the list
  this.valueSplitProviderCached=[]

  //call refresh on all Tx
  const aMyHoldingId = this.uniqueIdentification
  const transactions = await Transaction.find({ holdingInfo: aMyHoldingId })
  transactions.forEach(aOneTrx => {
    //console.log('actualValue: ',actualValue);
    //console.log('calling refresh for aOneTrx: ',aOneTrx);

    aOneTrx.refresh(aActualAssetPrice)
    //console.log('refresh aOneAsset: ',aRefreshStatus);
    let aCheckHoldingTypeMandatoryAnnotation = this.valueSplitProviderCached.find(({ provider }) => provider === aOneTrx.provider);
    if (!aCheckHoldingTypeMandatoryAnnotation) {
      console.log('New provider.');
      let aNewProviderHoldings = { provider: aOneTrx.provider, amount: 0 }
      this.valueSplitProviderCached.push(aNewProviderHoldings)
    }
    else {
      //reset 0
      //why ??
      //aCheckHoldingTypeMandatoryAnnotation.amount = 0
    }
    let aSharesForProvider = this.sharesSplitProviderCached.find(({ provider }) => provider === aOneTrx.provider);
    if (!aSharesForProvider) {
      console.log('New provider.');
      let aNewProviderHoldings = { provider: aOneTrx.provider, amount: 0 }
      this.sharesSplitProviderCached.push(aNewProviderHoldings)
    }
    else {
      //reset 0
      //aSharesForProvider.amount = 0
    }
    //now it should ALWAYS exists
    aCheckHoldingTypeMandatoryAnnotation = this.valueSplitProviderCached.find(({ provider }) => provider === aOneTrx.provider);
    aSharesForProvider = this.sharesSplitProviderCached.find(({ provider }) => provider === aOneTrx.provider);
    if (aOneTrx.action == "buy") {
      actualValue = aOneTrx.quantity * aActualAssetPrice + actualValue
      aCheckHoldingTypeMandatoryAnnotation.amount = aOneTrx.quantity * aActualAssetPrice + aCheckHoldingTypeMandatoryAnnotation.amount
      aSharesForProvider.amount = aOneTrx.quantity + aSharesForProvider.amount
    } else if (aOneTrx.action == "sell") {
      actualValue = actualValue - aOneTrx.quantity * aActualAssetPrice
      aSharesForProvider.amount = aSharesForProvider.amount - aOneTrx.quantity
      aCheckHoldingTypeMandatoryAnnotation.amount = aCheckHoldingTypeMandatoryAnnotation.amount - aOneTrx.quantity * aActualAssetPrice
    } else {
      console.error('unknow operation for aOneTrx: ', aOneTrx);
    }

  });

  this.actualValueCached = Math.round((actualValue + Number.EPSILON) * 100) / 100;

  this.refreshAnnotations(iAvgYield, aAsset[0])

  //console.log('Saving');
  const aCurrentDate = new Date().toISOString()
  //console.log('aCurrentDate:',aCurrentDate);
  this.lastRefresh = aCurrentDate
  this.save()

  return
}

module.exports = mongoose.models.Holding || mongoose.model('Holding', HoldingSchema)