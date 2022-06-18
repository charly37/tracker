import React, { useState, useEffect } from 'react';
import { Table } from '@mantine/core';
import { useRouter } from 'next/router'
import Link from 'next/link';

/////////////////////////////////////// INTERFACE ///////////////////////////////////////

export function TableScrollArea2() {
  const [isLoading, setLoading] = useState(false)
  const [holdingDetail, setHoldingDetail] = useState(
    {
      "name": "Disney",
      "uniqueIdentification": "DIS",
      "assetType": "stock",
      "unitValue": 20000,
      "asset":[{"unitValue": 20000}],
      "targetAllocation": 1,
      "holdings": [],
      "trxs": [],
      "annotations": [{ "key": "TargetAllocation", "value": "1" }, { "key": "cleh2", "value": "valh2" }, { "key": "myNotes", "value": "text" }],
      "portfolio": "50713a3c-ae27-427a-b3b5-214a617a3d39",
      "valueByProviders": { a: 1, b: 2 }
    })


  function getHolding(iHoldingId) {
    //console.log("Entering GetHolding");
    //console.log("iHoldingId: ",iHoldingId);
    return fetch("http://localhost:3000/api/holdings?holding=" + iHoldingId)
      .then((response) => response.json())
      .catch(error => {
        console.error('There was an error to get holdings!', error);
      });
  }

  // Request both students and scores in parallel and return a Promise for both values.
  // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
  function getHoldingsAndTransactions(iHolding) {
    //console.log("building promise with holding: ", iHolding);
    //
    return Promise.all([getHolding(iHolding)])
  }

  function consolidateInfo(iHolding) {
    //console.log("consolidateInfo");
    return
  }

  // When this Promise resolves, both values will be available.
  function loadData(iHolding) {
    //console.log("entering loadData with holding: ", iHolding);
    getHoldingsAndTransactions(iHolding)
      .then(([aHolding]) => {
        let aTrxByProviders = {}
        // both have loaded!
        //console.log("both have loaded");
        //console.log(aTransactions, aHolding);
        //console.log(aTransactions.data);
        setLoading(false)
        let aHoldingInDb = aHolding["data"][0]
        //console.log("aHoldingInDb: ",aHoldingInDb);
        //console.log("aHolding: ",aHolding);
        aHoldingInDb.trxs.forEach(aOneTransaction => {
          //console.log("aOneTransaction: ",aOneTransaction);
          if (aOneTransaction.holdingInfo == aHoldingInDb.uniqueIdentification) {
            if (aHoldingInDb.holdings) {
              aHoldingInDb.holdings.push(aOneTransaction)
              if (aOneTransaction.action == "buy") {
                aHoldingInDb.totalValue = aHoldingInDb.totalValue + aOneTransaction.quantity * aHoldingInDb.unitValue
              }
              else {
                aHoldingInDb.totalValue = aHoldingInDb.totalValue - aOneTransaction.quantity * aHoldingInDb.unitValue
              }
            }
            else {
              //should never be a sell. how can first action on an holding be a sell ?
              aHoldingInDb.holdings = [aOneTransaction]
              aHoldingInDb.totalValue = aOneTransaction.quantity * aHoldingInDb.unitValue
            }
          }

        });
        //do in another loop for future split in function
        aHoldingInDb.trxs.forEach(aOneTransaction => {
          //console.log("aOneTransaction - loop2: ",aOneTransaction);

          if (aOneTransaction.holdingInfo == aHoldingInDb.uniqueIdentification) {
            if (aOneTransaction.provider in aTrxByProviders) {
              if (aOneTransaction.action == "buy") {
                aTrxByProviders[aOneTransaction.provider] = aTrxByProviders[aOneTransaction.provider] + aOneTransaction.quantity * aHoldingInDb.unitValue
              }
              else {
                aTrxByProviders[aOneTransaction.provider] = aTrxByProviders[aOneTransaction.provider] - aOneTransaction.quantity * aHoldingInDb.unitValue
              }
            }
            else {
              //should never be a sell. how can first action on an holding be a sell ?
              if (aOneTransaction.action == "buy") {
                aTrxByProviders[aOneTransaction.provider] = 0 + aOneTransaction.quantity * aHoldingInDb.unitValue
              }
              else {
                aTrxByProviders[aOneTransaction.provider] = 0 - aOneTransaction.quantity * aHoldingInDb.unitValue
              }
            }
          }

        });
        aHoldingInDb.valueByProviders = aTrxByProviders
        let aRoundedTotalValue = Math.round((aHoldingInDb.totalValue + Number.EPSILON) * 100) / 100;
        aHoldingInDb.totalValue = aRoundedTotalValue
        //console.log("aTrxByProviders: ",aTrxByProviders);
        consolidateInfo(aHoldingInDb)
        setHoldingDetail(aHoldingInDb)
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

    const { holding } = router.query
    //console.log("holding defined: ",holding);
    setLoading(true)
    loadData(holding)

  }, [router.isReady]) // added router.isReady after https://stackoverflow.com/questions/61040790/userouter-withrouter-receive-undefined-on-query-in-first-render It was empty before. just []


  if (isLoading) return <p>Loading...</p>
  if (!holdingDetail) return <p>No profile data3</p>

  //console.log('fetching UI end');
  //console.log("holdingDetail: ",holdingDetail);
  //console.log("holdingDetail.targetAllocation: ",holdingDetail.targetAllocation);
  //console.log("holdingDetail.holdings: ",holdingDetail.holdings);

  const aAnnotationsForHolding = holdingDetail.annotations.map((row) => (
    <li key={row.key}>
      {row.key}:{row.value}
    </li>
  ));

  const aValueByPRoviders = Object.entries(holdingDetail.valueByProviders).map((row) => (
    <li key={row}>
      {row[0]}: {row[1].toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </li>
  ));

  let aTransactionsForTable = []

  if (holdingDetail.holdings) {
    aTransactionsForTable = holdingDetail.holdings.map((aOneTrx) => (
      <tr key={aOneTrx.uniqueIdentification}>
        <td>
          <Link href={"/transaction/" + aOneTrx.uniqueIdentification}>
            <a>{aOneTrx.uniqueIdentification}</a>
          </Link>
        </td>
        <td>{aOneTrx.name}</td>
        <td>{aOneTrx.provider}</td>
        <td>{aOneTrx.quantity}</td>
        <td>{aOneTrx.action}</td>
        <td>{aOneTrx.date}</td>
      </tr>
    ));

  }
  else {
    aTransactionsForTable = []
  }


  return (
    <div>
      Name: {holdingDetail.name}<br />
      uniqueIdentification: {holdingDetail.uniqueIdentification}<br />
      holdingType: {holdingDetail.assetType}<br />
      unitValue: {holdingDetail.asset[0].unitValue}<br />
      portfolio: <Link href={"/portfolio/" + holdingDetail.portfolio}>
        <a>{holdingDetail.portfolio}</a>
      </Link>
      <br />
      asset: <Link href={"/asset/" + holdingDetail.assetInfo}>
        <a>{holdingDetail.assetInfo}</a>
      </Link>
      <br />
      <Link href={"/addtransaction?holdinginfo=" + holdingDetail.uniqueIdentification}>
        <a>Add Transaction</a>
      </Link>
      <br />

      annotations:
      <ul>
        {aAnnotationsForHolding}
      </ul>
      <br />

      totalValue: {holdingDetail.totalValue}<br />
      <br />
      Values by providers:
      <ul>
        {aValueByPRoviders}
      </ul>
      <br />
      <br />
      Transactions: <br />
      <br />

      <Table>
        <thead>
          <tr>
            <th>uniqueIdentification</th>
            <th>name</th>
            <th>provider</th>
            <th>quantity</th>
            <th>action</th>
            <th>date</th>
          </tr>
        </thead>
        <tbody>{aTransactionsForTable}</tbody>
      </Table>

    </div>

  );
}

export default TableScrollArea2