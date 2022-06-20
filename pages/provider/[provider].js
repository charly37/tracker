import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'

/////////////////////////////////////// INTERFACE ///////////////////////////////////////

export function TableScrollArea2() {
    const [isLoading, setLoading] = useState(false)
    const [providerDetail, setProviderDetail] = useState(
        {
            "name": "Long term2",
            "uniqueIdentification": "1587458-95326658",
            "annotations": [{ "key": "clep1", "value": "valp1" }, { "key": "clep2", "value": "valp2" }]
        })


    function getProvider(iProviderId) {
        //console.log("Entering getProvider");
        //console.log("iProviderId: ", iProviderId);
        return fetch('/api/providers?provider=' + iProviderId)
            .then((res) => res.json())
            .catch(error => {
                console.error('There was an error to get transactions!', error);
            });
    };


    // Request both students and scores in parallel and return a Promise for both values.
    // `Promise.all` returns a new Promise that resolves when all of its arguments resolve.
    function getHoldingsAndProvider(iProviderId) {
        //console.log("building promise with providerId: ", iProviderId);
        //
        return Promise.all([getProvider(iProviderId)])
    }

    // When this Promise resolves, both values will be available.
    function loadData(iProviderId) {
        //getHoldingsAndProviderAndTransactions(iProviderId)//transaction in holdings now
        getHoldingsAndProvider(iProviderId)
            .then(([aProvider]) => {
                //console.log("aProvider: ", aProvider);
                let aProviderObj = aProvider.data[0]
                setLoading(false)
                setProviderDetail(aProviderObj)
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

        const { provider } = router.query
        //console.log("provider defined: ", provider);
        setLoading(true)
        loadData(provider)

    }, [router.isReady]) // added router.isReady after https://stackoverflow.com/questions/61040790/userouter-withrouter-receive-undefined-on-query-in-first-render It was empty before. just []


    if (isLoading) return <p>Loading...</p>
    if (!providerDetail) return <p>No profile data3</p>

    //console.log("providerDetail: ", providerDetail);

    const aAnnotationsForProvider = providerDetail.annotations.map((row) => (
        <li key={row.key}>
            {row.key}:{row.value}
        </li>
    ));

    return (

        <div>
            Name: {providerDetail.name}<br />
            uniqueIdentification: {providerDetail.uniqueIdentification}<br />

            annotations:
            <ul>
                {aAnnotationsForProvider}
            </ul>
            <br />
        </div>

    );
}

export default TableScrollArea2