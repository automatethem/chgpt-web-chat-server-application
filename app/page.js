"use client"
import { createClient } from '@supabase/supabase-js'
import React, { useState, useEffect } from 'react';
import AiWebChat from "./chat/ai-web-chat/page.js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const Page = () => {
  const [useForwardToAiWebChatFromHome, setUseForwardToAiWebChatFromHome] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    setLoading(true);

    const { data: aiWebChatSetting, error: aiWebChatSettingError } = await supabase
      .from('AiWebChatSetting')
      .select('*')
      .single();
    if (!aiWebChatSettingError) {
      const {
        useForwardToAiWebChatFromHome
      } = aiWebChatSetting;
      setUseForwardToAiWebChatFromHome(useForwardToAiWebChatFromHome);
    }
   
    setLoading(false);
  }, []);

  if (loading)
    return <>loading</>;

  if (useForwardToAiWebChatFromHome) 
    return <AiWebChat/>;

  return (
  <>
  <p>xx  서비스</p>
  <p>추천 서비스</p> 
  <p>신규 서비스</p>
  <p>인기 서비스</p>
  </>
  );
};
export default Page;
