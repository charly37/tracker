import React, { useState, useEffect  } from 'react';
import { Button, createStyles, Table, ScrollArea, Badge } from '@mantine/core';
//import useSWR from 'swr'
import Link from 'next/link';

//import Header from "../components/Header";


const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

/////////////////////////////////////// INTERFACE ///////////////////////////////////////

export function TableScrollArea() {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setLoading] = useState(false)
  const [portfolios, setPortfolios] = useState(
  [
    {
      "uniqueIdentification": "5145245",
      "name": "Long Term",
      "annotations": [{"key":"myNotes","value":"value1"},{"key":"key2","value":"value2"}]
        },
  ])
  const [holdings, setHoldings] = useState(
    [
      {
        "name": "Disney",
        "uniqueIdentification": "DIS",
        "assetType": "stock",
        "targetAllocation": 1
      },
    ])

  function getHoldings(){
    return fetch("http://localhost:3000/api/holdings")
    .then((response) => response.json())
    .catch(error => {
      console.error('There was an error to get holdings!', error);
    });
  };

  function getPortfolios(){
    return fetch('http://localhost:3000/api/portfolios')
    .then((res) => res.json())
    .catch(error => {
      console.error('There was an error to get portfolios!', error);
    });
  };

  // Request both students and scores in parallel and return a Promise for both values.
  // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
  function getHoldingsAndTransactions(){
    console.log("building promise");
    //
    return Promise.all([getPortfolios(), getHoldings()])
  }

  function consolidateInfo(iHoldings, iTotalValue){
    console.log("consolidateInfo with iTotalValue: ",iTotalValue);
    iHoldings.data.forEach(aOneHolding => {
      console.log("working on holding: ",aOneHolding);
      let aPerThousand = 100 * aOneHolding.totalValue / iTotalValue
      let aRoundedCurrentAllocation = Math.round((aPerThousand + Number.EPSILON) * 100) / 100;
      console.log("aPerThousand: ",aRoundedCurrentAllocation);
      aOneHolding.currentAllocation = aRoundedCurrentAllocation
      //let s round total value here too
      let aRoundedTotalValue = Math.round((aOneHolding.totalValue + Number.EPSILON) * 100) / 100;
      aOneHolding.totalValue = aRoundedTotalValue
      let aDiffTargetCurrent = Math.abs(aOneHolding.currentAllocation - aOneHolding.targetAllocation)
      if (aDiffTargetCurrent > 0.20){
        aOneHolding.labels.push("FarFromTarget")
      }
    });
    return 
  }

  // When this Promise resolves, both values will be available.
  function loadData(){
    getHoldingsAndTransactions()
    .then(([aPortfolios, aHoldings]) => {
      let aTotalValue = 0.0
      let aTotalAllocation = 0.0
      // both have loaded!
      console.log("both have loaded");
      console.log(aPortfolios, aHoldings);
      console.log(aPortfolios.data);
      setLoading(false)
      //consolidateInfo(aHoldings,aTotalValue)
      setPortfolios(aPortfolios.data)
  })
  }
  

  console.log('fetching UI start');
  useEffect(() => {
    console.log("useEffect call");
    setLoading(true)
    loadData()
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!portfolios) return <p>No portfolio to display</p>

  console.log('fetching UI end');

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

      

    <ScrollArea sx={{ height: 500 }} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table sx={{ minWidth: 700 }}>
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>name</th>
            <th>my Notes</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
    </div>
    

  );
}

export default TableScrollArea