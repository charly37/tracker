// api/users.js

import dbConnect from '../../lib/dbConnect'
import Transaction from '../../models/Transaction'

//https://stackoverflow.com/questions/71851190/how-to-generate-a-uuid-in-nextjs
import { randomUUID } from 'crypto'

export default async function handler (req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        console.log('GettingRequest for transaction API');
        const aTransactions = await Transaction.find({})
        //const tkkk = {"aa":"aa"}
        console.log('Returning OK for transaction API');
        res.status(200).json({ success: true, data: aTransactions })
      } catch (error) {
        console.error('Error when adding transaction: ', error);
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        console.log('POST new transaction',req.body);
        //const user = await User.create(req.body)
        //res.status(201).json({ success: true, data: user })
        const id = randomUUID()
        //console.log('id',id);

        const aNewTransaction = new Transaction({ uniqueIdentification: id, holdingInfo: req.body["holdingInfo"], name: req.body["name"], provider: req.body["provider"], quantity: req.body["quantity"], date: req.body["date"], action: req.body["action"] });
        console.log('Transaction to add: ',aNewTransaction);
        await aNewTransaction.save();
        //This was old way. Now Trx are store in holdings
        
        // const aHoldingId = req.body["holdingInfo"]
        // console.log('Getting holding with uniqueIdentification: ',aHoldingId);
        // const aHolding = await Holding.find({uniqueIdentification : aHoldingId})
        // console.log('aHolding: ',aHolding);
        res.status(201).json({ success: true })
      } catch (error) {
        console.error('Error when adding transaction: ', error);
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}