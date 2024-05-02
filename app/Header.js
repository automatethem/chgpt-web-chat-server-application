"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const Page = () => {
  const [user, setUser] = useState(null);
  //
  const [menus, setMenus] = useState([]);
  //
  const [id, setId] = useState(null);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [useLogoImage, setUseLogoImage] = useState(false);
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [webSiteInformation, setWebSiteInformation] = useState('');
  //
//  const [hideHeaderPages, setHideHeaderPages] = useState([]);
  const [useForwardToAiWebChatFromHome, setUseForwardToAiWebChatFromHome] = useState(false);
  //
  const [loading, setLoading] = useState(true);
  
  useEffect(async () => {
    setLoading(true);
   
    const fetchUser = async () => {
      setLoading(true);
      
      const { data, error } = await supabase.auth.getUser()
      setLoading(false);
      
      setUser(data.user);
    };
    fetchUser();

    const { data, error } = await supabase
      .from('WebSiteMenu')
      .select('*')
      .order("priority");
    if (!error) {
      setMenus(data);
    } 
    else {
      console.error('Failed to fetch menu items:', error.message);
    }

    const { data: webSiteSettingData, error: webSiteSettingError } = await supabase
      .from('WebSiteSetting')
      .select('*')
      .single();
    if (!webSiteSettingError && webSiteSettingData) {
      setId(webSiteSettingData.id);
      setTitle(webSiteSettingData.title);
      setSubTitle(webSiteSettingData.subTitle);
      setUseLogoImage(webSiteSettingData.useLogoImage);
      setLogoImageUrl(webSiteSettingData.logoImageUrl);
      setWebSiteInformation(webSiteSettingData.webSiteInformation);
    }

    /*
    const { data: webSiteHideHeaderPages } = await supabase
    .from('WebSiteHideHeaderPage')
    .select('*');
    const temp = [];
    for(const webSiteHideHeaderrPage of webSiteHideHeaderPages) {
      temp.push(webSiteHideHeaderrPage.page);
    }
    setHideHeaderPages(temp);
    */
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

  async function logout() {
    await supabase.auth.signOut();
    //setUser(null);
    window.location.replace('/');
  }

  if (loading)
    return <>loading</>;

/*
  //if (['/chat/ai-web-chat'].includes(window.location.pathname)) 
  if (hideHeaderPages.includes(window.location.pathname)) 
    return null;
*/
  if (window.location.pathname == '/chat/ai-web-chat') 
    return null;  
  if (useForwardToAiWebChatFromHome && window.location.pathname == '/') 
    return null;  
      
  return (
    <>
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <div className="flex">
          <div>
            <a href="/"><img src={useLogoImage ?logoImageUrl : "/logo.png"} width="80"/></a>
          </div>
          <div className="join join-vertical">
            <a className="btn btn-ghost text-xl" href="/">{title}</a>
            <p className="text-sm">{subTitle}</p>
          </div>
        </div>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {menus.length > 0 ? 
             menus.map((menu) => {
               if (menu.url) 
                 return <li key={menu.id}><a href={menu.url} target={menu.openWindow ? '_blank': '_self'}>{menu.name}</a></li>
               else 
                 return <li key={menu.id} className="ml-1 font-bold"><a href={menu.url}>{menu.name}</a></li>
             })
          : null
          }

          {user != null ? (
          <>
          <li><a href="/admin">관리</a></li>
          <li>
            <details>
              <summary>
              {user.email}
              </summary>
              <ul className="p-2 bg-base-100 rounded-t-none">
                <li><button type="button" onClick={logout}>로그아웃</button></li>
              </ul>
            </details>
          </li>
          </>
          ) : (
            <li><a href="/login">로그인</a></li>
          )}
        </ul>
      </div>
    </div>
  </>
  );
};
export default Page;
