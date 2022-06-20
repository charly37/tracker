import React, { useState, useEffect } from 'react';
import { TextInput, Group, Button, Box} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from "next/router";


function ContainedInputs() {


  const form = useForm({
    initialValues: {
        name: 'abc',
        annotation: 'key1:value1;key2:value2...',
        asset:"50713a3c-ae27-427a-b3b5-214a617a3d39",
        portfolio: "50713a3c-ae27-427a-b3b5-214a617a3d39"
    },
  });

  

  async function addHolding(ivalues) {
    //work on annotations
    let annotationsObj = [];
    console.log('add holding with values: ',ivalues);
    let aSplitedAnnotations=ivalues.annotation.split(";")
    console.log('aSplitedAnnotations: ',aSplitedAnnotations);
    aSplitedAnnotations.forEach(aOneAnnotationString => {
      console.log('aOneAnnotationString: ',aOneAnnotationString);
      let aSplitedAnnotation=aOneAnnotationString.split(":")
      console.log('aSplitedAnnotation: ',aSplitedAnnotation);
      let aAnnotationAsObj = {key: aSplitedAnnotation[0] ,value:aSplitedAnnotation[1]}
      annotationsObj.push(aAnnotationAsObj)
    });
    console.log('annotationsObj: ',annotationsObj);
    
    let holding2Add = {name: ivalues.name, annotations: annotationsObj,asset: ivalues.asset,portfolio: ivalues.portfolio}
    let test=JSON.stringify(holding2Add)
    console.log('test: ',test);
    const res = await fetch(
      'api/holdings',
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

const router = useRouter()
  useEffect(() => {
    //const router = useRouter()  //can not be call here - forbiden
    if (!router.isReady) return;

    console.log(router.query);

    const params = router.query
    console.log("router ready: ", params);
    if (router.query['portfolio']) {
      form.setFieldValue('portfolio', router.query['portfolio'])
    }
    if (router.query['asset']) {
      form.setFieldValue('asset', router.query['asset'])
    }
    //setLoading(true)
    //loadData(portfolio)

  }, [router.isReady]) // added router.isReady after https://stackoverflow.com/questions/61040790/userouter-withrouter-receive-undefined-on-query-in-first-render It was empty before. just []



  return (
      
    <div>
        <Box sx={{ maxWidth: 300 }} mx="auto">
        <form onSubmit={form.onSubmit((values) => addHolding(values))}>
        <TextInput
          required
          label="name"
          placeholder="abc"
          {...form.getInputProps('name')}
        />

<TextInput
          required
          label="portfolio"
          placeholder="50713a3c-ae27-427a-b3b5-214a617a3d39"
          {...form.getInputProps('portfolio')}
        />

        <TextInput
          required
          label="annotation"
          placeholder="key1:value1;key2:value2..."
          {...form.getInputProps('annotation')}
        />

<TextInput
          required
          label="asset"
          placeholder="50713a3c-ae27-427a-b3b5-214a617a3d39"
          {...form.getInputProps('asset')}
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