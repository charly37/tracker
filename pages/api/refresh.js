// api/users.js

import dbConnect from '../../lib/dbConnect'
import Asset from '../../models/Asset'
import Holding from '../../models/Holding'
import Portfolio from '../../models/Portfolio'

export default async function handler(req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        const assets = await Asset.find({})
        const aHoldings = await Holding.find({})
        const aPortfolios = await Portfolio.find({})
        //VTI(USA stock AVG) yield for comparaison
        let aVtiYield = 1.0
        const aVtiAsset = await Asset.find({ uniqueIdentification: "6350538b-aaf2-40cf-9597-67b14cbdb023" })
        //console.log('aVtiAsset: ', aVtiAsset);
        const aVtiYieldAnot = aVtiAsset[0].annotations.find(({ key }) => key === 'yield');
        if (aVtiYieldAnot) {
          aVtiYield = parseFloat(aVtiYieldAnot.value)
        }
        else {
          console.error('Missing yield in VTI ');
        }
        //console.log('aVtiYield: ', aVtiYield);
        assets.forEach(aOneAsset => {
          //console.log('refreshing aOneAsset: ',aOneAsset);
          aOneAsset.refresh(aVtiYield)
          //console.log('refresh aOneAsset: ',aRefreshStatus);
        });
        //move into portfolio refresh
        // aHoldings.forEach(aOneAsset => {
        //   //console.log('refreshing aOneAsset: ',aOneAsset);
        //   aOneAsset.refresh(aVtiYield)
        //   //console.log('refresh aOneAsset: ',aRefreshStatus);
        // });
        aPortfolios.forEach(aPortfolio => {
          //console.log('refreshing aPortfolio: ',aPortfolio);
          aPortfolio.refresh()
          //console.log('refresh aOneAsset: ',aRefreshStatus);
        });
        res.status(200).json({ success: true })
      } catch (error) {
        console.error('Error when refreshing: ', error);
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        console.log('POST new asset: ', req.body);
        res.status(201).json({ success: true })
      } catch (error) {
        console.log('error: ', error);
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}