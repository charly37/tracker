import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import {Pie, Doughnut} from 'react-chartjs-2';
import {Chart, Title, Legend, ArcElement} from 'chart.js'



export default function Home() {

  Chart.register(ArcElement);
  Chart.register(Title);
  Chart.register(Legend);



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


  return (
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
  )
}
