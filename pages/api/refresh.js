// api/users.js

import dbConnect from '../../lib/dbConnect'
import Asset from '../../models/Asset'

export default async function handler (req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        const assets = await Asset.find({})
        assets.forEach(aOneAsset => {
            //console.log('refreshing aOneAsset: ',aOneAsset);
            aOneAsset.refresh()
            //console.log('refresh aOneAsset: ',aRefreshStatus);
        });
        res.status(200).json({ success: true })
      } catch (error) {
        console.error('Error when refreshing: ',error);
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        console.log('POST new asset: ',req.body);
        res.status(201).json({ success: true })
      } catch (error) {
        console.log('error: ',error);
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}