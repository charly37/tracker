import mongoose from 'mongoose'

const AssetSchema = new mongoose.Schema({
  uniqueIdentification: String,
  name: String,
  assetType: {
    type: String,
    enum: ['stock', 'crypto', 'option'],
    default: 'stock'
  },
  unitValue: Number,
  lastRefresh: Date,
  annotations: [{
    key: String,
    value: String
  }],
})

AssetSchema.methods.myvalidation = function () {
  //console.log('Entering validation for : ', this.uniqueIdentification);

  //Mandatory annotation for notes for all asset type
  const aCheckAssetTypeMandatoryAnnotation = this.annotations.find(({ key }) => key === 'MyNotes');
  console.log(aCheckAssetTypeMandatoryAnnotation)

  if (!aCheckAssetTypeMandatoryAnnotation) {
    console.error('Missing mandatory annotation for assetType');
    throw 'Missing mandatory annotation for assetType'
  }

  if (this.assetType == "stock") {
    //console.log('extra check for stock');

    const aTickerAnnotation = this.annotations.find(({ key }) => key === 'ticker');
    if (!aTickerAnnotation) {
      throw 'Missing mandatory annotation for assetType'
    }


  } else if (this.assetType == "option") {

    const aTickerAnnotation = this.annotations.find(({ key }) => key === 'ticker');
    if (!aTickerAnnotation) {
      console.error('Missing mandatory annotation for assetType');
      throw 'Missing mandatory ticker annotation for option'
    }

    const aUtickerAnnotation = this.annotations.find(({ key }) => key === 'uticker');
    if (!aUtickerAnnotation) {
      console.error('Missing mandatory annotation for assetType');
      throw 'Missing mandatory uticker annotation for assetType'
    }

    const aExpirationAnnotation = this.annotations.find(({ key }) => key === 'expiration');
    if (!aExpirationAnnotation) {
      console.error('Missing mandatory annotation for assetType');
      throw 'Missing mandatory expiration annotation for assetType'
    }

    const aMoneynessAnnotation = this.annotations.find(({ key }) => key === 'moneyness');
    if (!aMoneynessAnnotation) {
      console.warning('Missing optional annotation for aMoneynessAnnotation. Adding it');
      let aMoneynessAnotation = { key: "moneyness", value: "unknow" }
      this.annotations.push(aMoneynessAnotation)
    }

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
  //console.log("building promise with Asset: ", iAsset);
  return Promise.all([getCompanyInfo(iTicker), setStockInfo(iTicker)])
}

AssetSchema.methods.refreshAnnotationsStocks = function (iCompanyInfo, iStockInfo, iAvgYield) {
  console.log("Refreshing annotation");

  //clean up
  const aOldWarning = this.annotations.find(({ value }) => value === '50daysLow');
  if (aOldWarning) {
    console.log('clean up needed');
    console.log("this.annotations BEFORE: ", this.annotations)
    this.annotations = this.annotations.filter(e => e.value !== '50daysLow')
    console.log("this.annotations AFTER: ", this.annotations)
  }

  let aRawValue = iStockInfo["data"][0]["fiftyTwoWeekLowChangePercent"] * 100
  if (aRawValue < 10) {
    console.log("We are close to 52W low.");
    const aFiftyDayAverageChangePercentAnnotation = this.annotations.find(({ value }) => value === '52weeksLow');
    if (aFiftyDayAverageChangePercentAnnotation) {
      console.log('52weeksLow warning already there. Nothing to do');
    }
    else {
      console.log('52weeksLow warning do not exists. creating it');
      let aNewAnotation = { key: "warning", value: "52weeksLow" }
      this.annotations.push(aNewAnotation)
    }


  }
  else {
    //need to remove it if we are not anymore close to 52W low
    const aFiftyDayAverageChangePercentAnnotation = this.annotations.find(({ value }) => value === '52weeksLow');
    if (aFiftyDayAverageChangePercentAnnotation) {
      console.log("We are not close to 52W low. need to remove it");
      console.log("this.annotations BEFORE: ", this.annotations)
      this.annotations = this.annotations.filter(e => e.value !== '52weeksLow')
      console.log("this.annotations AFTER: ", this.annotations)
    }

  }

  aRawValue = iStockInfo["data"][0]["twoHundredDayAverageChangePercent"] * 100
  if (aRawValue < -10) {
    console.log("We are below -10% compare to 200d avg.");
    const aFiftyDayAverageChangePercentAnnotation = this.annotations.find(({ value }) => value === '200daysLow');
    if (aFiftyDayAverageChangePercentAnnotation) {
      console.log('Warning already there. Nothing to do');
    }
    else {
      console.log('200daysLow Warning do not exists. creating it');
      let aNewAnotation = { key: "warning", value: "200daysLow" }
      this.annotations.push(aNewAnotation)
    }


  }
  else {
    //need to remove it if we are not anymore close to 200 days low
    const aFiftyDayAverageChangePercentAnnotation = this.annotations.find(({ value }) => value === '200daysLow');
    if (aFiftyDayAverageChangePercentAnnotation) {
      console.log("We are not close to -10% compare to 200d avg. need to remove it");
      console.log("this.annotations BEFORE: ", this.annotations)
      this.annotations = this.annotations.filter(e => e.value !== '200daysLow')
      console.log("this.annotations AFTER: ", this.annotations)
    }

  }

  const aYieldAnnotation = this.annotations.find(({ key }) => key === 'yield');
  if (aYieldAnnotation) {
    console.log('Looking to update yield good warning');
    //this.annotations["yield"] = Math.round((aRawValue + Number.EPSILON) * 100) / 100;


    if (aYieldAnnotation.value > iAvgYield) {
      console.log("High yield.");
      const aHighYieldAnnotation = this.annotations.find(({ value }) => value === 'HighYield');
      if (aHighYieldAnnotation) {
        console.log('Good warning already there. Nothing to do');
      }
      else {
        console.log('Adding the good warning');
        let aNewAnotation = { key: "goodWarning", value: "HighYield" }
        this.annotations.push(aNewAnotation)
      }


    }
    else {
      //need to remove it if we are no longer high yield
      const aHighYieldAnnotation = this.annotations.find(({ value }) => value === 'HighYield');
      if (aHighYieldAnnotation) {
        console.log("We are not high yield anymore. need to remove it");
        console.log("this.annotations BEFORE: ", this.annotations)
        this.annotations = this.annotations.filter(e => e.value !== 'HighYield')
        console.log("this.annotations AFTER: ", this.annotations)
      }

    }
  }
}

AssetSchema.methods.refreshAnnotationsOptions = function (iOptionInfo) {
  console.log("Refreshing annotation for Option");
  console.log("iOptionInfo:", iOptionInfo);

  //clean up
  // const aOldWarning = this.annotations.find(({ value }) => value === 'FiftyDayAverageChangePercentWarning');
  //   if (aOldWarning) {
  //     console.log('clean up needed');
  //     console.log("this.annotations BEFORE: ",this.annotations)
  //     this.annotations = this.annotations.filter(e => e.value !== 'FiftyDayAverageChangePercentWarning')
  //     console.log("this.annotations AFTER: ",this.annotations)
  //   }


  const aRawValue = iOptionInfo["inTheMoney"]
  //console.log("We are below -10% compare to 200d avg. Adding annotation");
  const aMoneynessAnnotation = this.annotations.find(({ key }) => key === 'moneyness');
  if (aMoneynessAnnotation) {
    console.log('aMoneynessAnnotation already there. Updating it');
    aMoneynessAnnotation.value = aRawValue
  }
  else {
    console.log('aMoneynessAnnotation do not exists. creating it');
    let aNewAnotation = { key: "moneyness", value: aRawValue }
    this.annotations.push(aNewAnotation)
  }
  //also store it in warning
  //first clean previous info
  this.annotations = this.annotations.filter(e => e.value !== 'ITM')
  this.annotations = this.annotations.filter(e => e.value !== 'OTM')
  //now store updated info
  if (aRawValue === true) {
    console.log('Adding option ITM in good warning');
    let aNewAnotation = { key: "goodWarning", value: "ITM" }
    this.annotations.push(aNewAnotation)
  }
  else {
    console.log('Adding option OTM in bad warning');
    let aNewAnotation = { key: "warning", value: "OTM" }
    this.annotations.push(aNewAnotation)
  }
}


AssetSchema.methods.refresh = function (aAvgYield) {
  console.error('Entering refresh for : ', this.name);
  const aPreviousRefreshDate = this.lastRefresh
  //console.log('aPreviousRefreshDate: ',aPreviousRefreshDate);
  const aNow = new Date()
  //console.log('aNow: ',aNow);
  const aDelta = Math.abs(aNow - aPreviousRefreshDate) / 1000
  //console.log('aDelta:', aDelta);
  if (aDelta < 3600) {
    console.log('Refresh not needed');
    return
  }
  //console.error('Entering refresh for : ', this.uniqueIdentification);
  if (this.assetType == "stock") {
    //console.error('this.annotations: ', this.annotations);

    const aTickerAnnotation = this.annotations.find(({ key }) => key === 'ticker');
    //console.error('working on refresh for stock: ', aTickerAnnotation);

    const aTicker = aTickerAnnotation["value"];
    console.error('working on refresh for stock: ', aTicker);

    getCompanyAndStockInfo(aTicker)
      .then(([aCompanyInfo, aStockInfo]) => {
        //console.log('aStockInfo:', aStockInfo["data"][0]);
        //console.log('aCompanyInfo:', aCompanyInfo["data"]["yield"]);

        this.unitValue = aStockInfo["data"][0]["regularMarketPrice"]
        //let aRoundedValue = Math.round((aValueFromApi + Number.EPSILON) * 100) / 100;
        let aRawValue = aStockInfo["data"][0]["fiftyDayAverageChangePercent"] * 100
        this.fiftyDayAverageChangePercent = Math.round((aRawValue + Number.EPSILON) * 100) / 100;
        const aFiftyDayAverageChangePercentAnnotation = this.annotations.find(({ key }) => key === 'fiftyDayAverageChangePercent');
        if (aFiftyDayAverageChangePercentAnnotation) {
          //console.log('aTickerAnnotation exists. updating it');
          this.annotations["fiftyDayAverageChangePercent"] = Math.round((aRawValue + Number.EPSILON) * 100) / 100;
        }
        else {
          //console.log('aTickerAnnotation do not exists. creating it');
          let aNewAnotation = { key: "fiftyDayAverageChangePercent", value: Math.round((aRawValue + Number.EPSILON) * 100) / 100 }
          this.annotations.push(aNewAnotation)
        }

        aRawValue = aStockInfo["data"][0]["twoHundredDayAverageChangePercent"] * 100
        this.twoHundredDayAverageChangePercent = Math.round((aRawValue + Number.EPSILON) * 100) / 100;
        const aTwoHundredDayAverageChangePercentAnnotation = this.annotations.find(({ key }) => key === 'twoHundredDayAverageChangePercent');
        if (aTwoHundredDayAverageChangePercentAnnotation) {
          //console.log('aTickerAnnotation exists. updating it');
          this.annotations["twoHundredDayAverageChangePercent"] = Math.round((aRawValue + Number.EPSILON) * 100) / 100;
        }
        else {
          //console.log('aTickerAnnotation do not exists. creating it');
          let aNewAnotation = { key: "twoHundredDayAverageChangePercent", value: Math.round((aRawValue + Number.EPSILON) * 100) / 100 }
          this.annotations.push(aNewAnotation)
        }

        // aRawValue = aStockInfo["data"][0]["trailingAnnualDividendYield"] * 100
        // this.twoHundredDayAverageChangePercent = Math.round((aRawValue + Number.EPSILON) * 100) / 100;
        // const aTrailingAnnualDividendYieldAnnotation = this.annotations.find(({ key }) => key === 'trailingAnnualDividendYield');
        // if (aTrailingAnnualDividendYieldAnnotation) {
        //   //console.log('aTickerAnnotation exists. updating it');
        //   this.annotations["trailingAnnualDividendYield"] = Math.round((aRawValue + Number.EPSILON) * 100) / 100;
        // }
        // else {
        //   //console.log('aTickerAnnotation do not exists. creating it');
        //   let aNewAnotation = { key: "trailingAnnualDividendYield", value: Math.round((aRawValue + Number.EPSILON) * 100) / 100 }
        //   this.annotations.push(aNewAnotation)
        // }
        //if (aRefreshNameToo) {
          //console.log('Updating name too');
          //this.name = data["companyName"]
        //}

        //company info
        aRawValue = aCompanyInfo["data"]["yield"]["raw"] * 100
        const aYieldAnnotation = this.annotations.find(({ key }) => key === 'yield');
        if (aYieldAnnotation) {
          //console.log('aTickerAnnotation exists. updating it');
          this.annotations["yield"] = Math.round((aRawValue + Number.EPSILON) * 100) / 100;
        }
        else {
          //console.log('aTickerAnnotation do not exists. creating it');
          let aNewAnotation = { key: "yield", value: Math.round((aRawValue + Number.EPSILON) * 100) / 100 }
          this.annotations.push(aNewAnotation)
        }
        this.refreshAnnotationsStocks(aCompanyInfo, aStockInfo, aAvgYield)


        //console.log('Saving');
        const aCurrentDate = new Date().toISOString()
        //console.log('aCurrentDate:',aCurrentDate);
        this.lastRefresh = aCurrentDate
        this.save()
      })

  }
  else if (this.assetType == "crypto") {
    //IEX has no API to get name of crypto so aRefreshNameToo is not use here

    const aTickerAnnotation = this.annotations.find(({ key }) => key === 'ticker');
    //console.error('working on refresh for stock: ', aTickerAnnotation);

    const aTicker = aTickerAnnotation["value"];
    console.error('working on refresh for crypto: ', aTicker);

    fetch("https://cloud.iexapis.com/stable/crypto/" + aTicker + "/price?token=" + process.env.IEX_KEY, {
      "method": "GET",
      "headers": {}
    })
      .then(response => response.json())
      .then(data => {
        //console.log('Success:', data);
        this.unitValue = data["price"]
        //console.log('Price save:', data["price"]);
        const aCurrentDate = new Date().toISOString()
        //console.log('aCurrentDate:',aCurrentDate);
        this.lastRefresh = aCurrentDate
        this.save()
      })
      .catch((error) => {
        console.error('Error:', error);
      });

  }
  else if (this.assetType == "option") {
    console.log('refresh option info');
    const aTickerAnnotation = this.annotations.find(({ key }) => key === 'ticker');
    //console.error('working on refresh for stock: ', aTickerAnnotation);

    const aTicker = aTickerAnnotation["value"];
    //console.log('working on refresh for stock: ', aTicker);

    //For BOUM which is the only API i found working fine with option you need the ticker and expiration in epoch. I tried IEX, polygon but MBOUM is best

    const aUtickerAnnotation = this.annotations.find(({ key }) => key === 'uticker');
    //console.log('working on refresh for stock: ', aTickerAnnotation);

    const aUticker = aUtickerAnnotation["value"];
    //console.log('working on refresh for stock: ', aUticker);

    const aExpirationAnnotation = this.annotations.find(({ key }) => key === 'expiration');
    //console.log('working on refresh for aExpiration: ', aExpiration);

    const aExpiration = aExpirationAnnotation["value"];
    //console.log('working on refresh for aExpiration: ', aExpiration);

    //https://api.polygon.io/v1/open-close/O:DIS220617C00270000/2021-07-22?adjusted=true&apiKey=XXXXXXXXXXXXXXXX
    const today = new Date()
    const yesterday = new Date(today)

    yesterday.setDate(yesterday.getDate() - 1)
    //today data are $$ and require paying plan
    let aTodayIso = yesterday.toISOString();
    aTodayIso = aTodayIso.substring(0, aTodayIso.indexOf('T'));
    //console.log('aTodayIso:',aTodayIso);

    //V3 MBOUM https://mboum.com/api/v1/op/option/?symbol=EUO&expiration=1660867200
    let aUrlv3 = "https://mboum.com/api/v1/op/option/?symbol=" + aUticker + "&expiration=" + aExpiration
    //console.log('aUrlv3:',aUrlv3);

    //Call or put ?? try to find it from ticker
    let aDirectionNoU = aTicker.replace(aUticker, '');
    //console.log('aDirectionNoU:',aDirectionNoU);
    let aDirectionLetter = aDirectionNoU.substring(6, 7);
    //console.log('aDirectionLetter:',aDirectionLetter);
    let aDirection = "unknow"
    if (aDirectionLetter == "C") {
      aDirection = "calls"
    }
    else if (aDirectionLetter == "P") {
      aDirection = "puts"
    }
    //console.log('aDirection:',aDirection);

    fetch(aUrlv3, {
      "method": "GET",
      "headers": { "X-Mboum-Secret": process.env.MBOUM_KEY }
    })
      .then(response => response.json())
      .then(data => {
        //console.log('Success:', data);
        let aDataFromProvider = data["data"]["optionChain"]["result"][0]["options"][0]
        //console.log('aDataFromProvider:', aDataFromProvider);
        let aOptionDirection = aDataFromProvider[aDirection]
        //console.log('aOptionDirection:', aOptionDirection);
        //now need to find the one matching
        const aMyOption = aOptionDirection.find(({ contractSymbol }) => contractSymbol == aTicker);
        //console.log('aMyOption: ',aMyOption);
        let aValueFromApi = parseFloat(aMyOption["lastPrice"]) * 100 //1 option contains 100 shares
        let aRoundedValue = Math.round((aValueFromApi + Number.EPSILON) * 100) / 100;
        this.unitValue = aRoundedValue
        //console.log('this.unitValue: ',this.unitValue);
        //if (aRefreshNameToo) {
          //console.log('Updating name too');
          //this.name = data["companyName"]
        //}
        this.refreshAnnotationsOptions(aMyOption)
        //console.log('Saving');
        const aCurrentDate = new Date().toISOString()
        //console.log('aCurrentDate:',aCurrentDate);
        this.lastRefresh = aCurrentDate
        this.save()
        //console.log('Saved');
      })
      .catch((error) => {
        console.error('Error:', error);
        //console.error('response:', response);
      });
  }
  else {
    console.error('unknow Asset type:', this);
  }
  //console.log('returning from Asset refresh');
  return this.name
}

module.exports = mongoose.models.Asset || mongoose.model('Asset', AssetSchema)