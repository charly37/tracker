import React, { useState, useEffect } from 'react';
import { Table, Button } from '@mantine/core';
//import useSWR from 'swr'
import Link from 'next/link';

/////////////////////////////////////// INTERFACE ///////////////////////////////////////

export function TableScrollArea() {
  const [isLoading, setLoading] = useState(false)
  const [assets, setAssets] = useState(
    [
      {
        "uniqueIdentification": "5145245",
        "name": "Long Term",
        "assetType": "stock",
        "annotations": [{ "key": "myNotes", "value": "value1" }, { "key": "key2", "value": "value2" }]
      },
    ])

  function getAssets() {
    return fetch('http://localhost:3000/api/assets')
      .then((res) => res.json())
      .catch(error => {
        console.error('There was an error to get assets!', error);
      });
  };

  // Request both students and scores in parallel and return a Promise for both values.
  // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
  function getHoldingsAndTransactions() {
    //console.log("building promise");
    return Promise.all([getAssets()])
  }

  // When this Promise resolves, both values will be available.
  function loadData() {
    getHoldingsAndTransactions()
      .then(([aAssets]) => {
        // both have loaded!
        //console.log("both have loaded");
        //console.log(aAssets);
        //console.log(aAssets.data);
        setLoading(false)
        setAssets(aAssets.data)
      })
  }

  //console.log('fetching UI start');
  useEffect(() => {
    //console.log("useEffect call");
    setLoading(true)
    loadData()
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!assets) return <p>No asset to display</p>

  const rows = assets.map((row) => (
    <tr key={row.name}>
      <td>
        <Link href={"/asset/" + row.uniqueIdentification}>
          <a>{row.name}</a>
        </Link>
      </td>
      <td>{row.assetType}</td>
      <td>{row.annotations.find(x => x.key === 'myNotes').value}</td>
    </tr>
  ));

  return (
    <div>
      <Button >
        <Link href={"/addassets"}>
          <a>add an Asset</a>
        </Link>
      </Button>
      <Table>
        <thead>
          <tr>
            <th>name</th>
            <th>assetType</th>
            <th>my Notes</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>

  );
}

export default TableScrollArea