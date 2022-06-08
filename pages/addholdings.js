import React from 'react';
import { TextInput, Group, Checkbox, Button, Box} from '@mantine/core';
import { useForm } from '@mantine/form';


function ContainedInputs() {


  const form = useForm({
    initialValues: {
        name: 'abc',
        annotation: 'key1:value1;key2:value2...',
        assetType: 'stock',
        unitValue: 5,
        labels:"toto;titi",
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
    
    //now work on labels
    let aSplitedLabels=ivalues.labels.split(";")
    console.log('aSplitedLabels: ',aSplitedLabels);
    let holding2Add = {name: ivalues.name, annotations: annotationsObj,assetType: ivalues.assetType,portfolio: ivalues.portfolio, labels: [aSplitedLabels[0],aSplitedLabels[1]]}
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
          label="assetType"
          placeholder="stock"
          {...form.getInputProps('assetType')}
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
          label="labels"
          placeholder="label1;label2"
          {...form.getInputProps('labels')}
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