"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [id, setId] = useState(null);
  const [useInfoCommand, setUseInfoCommand] = useState(false);
  const [useCoinPriceCommand, setUseCoinPriceCommand] = useState(false);
  const [useCoinPriceSimpleMessage, setUseCoinPriceSimpleMessage] = useState(false);
  const [useCoinPriceOhlcvMessage, setUseCoinPriceOhlcvMessage] = useState(false);
  const [useCoinPriceCommandCoinbase, setUseCoinPriceCommandCoinbase] = useState(false);
  const [coinbaseApiKey, setCoinbaseApiKey] = useState(false);
  const [coinbaseSecret, setCoinbaseSecret] = useState(false);
  const [useMarketCapitalizationCommand, setUseMarketCapitalizationCommand] = useState(false);
  const [coinMarketCapApiKey, setCoinMarketCapApiKey] = useState(false);	
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('InfoCommandSetting')
      .select('*')
      .single();
    if (!error) {
      const {
        id,
	useInfoCommand,
      	useCoinPriceCommand,
      	useCoinPriceSimpleMessage,
        useCoinPriceOhlcvMessage,
        useCoinPriceCommandCoinbase,
        coinbaseApiKey,
        coinbaseSecret,
	useMarketCapitalizationCommand,
	coinMarketCapApiKey
      } = data; 
      setId(id);
      setUseInfoCommand(useInfoCommand);
      setUseCoinPriceCommand(useCoinPriceCommand);
      setUseCoinPriceSimpleMessage(useCoinPriceSimpleMessage);
      setUseCoinPriceOhlcvMessage(useCoinPriceOhlcvMessage);
      setUseCoinPriceCommandCoinbase(useCoinPriceCommandCoinbase);
      setCoinbaseApiKey(coinbaseApiKey);
      setCoinbaseSecret(coinbaseSecret);
      setUseMarketCapitalizationCommand(useMarketCapitalizationCommand);
      setCoinMarketCapApiKey(coinMarketCapApiKey);   
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from('InfoCommandSetting')
      .update({
        useInfoCommand: useInfoCommand,
        useCoinPriceCommand: useCoinPriceCommand,
        useCoinPriceSimpleMessage: useCoinPriceSimpleMessage,
        useCoinPriceOhlcvMessage: useCoinPriceOhlcvMessage,
        useCoinPriceCommandCoinbase: useCoinPriceCommandCoinbase,
        coinbaseApiKey: coinbaseApiKey,
        coinbaseSecret: coinbaseSecret,
	useMarketCapitalizationCommand: useMarketCapitalizationCommand,
        coinMarketCapApiKey: coinMarketCapApiKey
      })
      .match({ id: id });

    if (!error) {
      alert('설정 저장 성공!');
      fetchSettings();
    } 
    else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (loading) 
    return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">정보 명령 관리 &gt; 설정</p>

      <div className="mb-3">
        <label className="block font-bold mb-1">정보 명령 사용</label>
        <input
          type="checkbox"
          checked={useInfoCommand}
          onChange={(e) => setUseInfoCommand(e.target.checked)}
        />
      </div>
		  
      <div className="mb-3">
        <label className="block font-bold mb-1">코인 가격 명령 사용</label>
        <input
          type="checkbox"
          checked={useCoinPriceCommand}
          onChange={(e) => setUseCoinPriceCommand(e.target.checked)}
        />
      </div>
		  
      <div className="mb-3">
        <label className="block font-bold mb-1">심플 코인 메시지</label>
        <input
          type="checkbox"
          checked={useCoinPriceSimpleMessage}
          onChange={(e) => setUseCoinPriceSimpleMessage(e.target.checked)}
        />
	      <img src="/admin/command/info-command/setting/coin-price-message1.png"/>
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">Ohlcv 코인 메시지</label>
        <input
          type="checkbox"
          checked={useCoinPriceOhlcvMessage}
          onChange={(e) => setUseCoinPriceOhlcvMessage(e.target.checked)}
        />
	      <img src="/admin/command/info-command/setting/coin-price-message2.png"/>
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">코인 메시지에서 코인베이스 사용</label>
        <input
          type="checkbox"
          checked={useCoinPriceCommandCoinbase}
          onChange={(e) => setUseCoinPriceCommandCoinbase(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">코인베이스 api key</label>
        <input 
          type="text"
          value={coinbaseApiKey}
          onChange={(e) => setCoinbaseApiKey(e.target.value)}
          className="w-full shadow py-2 px-3 border"
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">코인베이스 secret</label>
        <input 
          type="text"
          value={coinbaseSecret}
          onChange={(e) => setCoinbaseSecret(e.target.value)}
          className="w-full shadow py-2 px-3 border"
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">시총 명령 사용</label>
        <input
          type="checkbox"
          checked={useMarketCapitalizationCommand}
          onChange={(e) => setUseMarketCapitalizationCommand(e.target.checked)}
        />
        <img src="/admin/command/info-command/setting/market-capitalization.png"/>
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">코인마켓캡 apiKey</label>
        <p>api 키 만들기: <a href="https://pro.coinmarketcap.com/account" target="_blank">https://pro.coinmarketcap.com/account</a></p>
        <input 
          type="text"
          value={coinMarketCapApiKey}
          onChange={(e) => setCoinMarketCapApiKey(e.target.value)}
          className="w-full shadow py-2 px-3 border"
        />
      </div>
                  
      <button
        type="submit"
        className="shadow py-2 px-3 border bg-blue-500"
        disabled={loading}
        onClick={handleSubmit}
      >
        저장
      </button>
    </div>
  );
}
