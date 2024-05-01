"use client"
import { createClient } from '@supabase/supabase-js'
import React, { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from 'rehype-external-links';
//import { useRouter } from "next/navigation";
//import AiWebChat from "./chat/ai-web-chat/page.js";
import AiWebChat from "./ai-web-chat-bridge.js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const Page = () => {
  const [message, setMessage] = useState('');
  const [useForwardToAiWebChatFromHome, setUseForwardToAiWebChatFromHome] = useState(false);
  const [loading, setLoading] = useState(true);
  //const router = useRouter();

  useEffect(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('WebSiteSetting')
      .select('*')
      .single();
    if (!error && data) {
      setMessage(data.message);
    }
    
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
      <div>
          {/*<h1 className="mb-3 text-lg font-bold">{title}</h1>*/}
          <div className="mb-3">
              {/* Using ReactMarkdown to render the message as markdown */}
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, [rehypeExternalLinks, { target: '_blank' }]]}
                components={{
                  // Custom component for 'a' tag to add className
                  a: ({ node, ...props }) => (
                    <a {...props} className="underline text-blue-600 hover:text-blue-800" />
                  ),
                }}
              >
                  {message}
              </ReactMarkdown>
          </div>
      </div>
  );
};
export default Page;
