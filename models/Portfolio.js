// models/User.js

import mongoose from 'mongoose'

const PortfolioSchema = new mongoose.Schema({
  uniqueIdentification: String,
  name: String,
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


PortfolioSchema.methods.refresh = function (aRefreshNameToo = true) {
  console.error('Entering refresh for : ', this.uniqueIdentification);
  if (this.assetType == "stock") {
    console.error('working on refresh for stock: ', this.uniqueIdentification);

    fetch("https://cloud.iexapis.com/stable/stock/" + this.uniqueIdentification + "/quote?token=sk_d36b66e0857745c1b1d15f8330696a25", {
      "method": "GET",
      "headers": {}
    })
      .then(response => response.json())
      .then(data => {
        //console.log('Success:', data);
        this.unitValue = data["latestPrice"]
        if (aRefreshNameToo){
          console.log('Updating name too');
          this.name = data["companyName"]
        }
        
        this.save()
      })
      .catch((error) => {
        console.error('Error:', error);
        console.error('response:', response);
      });

  }
  else if (this.assetType == "crypto") {
    //IEX has no API to get name of crypto so aRefreshNameToo is not use here

    console.error('working on refresh for crypto: ', this.uniqueIdentification);

    fetch("https://cloud.iexapis.com/stable/crypto/" + this.uniqueIdentification + "/price?token=sk_d36b66e0857745c1b1d15f8330696a25", {
      "method": "GET",
      "headers": {}
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        this.unitValue = data["price"]
        console.log('Price save:', data["price"]);
        this.save()
      })
      .catch((error) => {
        console.error('Error:', error);
      });

  }
  else {
    console.error('unknow asset type:', this);
  }
  return this.name
}

module.exports = mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema)