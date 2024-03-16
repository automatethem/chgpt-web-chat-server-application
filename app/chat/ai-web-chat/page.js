'use client'
import { useChat } from 'ai/react'
import { useState } from 'react';
import { useEffect, useRef } from "react";
import { createClient } from '@supabase/supabase-js'
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from 'rehype-external-links'
 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function Page() {
  ///*
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat/ai-web-chat',
      onFinish: () => { 
        setIsTyping(false); 
      }
  });
  //*/
  /*
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat/ai-web-chat',
      initialMessages: [
        {
          id: '',
          role: 'system',
          //content: 'You are a master chef, creator of fine cuisine. You can cook anything and love to make new recipes. You know American cuisine best but are classically french trained. Help the users come up with their dinner. You are terse, assertive, and never apologize.'
          content: "당신은 훌륭한 요리를 만드는 마스터 셰프입니다. 당신은 무엇이든 요리할 수 있고 새로운 요리법을 만드는 것을 좋아합니다. 당신은 미국 요리를 가장 잘 알고 있지만 고전적인 프랑스 교육을 받았습니다. 사용자가 저녁 식사를 준비하도록 도와주세요. 당신은 간결하고 단호하며 결코 사과하지 않습니다."
        }
      ],
      onFinish: () => { 
        setIsTyping(false); 
      }
  });
  */
  const [isTyping, setIsTyping] = useState(false);
  const messagesBottomRef = useRef(null);
  //
  const [menus, setMenus] = useState([]);
  //
  const [id, setId] = useState(null);
  const [useLogoImage, setUseLogoImage] = useState(false);
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [useAssistantImage, setUseAssistantImage] = useState(false);
  const [assistantImageUrl, setAssistantImageUrl] = useState('');
  const [useUserImage, setUseUserImage] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState('');
  const [useAiWebChat, setUseAiWebChat] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('AiWebChatMenu')
      .select('*')
      .order("priority");
    if (!error) {
      setMenus(data);
    } 
    else {
      console.error('Failed to fetch menu items:', error.message);
    }
   
    const { data: aiWebChatSetting, aiWebChatSettingError } = await supabase
    .from('AiWebChatSetting')
    .select('*')
    .single();
    if (!aiWebChatSettingError) {
      const {
        id,
        useLogoImage,
        logoImageUrl,
        useAssistantImage,
        assistantImageUrl,
        useUserImage,
        userImageUrl,
        useAiWebChat
      } = aiWebChatSetting;
      setId(id);
      setUseLogoImage(useLogoImage);
      setLogoImageUrl(logoImageUrl);
      setUseAssistantImage(useAssistantImage);
      setAssistantImageUrl(assistantImageUrl);
      setUseUserImage(useUserImage);
      setUserImageUrl(userImageUrl);
      setUseAiWebChat(useAiWebChat);
    }
    console.log(aiWebChatSetting);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (messagesBottomRef.current) {
        messagesBottomRef.current.scrollIntoView();
    }
  }, [messages]);
  
  if (loading) 
    return <p>Loading...</p>;

  if (!useAiWebChat) 
    return <p>AI 웹 챗 미사용중</p>;

  return (
    <section className='container mx-auto p-5 fixed inset-0'>
      <div className='fixed z-10 ml-4 mt-4'>
      {useLogoImage? <img src={logoImageUrl} className="max-w-sm rounded-lg shadow-2xl w-16" /> : <img src="/chat/ai-web-chat/logo.png" className="max-w-sm rounded-lg shadow-2xl w-16" />}
      </div>
      {menus.length > 0 ? 
      <div className='fixed z-10 ml-20 mt-4'>
        <ul className="ml-4 menu menu-horizontal bg-base-200 rounded-box">
          {menus.map((menu) => {
            return <li key={menu.id}><a href={menu.url} target="_blank">{menu.name}</a></li>
          })}
        </ul>
      </div>
      : null
      }
      <div className="mockup-window border bg-base-300 w-full h-full flex flex-col">
        <div className='p-5 pb-8 flex-grow overflow-auto'>
          {
            messages.filter((msg) => { 
                return msg.role != "system"; 
            })
            .map((msg, i) => {
              return (
                <div className={`chat ${msg.role === 'assistant' ? 'chat-start' : 'chat-end'}`} key={'chatKey' + i}>
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                    { 
                      (() => {
                        if (msg.role === 'assistant') {
                          if (useAssistantImage) {
                            return <img src={assistantImageUrl} />
                          }
                          else {
                            return <img src="/chat/ai-web-chat/assistant.png" />
                          }
                        }
                        else if (msg.role === 'user') {
                          if (useUserImage) {
                            return <img src={userImageUrl} />
                          }
                          else {
                            return <img src="/chat/ai-web-chat/user.png" />
                          }
                        }
                      })()
                    }
                    </div>
                  </div>
                  <div className="chat-bubble">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, [rehypeExternalLinks, { target: '_blank' }]]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} className="underline" />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )
            })
          }
          <div ref={messagesBottomRef}></div>
        </div>

        <form className="form-control m-2 items-center" onSubmit={(e) => { setIsTyping(true); handleSubmit(e); }}>
          <div className="join w-full max-w-screen-md relative">
            {isTyping && <small className='absolute -top-5 left-0.5 animate-pulse'>AI가 메시지를 입력중 입니다...</small>}

            <input type="text" className="input w-full input-bordered join-item flex-grow" placeholder="메시지를 입력하세요..." value={input} onChange={handleInputChange} required/>
            <button className="btn btn-square" type="submit" disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Page;
