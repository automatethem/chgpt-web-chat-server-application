"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [id, setId] = useState(null);
  const [useLogoImage, setUseLogoImage] = useState(true);
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [useAssistantImage, setUseAssistantImage] = useState(false);
  const [assistantImageUrl, setAssistantImageUrl] = useState('');
  const [useUserImage, setUseUserImage] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState('');
  const [useHomeChatBox, setUseHomeChatBox] = useState(false);
  const [useForwardToAiWebChatFromHome, setUseForwardToAiWebChatFromHome] = useState(false);
  const [useAiWebChat, setUseAiWebChat] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
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
        useHomeChatBox,
        useForwardToAiWebChatFromHome,
        useAiWebChat,
      } = aiWebChatSetting;
      setId(id);
      setUseLogoImage(useLogoImage);
      setLogoImageUrl(logoImageUrl);
      setUseAssistantImage(useAssistantImage);
      setAssistantImageUrl(assistantImageUrl);
      setUseUserImage(useUserImage);
      setUserImageUrl(userImageUrl);
      setUseHomeChatBox(useHomeChatBox);
      setUseForwardToAiWebChatFromHome(useForwardToAiWebChatFromHome);
      setUseAiWebChat(useAiWebChat);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data: aiWebChatSetting, aiWebChatSettingError } = await supabase
      .from('AiWebChatSetting')
      .update({
        useLogoImage,
        logoImageUrl,
        useAssistantImage,
        assistantImageUrl,
        useUserImage,
        userImageUrl,
        useHomeChatBox,
        useForwardToAiWebChatFromHome,
        useAiWebChat
      })
      .match({ id });

    if (!aiWebChatSettingError) {
      alert('설정 저장 성공!');
      fetchSettings();
    } else {
      alert(aiWebChatSettingError.message);
    }
    setLoading(false);
  };

  const uploadLogoImageFile = async (event) => {
    const file = event.target.files[0];
    const bucket = "AiWebChatSetting"

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`logoImage/${file.name}`, file, { upsert: true });

    if(error) {
      alert(error.message); //new row violates row-level security policy
      return;
    }

    const { data: dataPublic, error: errorPublic } = supabase
    .storage
    .from('AiWebChatSetting')
    .getPublicUrl(`logoImage/${file.name}`);
    
    const publicUrl = dataPublic.publicUrl;
    //console.log(publicUrl); //https://haeojztqgjldkavhpkeo.supabase.co/storage/v1/object/public/welcome/images/googlelogo.png
    setLogoImageUrl(publicUrl);
    
    alert('로고 이미지 업로드 성공!');
  };
  
  const uploadAssistantImageFile = async (event) => {
    const file = event.target.files[0];
    const bucket = "AiWebChatSetting"

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`assistantImage/${file.name}`, file, { upsert: true });

    if(error) {
      alert(error.message); //new row violates row-level security policy
      return;
    }

    const { data: dataPublic, error: errorPublic } = supabase
    .storage
    .from('AiWebChatSetting')
    .getPublicUrl(`assistantImage/${file.name}`);
    
    const publicUrl = dataPublic.publicUrl;
    //console.log(publicUrl); //https://haeojztqgjldkavhpkeo.supabase.co/storage/v1/object/public/welcome/images/googlelogo.png
    setAssistantImageUrl(publicUrl);
    
    alert('어시스턴트 이미지 업로드 성공!');
  };

  const uploadUserImageFile = async (event) => {
    const file = event.target.files[0];
    const bucket = "AiWebChatSetting"

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`userImage/${file.name}`, file, { upsert: true });

    if(error) {
      alert(error.message); //new row violates row-level security policy
      return;
    }

    const { data: dataPublic, error: errorPublic } = supabase
    .storage
    .from('AiWebChatSetting')
    .getPublicUrl(`userImage/${file.name}`);
    
    const publicUrl = dataPublic.publicUrl;
    //console.log(publicUrl); //https://haeojztqgjldkavhpkeo.supabase.co/storage/v1/object/public/welcome/images/googlelogo.png
    setUserImageUrl(publicUrl);
    
    alert('사용자 이미지 업로드 성공!');
  };

  if (loading) 
    return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">Ai 웹 챗 관리 &gt; 설정</p>

      <div className="mb-3">
        <label className="block font-bold mb-1">로고 이미지 사용</label>
        <input
          type="checkbox"
          checked={useLogoImage}
          onChange={(e) => setUseLogoImage(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">로고 이미지</label>
        <input 
          type="text"
          value={logoImageUrl}
          onChange={(e) => setLogoImageUrl(e.target.value)}
          className="w-full shadow py-2 px-3 border"
        />
        <input type="file" onChange={(e) => {uploadLogoImageFile(e);}} />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">어시스턴트 이미지 사용</label>
        <input
          type="checkbox"
          checked={useAssistantImage}
          onChange={(e) => setUseAssistantImage(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">어시스턴트 이미지</label>
        <input 
          type="text"
          value={assistantImageUrl}
          onChange={(e) => setAssistantImageUrl(e.target.value)}
          className="w-full shadow py-2 px-3 border"
        />
        <input type="file" onChange={(e) => {uploadAssistantImageFile(e);}} />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">사용자 이미지 사용</label>
        <input
          type="checkbox"
          checked={useUserImage}
          onChange={(e) => setUseUserImage(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">사용자 이미지</label>
        <input 
          type="text"
          value={userImageUrl}
          onChange={(e) => setUserImageUrl(e.target.value)}
          className="w-full shadow py-2 px-3 border"
        />
        <input type="file" onChange={(e) => {uploadUserImageFile(e);}} />
      </div>
      
      <div className="mb-3">
        <label className="block font-bold mb-1">홈에서 챗 박스 사용</label>
        <input
          type="checkbox"
          checked={useHomeChatBox}
          onChange={(e) => setUseHomeChatBox(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">홈에서 Ai 웹 챗으로 포워드 사용</label>
        <input
          type="checkbox"
          checked={useForwardToAiWebChatFromHome}
          onChange={(e) => setUseForwardToAiWebChatFromHome(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">AI 웹 챗 사용</label>
        <input
          type="checkbox"
          checked={useAiWebChat}
          onChange={(e) => setUseAiWebChat(e.target.checked)}
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
