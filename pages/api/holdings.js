// api/users.js

import dbConnect from '../../lib/dbConnect'
import Holding from '../../models/Holding'

//https://stackoverflow.com/questions/71851190/how-to-generate-a-uuid-in-nextjs
import { randomUUID } from 'crypto'

export default async function handler (req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        console.log('GET new Holding: ',req.query);
        if (req.query.hasOwnProperty("holding")){
          const aHoldingIdKey = req.query["holding"]
          //console.log('specific holding specified: ',aHoldingIdKey);
          const holdings2 = await Holding.aggregate([
            {
              $match: {
                uniqueIdentification: aHoldingIdKey,
              },
            },
            {
              $lookup: {
                from: "transactions",
                localField: "uniqueIdentification",
                foreignField: "holdingInfo",
                as: "trxs",
              },
            },
            {
              $lookup: {
                from: "assets",
                localField: "assetInfo",
                foreignField: "uniqueIdentification",
                as: "asset",
              },
            },
          ])
          res.status(200).json({ success: true, data: holdings2 })
        }else if (req.query.hasOwnProperty("portfolio")){
          const aPortfolioKey = req.query["portfolio"]
          //console.log('specific portfolio specified: ',aPortfolioKey);
          const holdings2 = await Holding.aggregate([
            {
              $match: {
                portfolio: aPortfolioKey,
              },
            },
            {
              $lookup: {
                from: "transactions",
                localField: "uniqueIdentification",
                foreignField: "holdingInfo",
                as: "trxs",
              },
            },
            {
              $lookup: {
                from: "assets",
                localField: "assetInfo",
                foreignField: "uniqueIdentification",
                as: "asset",
              },
            },
          ])
          //console.log('holdings: ',holdings);
          //console.log('holdings2: ',holdings2);
          res.status(200).json({ success: true, data: holdings2 })
        }else if (req.query.hasOwnProperty("asset")){
          const aAssetKey = req.query["asset"]
          console.log('specific asset specified: ',aAssetKey);
          const holdings = await Holding.find({assetInfo:aAssetKey})
          res.status(200).json({ success: true, data: holdings })
        }else{
          const holdings = await Holding.find({})
        res.status(200).json({ success: true, data: holdings })
        }
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        console.log('POST new holding: ',req.body);
        //const user = await User.create(req.body)
        //res.status(201).json({ success: true, data: user })
        const id = randomUUID()
        //console.log('id',id);
        //Hardcode unit value since it is refresh by another script
        const aNewHolding = new Holding({ uniqueIdentification: id, name: req.body["name"], assetType: req.body["assetType"], assetInfo: req.body["asset"], portfolio: req.body["portfolio"],unitValue: 5,labels: req.body["labels"]});
        //console.log('aNewHolding: ',aNewHolding);
        let aAnnotations = req.body["annotations"]
        //console.log('aAnnotations: ',aAnnotations);
        aAnnotations.forEach(element => {
          // ...use `element`...
          //console.log('working on : ',element);
          aNewHolding.annotations.push(element)
        });
        //console.log('aAnnotations: ',aNewHolding);
        let aValidationResults = await aNewHolding.myvalidation()
        console.log('aValidationResults: ',aValidationResults);
        console.log('Saving: ',aNewHolding);
        await aNewHolding.save();
        res.status(201).json({ success: true, data: aNewHolding })
      } catch (error) {
        console.log('error: ',error);
        res.status(400).json({ success: false ,errorDetails: error})
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}