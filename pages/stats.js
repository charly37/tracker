import React, { useState, useEffect } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import {Pie, Doughnut} from 'react-chartjs-2';
import {Chart, Title, Legend, ArcElement} from 'chart.js'
import { DatePicker } from '@mantine/dates';




export function Home() {

  Chart.register(ArcElement);
  Chart.register(Title);
  Chart.register(Legend);

  const [isLoading, setLoading] = useState(false)
  const today = new Date()
  const yesterday = new Date(today)
//better ?? d.setMonth(d.getMonth() - 3); ??
yesterday.setDate(yesterday.getDate() - 30)
  const [aDate, setDate] = useState(new Date(yesterday));
  const [stats, setStats] = useState(
    
      {
          "aBought": {
            "amount": 1.84,
            "holdings": {
              "PNQI": 123.55,
              "EFAV": 391.82,
              "VGK230120P00054000": 410
            }
          },
          "aSold": {
            "amount": 1.12,
            "holdings": {
              "FXF": 1679.19,
              "PSY": 109.78
            }
          }
      }
    )



  const state = {
    labels: ['January', 'February', 'March',
             'April', 'May'],
    datasets: [
      {
        label: 'Rainfall',
        backgroundColor: [
          '#B21F00',
          '#C9DE00',
          '#2FDE00',
          '#00A6B4',
          '#6800B4'
        ],
        hoverBackgroundColor: [
        '#501800',
        '#4B5000',
        '#175000',
        '#003350',
        '#35014F'
        ],
        data: [65, 59, 80, 81, 56]
      }
    ]
  }

  function getStats() {

    console.log('addTransactions with aDate: ', aDate.toISOString());
    let uri = '/api/stats?boughtdate=' + aDate.toISOString()
    let encoded = encodeURI(uri);
    return fetch(encoded)
      .then((res) => res.json())
      .catch(error => {
        console.error('There was an error to get portfolios!', error);
      });
  };

  

  // Request both students and scores in parallel and return a Promise for both values.
  // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
  function getData() {
    console.log("building promise");
    return Promise.all([getStats()])
  }

    // When this Promise resolves, both values will be available.
    function loadData() {
      getData()
        .then(([aStats]) => {
          // both have loaded!
          //console.log("both have loaded");
          //console.log(aPortfolios);
          console.log("stats in load: ",aStats);
          setLoading(false)
          setStats(aStats.data)
          console.log('stats after load: ', stats);
        })
    }

    //console.log('fetching UI start');
    useEffect(() => {
      console.log("useEffect call. aDate:",aDate);
      setLoading(true)
      //setDate(new Date(yesterday)
      loadData()
    }, [aDate])

    if (isLoading) return <p>Loading...</p>
    console.log('stats.aBought.holdings: ', stats.aBought.holdings);

    // const aBuyDetail = stats.aBought.holdings.map((row) => (
    //   <li key={row}>
    //     {row}
    //   </li>
    // ));
    //console.log('aBuyDetail: ', aBuyDetail);
    // const aSoldDetail = stats.aSold.holdings.map((row) => (
    //   <li key={row}>
    //     {row}
    //   </li>
    // ));


  return (
    <div>
        <div>
        <DatePicker required placeholder="Pick date" label="date" value={aDate}
            onChange={(v) => setDate(v)} />
          Amount bought: {stats.aBought.amount}<br />
      <br />
          Amount sold: {stats.aSold.amount}<br />
      <br />
          </div>
          <div>
        <Pie
          data={state}
          options={{
            maintainAspectRatio: false,
            plugins:{
              title:{
                display:true,
                text:'Average Rainfall per month',
                fontSize:10
              },
              legend:{
                display:true,
                position:'right'
              }
            },
            title:{
              display:true,
              text:'Average Rainfall per month',
              fontSize:10
            },
            legend:{
              display:true,
              position:'right'
            }
          }}
        />
        </div>
        </div>
  )
}

export default Home