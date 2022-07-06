// api/users.js

import dbConnect from '../../lib/dbConnect'
import Portfolio from '../../models/Portfolio'

//https://stackoverflow.com/questions/71851190/how-to-generate-a-uuid-in-nextjs
import { randomUUID } from 'crypto'

export default async function handler (req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        console.log('GET new portfolio: ',req.query);
        if (req.query.hasOwnProperty("portfolio")){
          const aPortfolioIdKey = req.query["portfolio"]
          console.log('specific asset specified: ',aPortfolioIdKey);
          //const aPortfolio = await Portfolio.find({uniqueIdentification : aPortfolioIdKey})
          const aPortfolio2 = await Portfolio.aggregate([
            {
              $match: {
                uniqueIdentification: aPortfolioIdKey,
              },
            },
            {
              $lookup: {
                from: "holdings",
                localField: "uniqueIdentification",
                foreignField: "portfolio",
                as: "holdings",
              },
            },
          ])
          //console.log('aPortfolio2: ',aPortfolio2);
          res.status(200).json({ success: true, data: aPortfolio2 })
        }else{
          const aPortfolios = await Portfolio.find({})
        res.status(200).json({ success: true, data: aPortfolios })
        }
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        console.log('POST new portfolio with body: ',req.body);
        const id = randomUUID()
        console.log('id',id);

        const aNewPortfolio = new Portfolio({ uniqueIdentification: id, name: req.body["name"]});
        console.log('aNewPortfolio: ',aNewPortfolio);
        let aAnnotations = req.body["annotations"]
        console.log('aAnnotations: ',aAnnotations);
        aAnnotations.forEach(element => {
          // ...use `element`...
          console.log('working on : ',element);
          aNewPortfolio.annotations.push(element)
        });
        console.log('aNewPortfolio after updates: ',aNewPortfolio);
        let aValidationResults = aNewPortfolio.myvalidation()
        console.log('aValidationResults: ',aValidationResults);
        await aNewPortfolio.save();
        res.status(201).json({ success: true, data: aNewPortfolio })
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