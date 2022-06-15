// api/users.js

import dbConnect from '../../lib/dbConnect'
import Asset from '../../models/Asset'

//https://stackoverflow.com/questions/71851190/how-to-generate-a-uuid-in-nextjs
import { randomUUID } from 'crypto'

export default async function handler (req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        console.log('GET new Asset: ',req.query);
        if (req.query.hasOwnProperty("asset")){
          const aAssetIdKey = req.query["asset"]
          console.log('specific asset specified: ',aAssetIdKey);
          const assets = await Asset.find({uniqueIdentification : aAssetIdKey})
          res.status(200).json({ success: true, data: assets })
        }else if (req.query.hasOwnProperty("portfolio")){
          const aPortfolioKey = req.query["portfolio"]
          //console.log('specific portfolio specified: ',aPortfolioKey);
          const assets = await Asset.find({portfolio : aPortfolioKey})
          const assets2 = await Asset.aggregate([
            {
              $match: {
                portfolio: aPortfolioKey,
              },
            },
            {
              $lookup: {
                from: "transactions",
                localField: "uniqueIdentification",
                foreignField: "assetInfo",
                as: "trxs",
              },
            },
          ])
          //console.log('assets: ',assets);
          //console.log('assets2: ',assets2);
          res.status(200).json({ success: true, data: assets2 })
        }else{
          const assets = await Asset.find({})
        res.status(200).json({ success: true, data: assets })
        }
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        console.log('POST new asset: ',req.body);
        //const user = await User.create(req.body)
        //res.status(201).json({ success: true, data: user })
        const id = randomUUID()
        //console.log('id',id);
        //Hardcode unit value since it is refresh by another script
        const aNewAsset = new Asset({ uniqueIdentification: id, name: req.body["name"], assetType: req.body["assetType"], portfolio: req.body["portfolio"],unitValue: 5,labels: req.body["labels"]});
        //console.log('aNewAsset: ',aNewAsset);
        let aAnnotations = req.body["annotations"]
        //console.log('aAnnotations: ',aAnnotations);
        aAnnotations.forEach(element => {
          // ...use `element`...
          //console.log('working on : ',element);
          aNewAsset.annotations.push(element)
        });
        //console.log('aAnnotations: ',aNewAsset);
        let aValidationResults = await aNewAsset.myvalidation()
        //console.log('aValidationResults: ',aValidationResults);
        await aNewAsset.save();
        res.status(201).json({ success: true, data: aNewAsset })
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