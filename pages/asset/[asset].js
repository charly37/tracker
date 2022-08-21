import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link';

/////////////////////////////////////// INTERFACE ///////////////////////////////////////

export function TableScrollArea2() {
  const [isLoading, setLoading] = useState(false)

  const [assetObj, setAssetObj] = useState(
      {
        "name": "Disney",
        "uniqueIdentification": "DIS",
        "assetType": "stock",
        "targetAllocation": 1,
        "unitValue": 20000,
        "annotations": [{ "key": "TargetAllocation", "value": "1" }, { "key": "cleh2", "value": "valh2" }, { "key": "myNotes", "value": "text" }],
      })

      const [holdInPort, setholdInPort] = useState(
        [])

  function getAsset(iAssetId) {
    //console.log("Entering GetAsset");
    //console.log("iAssetId: ",iAssetId);
    return fetch("/api/assets?asset=" + iAssetId)
      .then((response) => response.json())
      .catch(error => {
        console.error('There was an error to get assets!', error);
      });
  };

  function getHoldings(iAssetId) {
    return fetch("/api/holdings?asset=" + iAssetId)
      .then((res) => res.json())
      .catch(error => {
        console.error('There was an error to get assets!', error);
      });
  };

  // Request both students and scores in parallel and return a Promise for both values.
  // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
  function getAssetsAndTransactions(iAsset) {
    //console.log("building promise with asset: ", iAsset);
    return Promise.all([getAsset(iAsset),getHoldings(iAsset)])
  }

  function consolidateInfo(iAsset,iHoldings) {

    //console.log("consolidateInfo");
    return
  }

  // When this Promise resolves, both values will be available.
  function loadData(iAsset) {
    //console.log("entering loadData with asset: ", iAsset);
    getAssetsAndTransactions(iAsset)
      .then(([aAsset,aHoldings]) => {
        // both have loaded!
        console.log("both have loaded");
        //console.log("aAsset: ", aAsset);
        //console.log(aTransactions.data);
        console.log(aHoldings.data);
        setLoading(false)
        let aAssetInDb = aAsset["data"][0]
        //console.log("aAssetInDb: ",aAssetInDb);

        //console.log("aTrxByProviders: ",aTrxByProviders);
        consolidateInfo(aAssetInDb,aHoldings)
        setAssetObj(aAssetInDb)
        setholdInPort(aHoldings["data"])
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
  if (!assetObj) return <p>No profile data3</p>

  //console.log('fetching UI end');
  //console.log("assetObj: ",assetObj);

  const aAnnotationsForAsset = assetObj.annotations.map((row) => (
    <li key={row.key + row.value}>
      {row.key}:{row.value}
    </li>
  ));
  console.log("holdInPort: ",holdInPort);
  const aHoldingInPortLinks = holdInPort.map((row) => (
    <li key={row.portfolio}>
      <Link href={"/holding/" + row.uniqueIdentification}>
          <a>{row.uniqueIdentification}</a>
        </Link>
    </li>
  ));



  return (
    <div>
      Name: {assetObj.name}<br />
      uniqueIdentification: {assetObj.uniqueIdentification}<br />
      assetType: {assetObj.assetType}<br />
      unitValue: {assetObj.unitValue}<br />
      lastRefresh: {assetObj.lastRefresh}<br />
      <br />

      <Link href={"/addholdings?asset=" + assetObj.uniqueIdentification}>
        <a>Instanciate as Holding in portfolio</a>
      </Link>
      <br />

      annotations:
      <ul>
        {aAnnotationsForAsset}
      </ul>
      holdings in portfolio:
      <ul>
        {aHoldingInPortLinks}
      </ul>
      <br />

    </div>

  );
}

export default TableScrollArea2