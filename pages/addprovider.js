import React, { useState, useEffect } from 'react';
import { TextInput, Group, Button, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from "next/router";

function ContainedInputs() {


    const form = useForm({
        initialValues: {
            name: 'RobinHood',
            uniqueIdentification: 'RH',
            assetType: 'stock;options'

        },
    });

    const [getDate, setDate] = useState();
    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Submitted!");
    };



    async function addProvider(ivalues) {
        //window.localStorage.removeItem("stackName");
        console.log('addProvider with values: ', ivalues);
        let aSplitedAssetType=ivalues.assetType.split(";")
        console.log('aSplitedAssetType: ',aSplitedAssetType);
        let provider2add = { name: ivalues.name, uniqueIdentification: ivalues.uniqueIdentification, assetType: aSplitedAssetType }
        console.log('provider2add: ', provider2add);
        let test = JSON.stringify(provider2add)
        console.log('test: ', test);
        const res = await fetch(
            'api/providers',
            {

                body: test,
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            }
        )

        const result = await res.json()


    }
    //const { query } = useRouter();
    //console.log('query: ',query);


    const router = useRouter()
    useEffect(() => {
        //const router = useRouter()  //can not be call here - forbiden
        if (!router.isReady) return;

        console.log(router.query);

        const params = router.query
        console.log("router ready: ", params);
        if (router.query['providerinfo']) {
            form.setFieldValue('providerinfo', router.query['providerinfo'])
        }
        //setLoading(true)
        //loadData(portfolio)

    }, [router.isReady]) // added router.isReady after https://stackoverflow.com/questions/61040790/userouter-withrouter-receive-undefined-on-query-in-first-render It was empty before. just []



    return (

        <div>
            <Box sx={{ maxWidth: 300 }} mx="auto">
                <form onSubmit={form.onSubmit((values) => addProvider(values))}>
                    <TextInput
                        required
                        label="name"
                        placeholder="RobinHood"
                        {...form.getInputProps('name')}
                    />

                    <TextInput
                        required
                        label="uniqueIdentification"
                        placeholder="RH"
                        {...form.getInputProps('uniqueIdentification')}
                    />

                    <TextInput
                        required
                        label="assetType"
                        placeholder="stock;options"
                        {...form.getInputProps('assetType')}
                    />


                    <Group position="right" >
                        <Button type="submit">Submit</Button>
                    </Group>
                </form>
            </Box>

        </div>


    );
}

export default ContainedInputs