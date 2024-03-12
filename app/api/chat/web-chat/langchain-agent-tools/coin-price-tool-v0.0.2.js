import { DynamicTool, DynamicStructuredTool } from "langchain/tools";
import * as z from 'zod';

const createCoinPriceTool = () => {
    //tool3
    // 8. Define a structured tool to fetch cryptocurrency prices from CoinGecko API
    const coinPriceTool = new DynamicStructuredTool({
      name: 'fetchCryptoPrice',
      description: 'Fetches the current price of a specified cryptocurrency',
      schema: z.object({
        cryptoName: z.string(),
        vsCurrency: z.string().optional().default('USD'),
      }),
      func: async (options) => {
        console.log('Triggered fetchCryptoPrice function with options: ', options); //Triggered fetchCryptoPrice function with options:  { cryptoName: 'bitcoin', vsCurrency: 'USD' }
        const { cryptoName, vsCurrency } = options;
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoName}&vs_currencies=${vsCurrency}`;
        //https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd
        //{"bitcoin":{"usd":44491}}
        const response = await fetch(url);
        const data = await response.json();
        return data[cryptoName.toLowerCase()][vsCurrency.toLowerCase()].toString();
      },
    });

  return coinPriceTool;
};

export default createCoinPriceTool;
