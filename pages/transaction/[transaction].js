import React, { useState, useEffect } from 'react';
import { Table } from '@mantine/core';
import { useRouter } from 'next/router'
import Link from 'next/link';

/////////////////////////////////////// INTERFACE ///////////////////////////////////////

export function TableScrollArea2() {
    const [isLoading, setLoading] = useState(false)
    const [transactionDetail, setTransactionDetail] = useState(
        {
            "name": "Disney",
            "uniqueIdentification": "DIS",
            "holdingInfo": "stock",
            "provider": 20000,
            "quantity": [],
            "paidByUnit": 123.45,
            "date": [],
            "annotations": [{ "key": "TargetAllocation", "value": "1" }, { "key": "cleh2", "value": "valh2" }, { "key": "myNotes", "value": "text" }],
            "action": "50713a3c-ae27-427a-b3b5-214a617a3d39"
        })


    function getTransaction(iTransactionId) {
        //console.log("Entering GetTransaction");
        //console.log("iTransactionId: ",iTransactionId);
        return fetch("/api/transactions?transaction=" + iTransactionId)
            .then((response) => response.json())
            .catch(error => {
                console.error('There was an error to get transactions!', error);
            });
    }

    // Request both students and scores in parallel and return a Promise for both values.
    // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
    function getTransactions(iTransaction) {
        //console.log("building promise with transaction: ", iTransaction);
        //
        return Promise.all([getTransaction(iTransaction)])
    }

    function consolidateInfo(iTransaction) {
        //console.log("consolidateInfo");
        return
    }

    // When this Promise resolves, both values will be available.
    function loadData(iTransaction) {
        //console.log("entering loadData with transaction: ", iTransaction);
        getTransactions(iTransaction)
            .then(([aTransaction]) => {
                let aTrxByProviders = {}
                // both have loaded!
                //console.log("both have loaded");
                //console.log(aTransaction, aTransaction);
                //console.log(aTransactions.data);
                setLoading(false)
                let aTransactionInDb = aTransaction["data"][0]
                consolidateInfo(aTransactionInDb)
                setTransactionDetail(aTransactionInDb)
            })
    }
    const router = useRouter()
    //const { transaction } = router.query
    //console.log("transaction: ",transaction);
    //console.log('fetching UI start');

    useEffect(() => {
        //const router = useRouter()  //can not be call here - forbiden
        if (!router.isReady) return;

        //console.log(router.query); 

        const { transaction } = router.query
        //console.log("transaction defined: ",transaction);
        setLoading(true)
        loadData(transaction)

    }, [router.isReady]) // added router.isReady after https://stackoverflow.com/questions/61040790/userouter-withrouter-receive-undefined-on-query-in-first-render It was empty before. just []


    if (isLoading) return <p>Loading...</p>
    if (!transactionDetail) return <p>No profile data3</p>

    //console.log('fetching UI end');
    //console.log("transactionDetail: ", transactionDetail);
    //console.log("transactionDetail.targetAllocation: ",transactionDetail.targetAllocation);
    //console.log("transactionDetail.transactions: ",transactionDetail.transactions);

    let aTransactionsForTable = []


    return (
        <div>
            Name: {transactionDetail.name}<br />
            uniqueIdentification: {transactionDetail.uniqueIdentification}<br />
            date: {transactionDetail.date}<br />
            quantity: {transactionDetail.quantity}<br />
            provider: {transactionDetail.provider}<br />
            paidByUnit: {transactionDetail.paidByUnit}<br />
            gainCached: {transactionDetail.gainCached}<br />
            action: {transactionDetail.action}<br />
            <br />
        </div>

    );
}

export default TableScrollArea2