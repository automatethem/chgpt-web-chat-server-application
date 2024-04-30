"use client"
import { createClient } from '@supabase/supabase-js'
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
//import AiWebChat from "./chat/ai-web-chat/page.js";
import AiWebChat from "./ai-web-chat-bridge.js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const Page = () => {
  const [useForwardToAiWebChatFromHome, setUseForwardToAiWebChatFromHome] = useState(false);
  const [loading, setLoading] = useState(true);
  //const router = useRouter();

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

  if (useForwardToAiWebChatFromHome) {
    //router.replace("/chat/ai-web-chat");
    //router.push("/chat/ai-web-chat");
    //const AiWebChat = require("./chat/ai-web-chat/page.js").default;
    //const AiWebChat = require("./ai-web-chat-bridge.js").default;
    return <AiWebChat/>;
  }

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
