import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Switch  } from '@mantine/core';
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
      "valueCached": 500
    })
  const [holdings, setHoldings] = useState(
    [
      {
        "name": "Disney",
        "uniqueIdentification": "DIS",
        "assetType": "stock",
        "labels": ["fun", "foun"],
        "asset": [{ "annotations": [{ "key": "clep1", "value": "valp1" }, { "key": "clep2", "value": "valp2" }] }],
        "annotations": [{ "key": "TargetAllocation", "value": "1" }, { "key": "cleh2", "value": "valh2" }, { "key": "myNotes", "value": "text" }],
        "targetAllocation": 1
      },
    ])

    const [checked, setChecked] = useState(false);


  function getPortfolio(iPortfolioId) {
    //console.log("Entering getPortfolio");
    //console.log("iPortfolioId: ", iPortfolioId);
    return fetch('/api/portfolios?portfolio=' + iPortfolioId)
      .then((res) => res.json())
      .catch(error => {
        console.error('There was an error to get transactions!', error);
      });
  };

  function getHoldings(iPortfolioId) {
    return fetch("/api/holdings?portfolio=" + iPortfolioId)
      .then((response) => response.json())
      .catch(error => {
        console.error('There was an error to get holdings!', error);
      });
  };

  // Request both students and scores in parallel and return a Promise for both values.
  // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
  function getHoldingsAndPortfolio(iPortfolioId) {
    //console.log("building promise with portfolioId: ", iPortfolioId);
    //
    return Promise.all([getPortfolio(iPortfolioId), getHoldings(iPortfolioId)])
  }

  function consolidateInfo(iHoldings, iPortfolioObj) {
    let aTotalCurrentAllocation = 0.0
    let aTotalTargetAllocation = 0.0
    //console.log("consolidateInfo with iTotalValue: ", iTotalValue);
    iHoldings.data.forEach(aOneHolding => {
      //console.log("working on holding: ", aOneHolding);
      let aPerThousand = 100 * aOneHolding.actualValueCached / iPortfolioObj.valueCached
      let aRoundedCurrentAllocation = Math.round((aPerThousand + Number.EPSILON) * 100) / 100;
      //console.log("aPerThousand: ",aRoundedCurrentAllocation);
      aOneHolding.currentAllocation = aRoundedCurrentAllocation
      aTotalCurrentAllocation = aTotalCurrentAllocation + aOneHolding.currentAllocation
      let aTargetAllocAnnotationObj = aOneHolding.annotations.find(x => x.key === 'TargetAllocation')
      let aTargetAlloc = 0
      if (aTargetAllocAnnotationObj) {
        //Not all holdings have a target allocation
        aTargetAlloc = aTargetAllocAnnotationObj.value

        let aDiffTargetCurrent = Math.abs(aOneHolding.currentAllocation - aTargetAlloc)
        if (aDiffTargetCurrent > 0.20) {
          let aWarningAlloc = { key: "warning", value: "FarFromTarget" }
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

        // both have loaded!
        //console.log("all data have loaded");
        //console.log("aHoldings: ", aHoldings);
        //console.log("aPortfolio: ", aPortfolio);
        let aPortfolioObj = aPortfolio.data[0]
        //console.log(aTransactions.data);
        setLoading(false)

        consolidateInfo(aHoldings, aPortfolioObj)
        setHoldings(aHoldings.data)
        setPortfolioDetail(aPortfolioObj)
        console.log("aPortfolioObj: ",aPortfolioObj);
        console.log("aHoldings.data: ",aHoldings.data);
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
        <tr key={"aa"}>
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
        <tr key={"aa"}>
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
      //console.log("working on holding: ", aOneHolding);
      let aPossibleWarnings = aOneHolding.annotations.find(x => x.key === 'warning')
      let aPossibleGoodWarnings = aOneHolding.annotations.find(x => x.key === 'goodWarning')
      let aAllPossibleWarningsAssetLevel = aOneHolding.asset[0].annotations.filter(x => x.key === 'warning')
      let aAllPossibleGoodWarningsAssetLevel = aOneHolding.asset[0].annotations.filter(x => x.key === 'goodWarning')
      //console.log("aAllPossibleWarningsAssetLevel: ",aAllPossibleWarningsAssetLevel);
      let aWarning = [];
      let aGoodWarning = [];
      if (aPossibleWarnings) {
        //console.log("adding warning: ",aPossibleWarnings);
        aWarning.push(aPossibleWarnings.value)
      }
      if (aPossibleGoodWarnings) {
        //console.log("adding good warning: ",aPossibleGoodWarnings);
        aGoodWarning.push(aPossibleGoodWarnings.value)
      }
      if (aAllPossibleWarningsAssetLevel) {
        aAllPossibleWarningsAssetLevel.forEach(aOneWarningFromAsset => {
          //console.log("adding a warning from asset: ",aOneWarningFromAsset);
          aWarning.push(aOneWarningFromAsset.value)
        });
      }
      if (aAllPossibleGoodWarningsAssetLevel) {
        aAllPossibleGoodWarningsAssetLevel.forEach(aOneWarningFromAsset => {
          //console.log("adding a good warning from asset: ",aOneWarningFromAsset);
          aGoodWarning.push(aOneWarningFromAsset.value)
        });
      }
      //convert to html
      const aWarningsAsJavascript = aWarning.map((row) => (
        <Badge color="red" key={row}>
          {row}
        </Badge>
      ));
      const aGoodWarningAsJavascript = aGoodWarning.map((row) => (
        <Badge color="green" key={row}>
          {row}
        </Badge>
      ));

      let aPossibleTargetAlloc = aOneHolding.annotations.find(x => x.key === 'TargetAllocation')
      let aTartgetAnnot;
      if (aPossibleTargetAlloc) {
        //console.log("adding target alloc");
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
          <td>{aOneHolding.asset[0].assetType}</td>
          <td>{aWarningsAsJavascript}{aGoodWarningAsJavascript}</td>
          {aTartgetAnnot}
          <td>{aOneHolding.currentAllocation}</td>
          <td>{aOneHolding.asset[0].unitValue}</td>
          <td>{aOneHolding.actualValueCached}</td>
        </tr>
      );

if ((aOneHolding.actualValueCached > 0) || (checked)){
  aRows2.push(aOneHoldingEntry)
}

      

    });
    return aRows2
  }

  return (

    <div>
      Name: {portfolioDetail.name}<br />
      uniqueIdentification: {portfolioDetail.uniqueIdentification}<br />
      valueCached: {portfolioDetail.valueCached.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br />
      totalCurrentAllocation: {portfolioDetail.totalCurrentAllocation}<br />
      totalTargetAllocation: {portfolioDetail.totalTargetAllocation}<br />
      avgYieldCached: {portfolioDetail.avgYieldCached}<br />

      annotations:
      <ul>
        {aAnnotationsForPortfolio}
      </ul>
      <br />

      
      <br />
      <Switch checked={checked} label="show 0 balance" onChange={(event) => setChecked(event.currentTarget.checked)} />
      <br />

      Holdings(assets in portfolio):<br />
      <Button >
        <Link href={"/addholdings?portfolio=" + portfolioDetail.uniqueIdentification}>
          <a>Add Holding</a>
        </Link>
      </Button>
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