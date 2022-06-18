import mongoose from 'mongoose'

const HoldingSchema = new mongoose.Schema({
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
  portfolio: String,
  assetInfo: String
})

HoldingSchema.methods.myvalidation = function (aRefreshNameToo = true) {
  //console.log('Entering validation for : ', this.uniqueIdentification);

  //Mandatory annotation for notes for all asset type
  const aCheckHoldingTypeMandatoryAnnotation = this.annotations.find(({ key }) => key === 'MyNotes');
  console.log(aCheckHoldingTypeMandatoryAnnotation)

  if (!aCheckHoldingTypeMandatoryAnnotation) {
    console.error('Missing mandatory annotation for assetType');
    throw 'Missing mandatory annotation for assetType'
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


HoldingSchema.methods.refresh = function (aRefreshNameToo = false) {
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
        console.log('aStockInfo:', aStockInfo["data"][0]);
        console.log('aCompanyInfo:', aCompanyInfo["data"]["yield"]);

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
        if (aRefreshNameToo) {
          //console.log('Updating name too');
          //this.name = data["companyName"]
        }

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
        if (aRefreshNameToo) {
          //console.log('Updating name too');
          //this.name = data["companyName"]
        }
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
    console.error('unknow Holding type:', this);
  }
  //console.log('returning from Holding refresh');
  return this.name
}

module.exports = mongoose.models.Holding || mongoose.model('Holding', HoldingSchema)