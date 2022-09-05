import React, { useState, useEffect } from 'react';
import { Table, Button } from '@mantine/core';
//import useSWR from 'swr'
import Link from 'next/link';

/////////////////////////////////////// INTERFACE ///////////////////////////////////////

export function TableScrollArea() {
  const [isLoading, setLoading] = useState(false)
  const [providers, setProviders] = useState(
    [
      {
        "uniqueIdentification": "5145245",
        "name": "Long Term",
        "value": 5,
        "annotations": [{ "key": "myNotes", "value": "value1" }, { "key": "key2", "value": "value2" }]
      },
    ])

  function getProviders() {
    return fetch('/api/providers')
      .then((res) => res.json())
      .catch(error => {
        console.error('There was an error to get providers!', error);
      });
  };

  function getSplitByProviders() {
    return fetch('/api/holdings?providers=a')
      .then((res) => res.json())
      .catch(error => {
        console.error('There was an error to get providers!', error);
      });
  };

  // Request both students and scores in parallel and return a Promise for both values.
  // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
  function getHoldingsAndTransactions() {
    //console.log("building promise");
    return Promise.all([getProviders(),getSplitByProviders()])
  }

  // When this Promise resolves, both values will be available.
  function loadData() {
    getHoldingsAndTransactions()
      .then(([aProviders,aSplitByProviders]) => {
        // both have loaded!
        //console.log("both have loaded");
        console.log('aProviders.data:',aProviders.data);
        console.log('aSplitByProviders.data',aSplitByProviders.data);
        aProviders.data.forEach(element => {
          console.log('element:',element);
          element.value=aSplitByProviders.data[element.uniqueIdentification]

        });
        setLoading(false)
        setProviders(aProviders.data)
      })
  }

  //console.log('fetching UI start');
  useEffect(() => {
    //console.log("useEffect call");
    setLoading(true)
    loadData()
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!providers) return <p>No provider to display</p>

  const rows = providers.map((row) => (
    <tr key={row.name}>
      <td>
        <Link href={"/provider/" + row.uniqueIdentification}>
          <a>{row.name}</a>
        </Link>
      </td>
      <td>{row.uniqueIdentification}</td>
      <td>{row.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
      <td>{row.annotations.find(x => x.key === 'myNotes').value}</td>
    </tr>
  ));

  return (
    <div>
      <Button>
            <Link href={"/addprovider"}>
        <a>add an Provider</a>
      </Link>
      </Button>
      <Table>
        <thead>
          <tr>
            <th>name</th>
            <th>uniqueIdentification</th>
            <th>value</th>
            <th>my Notes</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>

  );
}

export default TableScrollArea