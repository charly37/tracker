import React from 'react';
import { TextInput, Group, NativeSelect, Button, Box } from '@mantine/core';
import { useForm } from '@mantine/form';



function ContainedInputs() {


  const form = useForm({
    initialValues: {
      name: 'abc',
      annotation: 'key1:value1;key2:value2...',
      assetType: "stock"
    },
  });



  async function addAsset(ivalues) {
    //work on annotations
    let annotationsObj = [];
    console.log('add asset with values: ', ivalues);
    let aSplitedAnnotations = ivalues.annotation.split(";")
    console.log('aSplitedAnnotations: ', aSplitedAnnotations);
    aSplitedAnnotations.forEach(aOneAnnotationString => {
      console.log('aOneAnnotationString: ', aOneAnnotationString);
      let aSplitedAnnotation = aOneAnnotationString.split(":")
      console.log('aSplitedAnnotation: ', aSplitedAnnotation);
      let aAnnotationAsObj = { key: aSplitedAnnotation[0], value: aSplitedAnnotation[1] }
      annotationsObj.push(aAnnotationAsObj)
    });
    console.log('annotationsObj: ', annotationsObj);

    let asset2Add = { name: ivalues.name, annotations: annotationsObj, asset: ivalues.assetType }
    let test = JSON.stringify(asset2Add)
    console.log('test: ', test);
    const res = await fetch(
      'api/assets',
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

  return (

    <div>


      <Box sx={{ maxWidth: 300 }} mx="auto">
        <form onSubmit={form.onSubmit((values) => addAsset(values))}>
          <TextInput
            required
            label="name"
            placeholder="abc"
            {...form.getInputProps('name')}
          />

          <TextInput
            required
            label="annotation"
            placeholder="key1:value1;key2:value2..."
            {...form.getInputProps('annotation')}
          />

          <NativeSelect
            data={['stock', 'crypto', 'option']}
            placeholder="Pick one"
            label="assetType"
            required
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