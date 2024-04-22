"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [apiUrl, setApiUrl] = useState('');
  const [loading, setLoading] = useState(true);
   
  const fetchSettings = async () => {
    setLoading(true);
    const { data: apiSetting , error: apiSettingError } = await supabase
      .from('ApiSetting')
      .select('*')
      .single();
    if (!apiSettingError) {
      const {
        id,
        apiUrl
      } = apiSetting;
      setApiUrl(apiUrl);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) 
    return <p>Loading...</p>;

  var connectApiUrl = apiUrl;
  if (connectApiUrl) {
  }
  else {
      connectApiUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
      if (connectApiUrl) {
          connectApiUrl = "https://" + connectApiUrl;
      }
      else {
          connectApiUrl = "http://localhost:3000";
      }
  }
  
  return (

      <div>
        <p className="mb-3 text-lg font-bold">AI 웹 챗 관리 &gt; 웹 사이트 연동 방법</p>
    
        <div className="mb-3">
          <p className="block font-bold mb-1">붙여 넣을 코드</p>
          아래 코드를 아래 코드를 html 파일내에 복사해 붙여 넣습니다. <a href='/chat/ai-web-chat/widget-example.html' target='_blank'>html 파일에 적용 예</a><br/> 
          <xmp className="border-2">{`<script src="${connectApiUrl}/chat/ai-web-chat/widget.js"></script>
<script>
  window.onload = function () {
    ChatWidget.init("xx-slkUdka819...");
  };
</script>`}</xmp>
        </div>

        <div className="mb-3">
          <p className="block font-bold mb-1">붙여 넣을 코드 (Nextjs)</p>
	  Nextjs 의 경우 아래 코드를 js 파일내에 복사해 붙여 넣습니다.<br/>
          <xmp className="border-2">{`"use client";
import React, { useState, useEffect } from 'react';
import Script from 'next/script'

const Page = () => {

  return (
    <>
      <Script 
        src="${connectApiUrl}/chat/ai-web-chat/widget.js"
        onLoad={() => {
          ChatWidget.init("xx-slkUdka819...");
        }}
      >
      </Script>
    </>
  );
};
export default Page;`}</xmp>
        </div>
	
      </div>
  );
}
