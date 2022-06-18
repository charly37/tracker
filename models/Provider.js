// models/User.js

import mongoose from 'mongoose'

const ProviderSchema = new mongoose.Schema({
  uniqueIdentification: String,
  name: String,
  assetType: [{
    type: String
  }]
})

ProviderSchema.methods.myvalidation = function () {
  //console.log('Entering validation for : ', this.uniqueIdentification);

  //Mandatory annotation for notes for all asset type
  const aCheckAssetTypeMandatoryAnnotation = this.annotations.find(({ key }) => key === 'MyNotes');
  console.log(aCheckAssetTypeMandatoryAnnotation)

  if (!aCheckAssetTypeMandatoryAnnotation) {
    console.error('Missing mandatory annotation for assetType');
    throw 'Missing mandatory annotation for assetType'
  }

  console.log("all check OK")
  return
}

module.exports = mongoose.models.Provider || mongoose.model('Provider', ProviderSchema)