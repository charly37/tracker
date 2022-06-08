import React, { useState, useEffect  } from 'react';
import { TextInput, Group, Checkbox, Button, Box} from '@mantine/core';
import { useForm } from '@mantine/form';
import { NumberInput } from '@mantine/core';
import { RadioGroup, Radio } from '@mantine/core';
import { DatePicker } from '@mantine/dates';

function ContainedInputs() {


  const form = useForm({
    initialValues: {
        name: 'Buy ZZZ share of XXX on YYY',
        holdingInfo: '27c2653c-bb96-4feb-a2c7-9a9dc3504740',
        provider: 'RH',
        action: 'buy',
        date: '',
        quantity: 3

    },
  });

  const [getDate, setDate] = useState();
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Submitted!");
  };

  

  async function addTransactions(ivalues) {
    //window.localStorage.removeItem("stackName");
    console.log('addTransactions with values: ',ivalues);
    let aDate=getDate
    console.log('addTransactions with aDate: ',aDate);
    let transaction2add = {name: ivalues.name, holdingInfo: ivalues.holdingInfo, provider: ivalues.provider, quantity: ivalues.quantity, date: aDate, action: ivalues.action }
    console.log('transaction2add: ',transaction2add);
    let test=JSON.stringify(transaction2add)
    console.log('test: ',test);
    const res = await fetch(
      'api/transactions',
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
        <form onSubmit={form.onSubmit((values) => addTransactions(values))}>
        <TextInput
          required
          label="name"
          placeholder="Buy ZZZ share of XXX on YYY"
          {...form.getInputProps('name')}
        />

        <TextInput
          required
          label="holdingInfo"
          placeholder="27c2653c-bb96-4feb-a2c7-9a9dc3504740"
          {...form.getInputProps('holdingInfo')}
        />

<TextInput
          required
          label="provider"
          placeholder="RH"
          {...form.getInputProps('provider')}
        />

<TextInput
          required
          label="action"
          placeholder="buy"
          {...form.getInputProps('action')}
        />

<DatePicker required placeholder="Pick date" label="date" value={getDate}
          onChange={(v) => setDate(v)}/>

<TextInput
          required
          label="quantity"
          placeholder="3"
          {...form.getInputProps('quantity')}
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