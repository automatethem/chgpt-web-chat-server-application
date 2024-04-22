"use client"
import { useEffect, useState } from 'react';

export default function Page() {
 
  return (
    <div>
      <p className="mb-3 text-lg font-bold">Api 리스트 관리 &gt; Api 리스트 관리</p>

      <div className="mb-3">
        <label className="block font-bold mb-1">코인 gimp</label>
        <p><a href="/api/command/coin-price?command=gimp&key=123" target="_blank">/api/command/coin-price?command=gimp&key=123</a></p>
      </div>
		
      <div className="mb-3">
        <label className="block font-bold mb-1">코인 price</label>
        <p><a href="/api/command/coin-price?command=price&key=123&exchange=binance&symbol=btc" target="_blank">/api/command/coin-price?command=price&key=123&exchange=binance&symbol=btc</a></p>
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">코인 ohlcv</label>
        <p><a href="/api/command/coin-price?command=ohlcv&key=123&exchange=binance&symbol=btc" target="_blank">/api/command/coin-price?command=ohlcv&key=123&exchange=binance&symbol=btc</a></p>
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">코인 market-capitalization</label>
        <p><a href="/api/command/market-capitalization?key=123" target="_blank">/api/command/market-capitalization?key=123</a></p>
        <p><a href="/api/command/market-capitalization?symbol=btc&key=123" target="_blank">/api/command/market-capitalization?symbol=btc&key=123</a></p>
      </div>
  
    </div>
  );
}
