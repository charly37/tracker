// api/users.js

import dbConnect from '../../lib/dbConnect'
import Holding from '../../models/Holding'

export default async function handler (req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        const holdings = await Holding.find({})
        holdings.forEach(aOneHolding => {
            //console.log('refreshing aOneHolding: ',aOneHolding);
            aOneHolding.refresh()
            //console.log('refresh aOneHolding: ',aRefreshStatus);
        });
        res.status(200).json({ success: true })
      } catch (error) {
        console.error('Error when refreshing: ',error);
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        console.log('POST new holding: ',req.body);
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