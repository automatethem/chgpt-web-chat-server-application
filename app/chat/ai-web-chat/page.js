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
  const [examples, setExamples] = useState([]);
  //
  const [id, setId] = useState(null);
  const [useLogoImage, setUseLogoImage] = useState(false);
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [useAssistantImage, setUseAssistantImage] = useState(false);
  const [assistantImageUrl, setAssistantImageUrl] = useState('');
  const [useUserImage, setUseUserImage] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState('');
  const [useFooter, setUseFooter] = useState(false);
  const [footer, setFooter] = useState('');
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

    const { data: aiWebChatExamples, error: aiWebChatExampleError } = await supabase
      .from('AiWebChatExample')
      .select('*')
      .order("priority");
    if (!error) {
      setExamples(aiWebChatExamples);
    } 
    else {
      console.error('Failed to fetch example items:', error.message);
    }
    console.log(aiWebChatExamples);

    const { data: aiWebChatSetting, error: aiWebChatSettingError } = await supabase
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
        useFooter,
        footer,
        useAiWebChat
      } = aiWebChatSetting;
      setId(id);
      setUseLogoImage(useLogoImage);
      setLogoImageUrl(logoImageUrl);
      setUseAssistantImage(useAssistantImage);
      setAssistantImageUrl(assistantImageUrl);
      setUseUserImage(useUserImage);
      setUserImageUrl(userImageUrl);
      setUseFooter(useFooter);
      setFooter(footer);
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
  
  const handleExampleClick = (text) => {
    handleInputChange({ target: { value: text } });

    setTimeout(function(){
      document.getElementsByTagName('button')[0].click();
    }, 0.5);
  };

  if (loading) 
    return <p>Loading...</p>;

  if (!useAiWebChat) 
    return <p>AI 웹 챗 미사용중</p>;

  return (
    <>
    <section className='container mx-auto p-5 fixed inset-0'>
      <div className='fixed z-10 ml-2 mt-2'>
      {useLogoImage? <img src={logoImageUrl} className="max-w-sm rounded-lg shadow-2xl w-20" /> : <img src="/chat/ai-web-chat/logo.png" className="max-w-sm rounded-lg shadow-2xl w-20" />}
      </div>
      {menus.length > 0 ? 
      <div className='fixed z-10 ml-20 mt-2'>
        <ul className="ml-4 menu menu-horizontal bg-base-200 bg-opacity-70 rounded-box">
          {menus.map((menu) => {
            if (menu.url)
              return <li key={menu.id} className="ml-1 mr-1"><a href={menu.url} target="_blank">{menu.name}</a></li>
            else {
              return <li key={menu.id} className="ml-1 font-bold"><a href="#">{menu.name}</a></li>
            }
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

        <form className="form-control m-2 items-center" onSubmit={(e) => { setIsTyping(true); handleSubmit(e); document.getElementById('examples').style.display = "none"; }}>
          <div className="join w-full max-w-screen-md relative">
            {isTyping && <small className='absolute -top-5 left-0.5 animate-pulse'>AI가 메시지를 입력중 입니다...</small>}
            <input type="text" className="input w-full input-bordered join-item flex-grow" placeholder="메시지를 입력하세요..." value={input} onChange={handleInputChange} required/>
            <button className="btn btn-square" type="submit" disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
              </svg>
            </button>
          </div>

          <div className="w-full max-w-screen-md relative" id="examples">
            {examples.map((example) => {
              return <button className="btn btn-sm btn-outline mr-1 mt-1" key={example.id} onClick={(e) => {handleExampleClick(example.name); }}>{example.name}</button>
            })}
          </div>
        </form>
      </div>

      {useFooter ? 
        <div className="flex w-full justify-center">
        <p className="text-xs">{footer}</p>
        </div>
        : null
      }
    </section>


    </>
  );
}

export default Page;
