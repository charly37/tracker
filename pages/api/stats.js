// api/users.js

import dbConnect from '../../lib/dbConnect'
import Holding from '../../models/Holding'
import Transaction from '../../models/Transaction'

//https://stackoverflow.com/questions/71851190/how-to-generate-a-uuid-in-nextjs
import { randomUUID } from 'crypto'

function parser(aTrx) {
  console.log('aTrx: ', aTrx);
  let aBoughtAmount = 0.0
  let aSellAmount = 0.0
  aTrx.forEach(aOneTransaction => {
    console.log('aOneTransaction: ', aOneTransaction);
    if (aOneTransaction.action === "buy") {
      aBoughtAmount = aBoughtAmount + parseFloat(aOneTransaction.paidByUnit) * parseFloat(aOneTransaction.quantity)
      console.log('aBoughtAmount: ', aBoughtAmount);
    }
    else if (aOneTransaction.action === "sell") {
      aSellAmount = aSellAmount + aOneTransaction.paidByUnit * parseFloat(aOneTransaction.quantity)
    }
    else {
      console.log('unknow action for trx: ', aTrx);
    }
  });
  console.log('aBoughtAmount: ', aBoughtAmount);
  return [{ "aBoughtAmount": aBoughtAmount, "aSellAmount": aSellAmount }]
}

function parser2(aHoldings,iStartDate) {
  //console.log('aHoldings: ', aHoldings);
  let aStats = { aBought: { amount: 0, holdings: new Map() }, aSold: { amount: 0, holdings: new Map() } }
  let aBoughtAmount = 0.0
  let aSellAmount = 0.0
  aHoldings.forEach(aOneHolding => {
    //console.log('aOneHolding: ', aOneHolding);
    aOneHolding.trxs.forEach(aOneTransaction => {
      if(aOneTransaction.date>iStartDate){
        if (aOneTransaction.action === "buy") {
          aBoughtAmount = aBoughtAmount + parseFloat(aOneTransaction.paidByUnit) * parseFloat(aOneTransaction.quantity)
          if(!aStats.aBought.holdings.has(aOneHolding.name)){
            aStats.aBought.holdings.set(aOneHolding.name,0)
          }
          let aPreviousAmount = aStats.aBought.holdings.get(aOneHolding.name)
          let aNewAmount = aPreviousAmount+ parseFloat(aOneTransaction.paidByUnit) * parseFloat(aOneTransaction.quantity)
          aNewAmount = Math.round((aNewAmount + Number.EPSILON) * 100) / 100
          aStats.aBought.holdings.set(aOneHolding.name,aNewAmount)
          //console.log('aBoughtAmount: ', aBoughtAmount);
        }
        else if (aOneTransaction.action === "sell") {
          aSellAmount = aSellAmount + aOneTransaction.paidByUnit * parseFloat(aOneTransaction.quantity)
          if(!aStats.aSold.holdings.has(aOneHolding.name)){
            aStats.aSold.holdings.set(aOneHolding.name,0)
          }
          let aPreviousAmount = aStats.aSold.holdings.get(aOneHolding.name)
          let aNewAmount = aPreviousAmount+ parseFloat(aOneTransaction.paidByUnit) * parseFloat(aOneTransaction.quantity)
          aNewAmount = Math.round((aNewAmount + Number.EPSILON) * 100) / 100
          aStats.aSold.holdings.set(aOneHolding.name,aNewAmount)
        }
        else {
          console.log('unknow action for trx: ', aTrx);
        }
      }
      
    });
  });
  console.log('aStats: ', aStats);
  return aStats
}

