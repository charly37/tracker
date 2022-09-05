import dbConnect from '../lib/dbConnect'
import Holding from '../models/Holding'

async function bb() {
    console.log('bb0: ');

    await dbConnect()


    console.log('bb: ');
    const holdings = await Holding.find({})
    //console.log('holdings: ',holdings);
    let aValueByProviders = {}
    let aTotal = 0
    holdings.forEach(aOneHolding => {
        //console.log('aOneHolding: ',aOneHolding);
        //console.log('aOneHolding: ',aOneHolding);

        //Something strange....like Value computed from holding != cache.....this is to find bug
        let aValueCacheFromObj = aOneHolding.actualValueCached
        let aValueComputedHere = 0

        aOneHolding.valueSplitProviderCached.forEach(aOneProviderHoldings => {
            //console.log('aOneProviderHoldings: ', aOneProviderHoldings);
            let aProvider = aOneProviderHoldings.provider
            //console.log('aProvider: ', aProvider);
            

            if (aProvider in aValueByProviders) {
                //console.log('Know provider');
                aValueByProviders[aProvider]=aValueByProviders[aProvider] + aOneProviderHoldings.amount
            }
            else {
                //console.log('Unknow provider');
                aValueByProviders[aProvider]=aOneProviderHoldings.amount
            }
            aTotal = aTotal +aOneProviderHoldings.amount
            aValueComputedHere = aValueComputedHere + aOneProviderHoldings.amount

        });
        if (Math.abs(aValueCacheFromObj - aValueComputedHere) > 10){
            console.log('Strange aOneHolding: ',aOneHolding);
        }

    });
    console.log('aValueByProviders: ',aValueByProviders);
    console.log('aTotal: ',aTotal);

    return aValueByProviders
}

export default bb