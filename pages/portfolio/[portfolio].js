import React, { useState, useEffect } from 'react';
import { Table, Badge } from '@mantine/core';
import { useRouter } from 'next/router'
import Link from 'next/link';

/////////////////////////////////////// INTERFACE ///////////////////////////////////////

export function TableScrollArea2() {
  const [isLoading, setLoading] = useState(false)
  const [portfolioDetail, setPortfolioDetail] = useState(
    {
      "name": "Long term2",
      "uniqueIdentification": "1587458-95326658",
      "annotations": [{ "key": "clep1", "value": "valp1" }, { "key": "clep2", "value": "valp2" }],
      "holdings": [],
      "totalValue": 500
    })
  const [holdings, setHoldings] = useState(
    [
      {
        "name": "Disney",
        "uniqueIdentification": "DIS",
        "assetType": "stock",
        "labels": ["fun", "foun"],
        "asset":[{"annotations": [{ "key": "clep1", "value": "valp1" }, { "key": "clep2", "value": "valp2" }]}],
        "annotations": [{ "key": "TargetAllocation", "value": "1" }, { "key": "cleh2", "value": "valh2" }, { "key": "myNotes", "value": "text" }],
        "targetAllocation": 1
      },
    ])


  function getPortfolio(iPortfolioId) {
    //console.log("Entering getPortfolio");
    //console.log("iPortfolioId: ", iPortfolioId);
    return fetch('http://localhost:3000/api/portfolios?portfolio=' + iPortfolioId)
      .then((res) => res.json())
      .catch(error => {
        console.error('There was an error to get transactions!', error);
      });
  };

  function getHoldings(iPortfolioId) {
    return fetch("http://localhost:3000/api/holdings?portfolio=" + iPortfolioId)
      .then((response) => response.json())
      .catch(error => {
        console.error('There was an error to get holdings!', error);
      });
  };

  function getTransactions() {
    return fetch('http://localhost:3000/api/transactions')
      .then((res) => res.json())
      .catch(error => {
        console.error('There was an error to get transactions!', error);
      });
  };

  // Request both students and scores in parallel and return a Promise for both values.
  // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
  function getHoldingsAndPortfolio(iPortfolioId) {
    //console.log("building promise with portfolioId: ", iPortfolioId);
    //
    return Promise.all([getPortfolio(iPortfolioId), getHoldings(iPortfolioId)])
  }

  function consolidateInfo(iHoldings, iTotalValue, iPortfolioObj) {
    let aTotalCurrentAllocation = 0.0
    let aTotalTargetAllocation = 0.0
    //console.log("consolidateInfo with iTotalValue: ", iTotalValue);
    iHoldings.data.forEach(aOneHolding => {
      //console.log("working on holding: ", aOneHolding);
      let aPerThousand = 100 * aOneHolding.totalValue / iTotalValue
      let aRoundedCurrentAllocation = Math.round((aPerThousand + Number.EPSILON) * 100) / 100;
      //console.log("aPerThousand: ",aRoundedCurrentAllocation);
      aOneHolding.currentAllocation = aRoundedCurrentAllocation
      aTotalCurrentAllocation = aTotalCurrentAllocation + aOneHolding.currentAllocation
      //let s round total value here too
      let aRoundedTotalValue = Math.round((aOneHolding.totalValue + Number.EPSILON) * 100) / 100;
      aOneHolding.totalValue = aRoundedTotalValue
      let aTargetAllocAnnotationObj = aOneHolding.annotations.find(x => x.key === 'TargetAllocation')
      let aTargetAlloc = 0
      if (aTargetAllocAnnotationObj) {
        //Not all holdings have a target allocation
        aTargetAlloc = aTargetAllocAnnotationObj.value

        let aDiffTargetCurrent = Math.abs(aOneHolding.currentAllocation - aTargetAlloc)
        if (aDiffTargetCurrent > 0.20) {
          aOneHolding.labels.push("FarFromTarget")
          let aWarningAlloc={key:"warning",value:"FarFromTarget"}
          aOneHolding.annotations.push(aWarningAlloc)
        }
      }

      aTotalTargetAllocation = aTotalTargetAllocation + parseFloat(aTargetAlloc)

    });
    let aRoundedTotalTargetAllocation = Math.round((aTotalTargetAllocation + Number.EPSILON) * 100) / 100;
    iPortfolioObj.totalTargetAllocation = aRoundedTotalTargetAllocation
    //console.log("aRoundedTotalTargetAllocation: ", aRoundedTotalTargetAllocation);

    let aRoundedTotalCurrentAllocation = Math.round((aTotalCurrentAllocation + Number.EPSILON) * 100) / 100;
    iPortfolioObj.totalCurrentAllocation = aRoundedTotalCurrentAllocation

    return
  }

  // When this Promise resolves, both values will be available.
  function loadData(iPortfolioId) {
    //getHoldingsAndPortfolioAndTransactions(iPortfolioId)//transaction in holdings now
    getHoldingsAndPortfolio(iPortfolioId)
      .then(([aPortfolio, aHoldings, aTransactions]) => {
        let aTotalValue = 0.0

        // both have loaded!
        //console.log("all data have loaded");
        //console.log("aTransactions: ", aTransactions);
        //console.log("aHoldings: ", aHoldings);
        //console.log("aPortfolio: ", aPortfolio);
        let aPortfolioObj = aPortfolio.data[0]
        //console.log(aTransactions.data);
        setLoading(false)
        aHoldings.data.forEach(aOneHolding => {
          //console.log("Working on holding: ", aOneHolding);
          aOneHolding.totalValue = 0.0
          //aHoldingTransactions = 
          aOneHolding.trxs.forEach(aOneTransaction => {
            //console.log("Working on transaction: ", aOneTransaction);
            //why put transaction again in holding object in holdings field ? it is historical....old code not redesign properly....that s all
            //TODO clean the logic. only use aOneHolding.trxs and not aOneHolding.holdings

            if (aOneHolding.holdings) {
              aOneHolding.holdings.push(aOneTransaction)

              if (aOneTransaction.action == "buy") {
                aOneHolding.totalValue = aOneHolding.totalValue + aOneTransaction.quantity * aOneHolding.asset[0].unitValue
                aTotalValue = aTotalValue + aOneTransaction.quantity * aOneHolding.asset[0].unitValue
              }
              else {
                aOneHolding.totalValue = aOneHolding.totalValue - aOneTransaction.quantity * aOneHolding.asset[0].unitValue
                aTotalValue = aTotalValue - aOneTransaction.quantity * aOneHolding.asset[0].unitValue
              }
            }
            else {
              //should never be a sell. how can first action on an holding be a sell ?
              aOneHolding.holdings = [aOneTransaction]
              aOneHolding.totalValue = aOneTransaction.quantity * aOneHolding.asset[0].unitValue
              aTotalValue = aTotalValue + aOneTransaction.quantity * aOneHolding.asset[0].unitValue
            }
          });

        });
        let aRoundedTotalValue = Math.round((aTotalValue + Number.EPSILON) * 100) / 100;
        aPortfolioObj.totalValue = aRoundedTotalValue

        consolidateInfo(aHoldings, aTotalValue, aPortfolioObj)
        setHoldings(aHoldings.data)
        setPortfolioDetail(aPortfolioObj)
      })
  }

  const router = useRouter()
  //const { holding } = router.query

  //console.log("holding: ",holding);
  //console.log('fetching UI start');

  useEffect(() => {
    //const router = useRouter()  //can not be call here - forbiden
    if (!router.isReady) return;

    //console.log(router.query);

    const { portfolio } = router.query
    //console.log("portfolio defined: ", portfolio);
    setLoading(true)
    loadData(portfolio)

  }, [router.isReady]) // added router.isReady after https://stackoverflow.com/questions/61040790/userouter-withrouter-receive-undefined-on-query-in-first-render It was empty before. just []


  if (isLoading) return <p>Loading...</p>
  if (!portfolioDetail || !holdings) return <p>No profile data3</p>

  //console.log('fetching UI end');
  //console.log("portfolioDetail: ", portfolioDetail);
  //console.log("holdings: ", holdings);
  //console.log("portfolioDetail.targetAllocation: ",portfolioDetail.targetAllocation);
  //console.log("portfolioDetail.holdings: ",portfolioDetail.holdings);

  const aAnnotationsForPortfolio = portfolioDetail.annotations.map((row) => (
    <li key={row.key}>
      {row.key}:{row.value}
    </li>
  ));

  function aCreateHeaderForHoldingsTable() {
    let aTargetAlloc = "yes"
    let aTargetAllocAnnotationObj = portfolioDetail.annotations.find(x => x.key === 'allocation')
    if (aTargetAllocAnnotationObj) {
      //console.log("aTargetAllocAnnotationObj: ", aTargetAllocAnnotationObj);
      aTargetAlloc = aTargetAllocAnnotationObj.value
    }
    if (aTargetAlloc == "yes") {
      //console.log("Target allocation is ON in this portfolio");
      let aHeader = [
        <tr>
          <th>name</th>
          <th>myNotes</th>
          <th>assetType</th>
          <th>labels</th>
          <th>targetAllocation</th>
          <th>currentAllocation</th>
          <th>unitValue</th>
          <th>totalValue</th>
        </tr>
      ];
      return aHeader
      //aHeader = aHeader.filter(e => e !== <th>targetAllocation</th>)
    }
    else {
      //console.log("No target allocation in this portfolio");
      let aHeader = [
        <tr>
          <th>name</th>
          <th>myNotes</th>
          <th>assetType</th>
          <th>labels</th>
          <th>currentAllocation</th>
          <th>unitValue</th>
          <th>totalValue</th>
        </tr>
      ];
      return aHeader
    }
    return aHeader
  }

  function aCreateRowsForHoldingsTable() {
    //console.log("Entering aCreateRowsForHoldingsTable");
    let aTargetAlloc = "yes"
    let aTargetAllocAnnotationObj = portfolioDetail.annotations.find(x => x.key === 'allocation')
    if (aTargetAllocAnnotationObj) {
      //console.log("aTargetAllocAnnotationObj: ", aTargetAllocAnnotationObj);
      aTargetAlloc = aTargetAllocAnnotationObj.value
    }
    if (aTargetAlloc == "no") {
      //console.log("No target allocation in this portfolio");
    }

    //if (aTargetAlloc == "yes") {

      let aRows2 = []
      holdings.forEach(aOneHolding => {
        console.log("working on holding: ", aOneHolding);
        let aPossibleWarnings = aOneHolding.annotations.find(x => x.key === 'warning')
        let aAllPossibleWarningsAssetLevel = aOneHolding.asset[0].annotations.filter(x => x.key === 'warning')
        console.log("aAllPossibleWarningsAssetLevel: ",aAllPossibleWarningsAssetLevel);
        let aWarning = [];
        if (aPossibleWarnings){
          console.log("adding warning: ",aPossibleWarnings);
          aWarning.push(aPossibleWarnings.value)
        }
        if (aAllPossibleWarningsAssetLevel){
          aAllPossibleWarningsAssetLevel.forEach(aOneWarningFromAsset => {
          console.log("adding a warning from asset: ",aOneWarningFromAsset);
          aWarning.push(aOneWarningFromAsset.value)
        });
        }
        //convert to html
        const aWarningsAsJavascript = aWarning.map((row) => (
          <Badge color="red">
            {row}
          </Badge>
        ));

        let aPossibleTargetAlloc = aOneHolding.annotations.find(x => x.key === 'TargetAllocation')
        let aTartgetAnnot;
        if (aPossibleTargetAlloc){
          console.log("adding target alloc");
          aTartgetAnnot = <td>{aPossibleTargetAlloc.value}</td>
        }
        let aOneHoldingEntry = (
          <tr key={aOneHolding.name}>
          <td>
            <Link href={"/holding/" + aOneHolding.uniqueIdentification}>
              <a>{aOneHolding.name}</a>
            </Link>
          </td>
          <td>{aOneHolding.annotations.find(x => x.key === 'myNotes').value}</td>
          <td>{aOneHolding.assetType}</td>
          <td>{aWarningsAsJavascript}</td>
          {aTartgetAnnot}
          <td>{aOneHolding.currentAllocation}</td>
          <td>{aOneHolding.asset[0].unitValue}</td>
          <td>{aOneHolding.totalValue}</td>
        </tr>
          );
          



        aRows2.push(aOneHoldingEntry)
  
      });
      return aRows2

      // let aRows = holdings.map((row) => (
      //   <tr key={row.name}>
      //     <td>
      //       <Link href={"/holding/" + row.uniqueIdentification}>
      //         <a>{row.name}</a>
      //       </Link>
      //     </td>
      //     <td>{row.annotations.find(x => x.key === 'myNotes').value}</td>
      //     <td>{row.assetType}</td>
      //     <td>{row.labels.join()}<Badge color="red">Badge</Badge></td>
      //     <td>{row.annotations.find(x => x.key === 'TargetAllocation').value}</td>
      //     <td>{row.currentAllocation}</td>
      //     <td>{row.unitValue}</td>
      //     <td>{row.totalValue}</td>
      //   </tr>
      // ));
      // return aRows
    


  }

  return (

    <div>
      Name: {portfolioDetail.name}<br />
      uniqueIdentification: {portfolioDetail.uniqueIdentification}<br />
      totalValue: {portfolioDetail.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br />
      totalCurrentAllocation: {portfolioDetail.totalCurrentAllocation}<br />
      totalTargetAllocation: {portfolioDetail.totalTargetAllocation}<br />

      annotations:
      <ul>
        {aAnnotationsForPortfolio}
      </ul>
      <br />

      Holdings(assets in portfolio):<br />
      <br />

      <Table>
        <thead>
          {aCreateHeaderForHoldingsTable()}
        </thead>
        <tbody>{aCreateRowsForHoldingsTable()}</tbody>
      </Table>
    </div>

  );
}

export default TableScrollArea2