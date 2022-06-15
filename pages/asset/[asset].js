import React, { useState, useEffect } from 'react';
import { Table } from '@mantine/core';
import { useRouter } from 'next/router'
import Link from 'next/link';

/////////////////////////////////////// INTERFACE ///////////////////////////////////////

export function TableScrollArea2() {
  const [isLoading, setLoading] = useState(false)
  const [assetDetail, setAssetDetail] = useState(
    {
      "name": "Disney",
      "uniqueIdentification": "DIS",
      "assetType": "stock",
      "unitValue": 20000,
      "targetAllocation": 1,
      "assets": [],
      "annotations": [{ "key": "TargetAllocation", "value": "1" }, { "key": "cleh2", "value": "valh2" }, { "key": "myNotes", "value": "text" }],
      "valueByProviders": { a: 1, b: 2 }
    })
  const [assets, setAssets] = useState(
    [
      {
        "name": "Disney",
        "uniqueIdentification": "DIS",
        "assetType": "stock",
        "targetAllocation": 1
      },
    ])

  function getAsset(iAssetId) {
    //console.log("Entering GetAsset");
    //console.log("iAssetId: ",iAssetId);
    return fetch("http://localhost:3000/api/assets?asset=" + iAssetId)
      .then((response) => response.json())
      .catch(error => {
        console.error('There was an error to get assets!', error);
      });
  };

  function getAssetsInfo() {
    return fetch("http://localhost:3000/api/assets")
      .then((response) => response.json())
      .catch(error => {
        console.error('There was an error to get assets!', error);
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
  function getAssetsAndTransactions(iAsset) {
    //console.log("building promise with asset: ", iAsset);
    //
    return Promise.all([getTransactions(), getAsset(iAsset)])
  }

  function consolidateInfo(iAsset) {
    //console.log("consolidateInfo");
    return
  }

  // When this Promise resolves, both values will be available.
  function loadData(iAsset) {
    //console.log("entering loadData with asset: ", iAsset);
    getAssetsAndTransactions(iAsset)
      .then(([aTransactions, aAsset]) => {
        let aTrxByProviders = {}
        // both have loaded!
        //console.log("both have loaded");
        //console.log(aTransactions, aAsset);
        //console.log(aTransactions.data);
        setLoading(false)
        let aAssetInDb = aAsset["data"][0]
        //console.log("aAssetInDb: ",aAssetInDb);
        aTransactions.data.forEach(aOneTransaction => {
          //console.log("aOneTransaction: ",aOneTransaction);
          if (aOneTransaction.assetInfo == aAssetInDb.uniqueIdentification) {
            if (aAssetInDb.assets) {
              aAssetInDb.assets.push(aOneTransaction)
              if (aOneTransaction.action == "buy") {
                aAssetInDb.totalValue = aAssetInDb.totalValue + aOneTransaction.quantity * aAssetInDb.unitValue
              }
              else {
                aAssetInDb.totalValue = aAssetInDb.totalValue - aOneTransaction.quantity * aAssetInDb.unitValue
              }
            }
            else {
              //should never be a sell. how can first action on an asset be a sell ?
              aAssetInDb.assets = [aOneTransaction]
              aAssetInDb.totalValue = aOneTransaction.quantity * aAssetInDb.unitValue
            }
          }

        });
        //do in another loop for future split in function
        aTransactions.data.forEach(aOneTransaction => {
          //console.log("aOneTransaction - loop2: ",aOneTransaction);

          if (aOneTransaction.assetInfo == aAssetInDb.uniqueIdentification) {
            if (aOneTransaction.provider in aTrxByProviders) {
              if (aOneTransaction.action == "buy") {
                aTrxByProviders[aOneTransaction.provider] = aTrxByProviders[aOneTransaction.provider] + aOneTransaction.quantity * aAssetInDb.unitValue
              }
              else {
                aTrxByProviders[aOneTransaction.provider] = aTrxByProviders[aOneTransaction.provider] - aOneTransaction.quantity * aAssetInDb.unitValue
              }
            }
            else {
              //should never be a sell. how can first action on an asset be a sell ?
              if (aOneTransaction.action == "buy") {
                aTrxByProviders[aOneTransaction.provider] = 0 + aOneTransaction.quantity * aAssetInDb.unitValue
              }
              else {
                aTrxByProviders[aOneTransaction.provider] = 0 - aOneTransaction.quantity * aAssetInDb.unitValue
              }
            }
          }

        });
        aAssetInDb.valueByProviders = aTrxByProviders
        let aRoundedTotalValue = Math.round((aAssetInDb.totalValue + Number.EPSILON) * 100) / 100;
        aAssetInDb.totalValue = aRoundedTotalValue
        //console.log("aTrxByProviders: ",aTrxByProviders);
        consolidateInfo(aAssetInDb)
        setAssetDetail(aAssetInDb)
      })
  }
  const router = useRouter()
  //const { asset } = router.query
  //console.log("asset: ",asset);
  //console.log('fetching UI start');

  useEffect(() => {
    //const router = useRouter()  //can not be call here - forbiden
    if (!router.isReady) return;

    //console.log(router.query); 

    const { asset } = router.query
    //console.log("asset defined: ",asset);
    setLoading(true)
    loadData(asset)

  }, [router.isReady]) // added router.isReady after https://stackoverflow.com/questions/61040790/userouter-withrouter-receive-undefined-on-query-in-first-render It was empty before. just []


  if (isLoading) return <p>Loading...</p>
  if (!assetDetail) return <p>No profile data3</p>

  //console.log('fetching UI end');
  //console.log("assetDetail: ",assetDetail);
  //console.log("assetDetail.targetAllocation: ",assetDetail.targetAllocation);
  //console.log("assetDetail.assets: ",assetDetail.assets);

  const aAnnotationsForAsset = assetDetail.annotations.map((row) => (
    <li key={row.key}>
      {row.key}:{row.value}
    </li>
  ));


  let aTransactionsForTable = []

  if (assetDetail.assets) {
    aTransactionsForTable = assetDetail.assets.map((aOneTrx) => (
      <tr key={aOneTrx.uniqueIdentification}>
        <td>
          <Link href={"/asset/" + aOneTrx.uniqueIdentification}>
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
      Name: {assetDetail.name}<br />
      uniqueIdentification: {assetDetail.uniqueIdentification}<br />
      assetType: {assetDetail.assetType}<br />
      unitValue: {assetDetail.unitValue}<br />
      targetAllocation: {assetDetail.targetAllocation}<br />
      portfolio: <Link href={"/portfolio/" + assetDetail.portfolio}>
        <a>{assetDetail.portfolio}</a>
      </Link>
      <br />
      asset: <Link href={"/asset/" + assetDetail.assetInfo}>
        <a>{assetDetail.assetInfo}</a>
      </Link>
      <br />
      <Link href={"/addtransaction?assetinfo=" + assetDetail.uniqueIdentification}>
        <a>Add Transaction</a>
      </Link>
      <br />

      annotations:
      <ul>
        {aAnnotationsForAsset}
      </ul>
      <br />

      totalValue: {assetDetail.totalValue}<br />
      <br />
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