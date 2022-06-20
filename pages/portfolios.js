import React, { useState, useEffect } from 'react';
import { Table } from '@mantine/core';
//import useSWR from 'swr'
import Link from 'next/link';

/////////////////////////////////////// INTERFACE ///////////////////////////////////////

export function TableScrollArea() {
  const [isLoading, setLoading] = useState(false)
  const [portfolios, setPortfolios] = useState(
    [
      {
        "uniqueIdentification": "5145245",
        "name": "Long Term",
        "annotations": [{ "key": "myNotes", "value": "value1" }, { "key": "key2", "value": "value2" }]
      },
    ])

  function getPortfolios() {
    return fetch('/api/portfolios')
      .then((res) => res.json())
      .catch(error => {
        console.error('There was an error to get portfolios!', error);
      });
  };

  // Request both students and scores in parallel and return a Promise for both values.
  // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
  function getHoldingsAndTransactions() {
    //console.log("building promise");
    return Promise.all([getPortfolios()])
  }

  // When this Promise resolves, both values will be available.
  function loadData() {
    getHoldingsAndTransactions()
      .then(([aPortfolios]) => {
        // both have loaded!
        //console.log("both have loaded");
        //console.log(aPortfolios);
        //console.log(aPortfolios.data);
        setLoading(false)
        setPortfolios(aPortfolios.data)
      })
  }

  //console.log('fetching UI start');
  useEffect(() => {
    //console.log("useEffect call");
    setLoading(true)
    loadData()
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!portfolios) return <p>No portfolio to display</p>

  const rows = portfolios.map((row) => (
    <tr key={row.name}>
      <td>
        <Link href={"/portfolio/" + row.uniqueIdentification}>
          <a>{row.name}</a>
        </Link>
      </td>
      <td>{row.annotations.find(x => x.key === 'myNotes').value}</td>
    </tr>
  ));

  return (
    <div>
      <Table>
        <thead>
          <tr>
            <th>name</th>
            <th>my Notes</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>

  );
}

export default TableScrollArea