function parser3(aHoldings,iStartDate) {
  //console.log('aHoldings: ', aHoldings);
  let aStats = { aBought: { amount: 0, holdings: {} }, aSold: { amount: 0, holdings: {} } }
  let aBoughtAmount = 0.0
  let aSellAmount = 0.0
  aHoldings.forEach(aOneHolding => {
    //console.log('aOneHolding: ', aOneHolding);
    aOneHolding.trxs.forEach(aOneTransaction => {
      if(aOneTransaction.date>iStartDate){
        if (aOneTransaction.action === "buy") {
          aStats.aBought.amount = aStats.aBought.amount + parseFloat(aOneTransaction.paidByUnit) * parseFloat(aOneTransaction.quantity)
          aStats.aBought.amount = Math.round((aStats.aBought.amount + Number.EPSILON) * 100) / 100
          if(!aStats.aBought.holdings.hasOwnProperty(aOneHolding.name)){
            aStats.aBought.holdings[aOneHolding.name]=0
          }
          let aPreviousAmount = aStats.aBought.holdings[aOneHolding.name]
          let aNewAmount = aPreviousAmount+ parseFloat(aOneTransaction.paidByUnit) * parseFloat(aOneTransaction.quantity)
          aNewAmount = Math.round((aNewAmount + Number.EPSILON) * 100) / 100
          aStats.aBought.holdings[aOneHolding.name]=aNewAmount
          //console.log('aBoughtAmount: ', aBoughtAmount);
        }
        else if (aOneTransaction.action === "sell") {
          aStats.aSold.amount = aStats.aSold.amount + aOneTransaction.paidByUnit * parseFloat(aOneTransaction.quantity)
          aStats.aSold.amount= Math.round((aStats.aSold.amount + Number.EPSILON) * 100) / 100
          if(!aStats.aSold.holdings.hasOwnProperty(aOneHolding.name)){
            aStats.aSold.holdings[aOneHolding.name]=0
          }
          let aPreviousAmount = aStats.aSold.holdings[aOneHolding.name]
          let aNewAmount = aPreviousAmount+ parseFloat(aOneTransaction.paidByUnit) * parseFloat(aOneTransaction.quantity)
          aNewAmount = Math.round((aNewAmount + Number.EPSILON) * 100) / 100
          aStats.aSold.holdings[aOneHolding.name]=aNewAmount
        }
        else {
          console.log('unknow action for trx: ', aTrx);
        }
      }
      
    });
  });
  console.log('aStats: ', aStats);
  return aStats
}

async function handler(req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        //console.log('GET stats: ', req.query);
        if (req.query.hasOwnProperty("boughtmonth")) {
          const aHoldingIdKey = req.query["boughtmonth"]
          console.log('bought last month: ');
          const aNow = new Date()
          console.log('aNow: ', aNow);
          const aCurrentDate = new Date().toISOString()
          console.log('aCurrentDate:', aCurrentDate);
          const today = new Date()
          const yesterday = new Date(today)
          //better ?? d.setMonth(d.getMonth() - 3); ??
          yesterday.setDate(yesterday.getDate() - 30)
          console.log('yesterday:', yesterday);
          //today data are $$ and require paying plan
          let aTodayIso = yesterday.toISOString();

          aTodayIso = aTodayIso.substring(0, aTodayIso.indexOf('T'));
          console.log('aTodayIso:', aTodayIso);
          const holdings2 = await Transaction.find(
            { date: { $gt: yesterday } }
          )
          //FILTER not allowed in atlas free - keep for reference
          // const holdings3 = await Holding.aggregate([

          //   {
          //     $lookup: {
          //       from: "transactions",
          //       localField: "uniqueIdentification",
          //       foreignField: "holdingInfo",
          //       as: "trxs",
          //     },
          //   },
          //   {
          //     $filter: {
          //       input: "$trxs", 
          //       as: "trx", 
          //       cond: { $gte: [ "$$trx.date", yesterday ] }
          //     },
          //   },

          // ])
          const holdings3 = await Holding.aggregate([
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
          //console.log('holdings3: ', holdings3);
          const aAnalysis = parser3(holdings3,yesterday)
          console.log('aAnalysis: ', aAnalysis);
          res.status(200).json({ success: true, data: aAnalysis })
        } else if (req.query.hasOwnProperty("portfolios")) {
          const holdings = await Holding.find({})
          res.status(200).json({ success: true, data: holdings })
        }
      } catch (error) {
        console.error('Catching error: ', error);
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        console.log('POST new holding: ', req.body);
        //const user = await User.create(req.body)
        //res.status(201).json({ success: true, data: user })
        const id = randomUUID()
        //console.log('id',id);
        //Hardcode unit value since it is refresh by another script
        const aNewHolding = new Holding({ uniqueIdentification: id, name: req.body["name"], assetType: req.body["assetType"], portfolio: req.body["portfolio"], unitValue: 5, labels: req.body["labels"] });
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
        //console.log('aValidationResults: ',aValidationResults);
        await aNewHolding.save();
        res.status(201).json({ success: true, data: aNewHolding })
      } catch (error) {
        console.log('error: ', error);
        res.status(400).json({ success: false, errorDetails: error })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}

export default handler;