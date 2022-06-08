import React from 'react';
import { TextInput, Group, Checkbox, Button, Box} from '@mantine/core';
import { useForm } from '@mantine/form';


function ContainedInputs() {


  const form = useForm({
    initialValues: {
        name: 'aa',
        annotation: 'aa:aa',
    },
  });

  

  async function addPaas(ivalues) {
    //window.localStorage.removeItem("stackName");
    console.log('addPaas with values: ',ivalues);
    let aSplited=ivalues.annotation.split(":")
    console.log('aSplited: ',aSplited);
    let portfolio2Add2 = {name: ivalues.name, annotations: [{key: aSplited[0] ,value:aSplited[1]},{key: "cle2b",value:"value2b"}] }
    let test=JSON.stringify(portfolio2Add2)
    console.log('test: ',test);
    const res = await fetch(
      'api/portfolios',
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
        <form onSubmit={form.onSubmit((values) => addPaas(values))}>
        <TextInput
          required
          label="name"
          placeholder="Long term"
          {...form.getInputProps('name')}
        />

        <TextInput
          required
          label="annotation"
          placeholder="key:value"
          {...form.getInputProps('annotation')}
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