// api/users.js

import dbConnect from '../../lib/dbConnect'
import Provider from '../../models/Provider'
import providers from '../../wrap/providers'

export default async function handler (req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        providers()
        const aProviders = await Provider.find({})
        res.status(200).json({ success: true, data: aProviders })
      } catch (error) {
        console.log('error: ',error);
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        console.log('POST new provider: ',req.body);
        //const user = await User.create(req.body)
        //res.status(201).json({ success: true, data: user })
        const aNewProvider = new Provider({ uniqueIdentification: req.body["uniqueIdentification"], name: req.body["name"], assetType: req.body["assetType"] });
        await aNewProvider.save();
        res.status(201).json({ success: true, data: aNewProvider })
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