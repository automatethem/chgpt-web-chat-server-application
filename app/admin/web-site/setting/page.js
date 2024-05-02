"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
 
export default function Page() {
  const [id, setId] = useState(null);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [useLogoImage, setUseLogoImage] = useState(false);
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [webSiteInformation, setWebSiteInformation] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('WebSiteSetting')
      .select('*')
      .single();
    if (!error && data) {
      setId(data.id);
      setTitle(data.title);
      setSubTitle(data.subTitle);
      setUseLogoImage(data.useLogoImage);
      setLogoImageUrl(data.logoImageUrl);
      setMessage(data.message);
      setPrivacy(data.privacy);
      setWebSiteInformation(data.webSiteInformation);
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
      .from('WebSiteSetting')
      .update({
        title: title,
        subTitle: subTitle,
        useLogoImage: useLogoImage,
        logoImageUrl: logoImageUrl,
        message: message,
        privacy: privacy,
        webSiteInformation: webSiteInformation
      })
      .match({ id: id });

    if (!error) {
      alert('설정 저장 성공!');
      fetchSettings();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  const uploadLogoImageFile = async (event) => {
    const file = event.target.files[0];
    const bucket = "WebSiteSetting"

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`logoImage/${file.name}`, file, { upsert: true });

    if(error) {
      alert(error.message); //new row violates row-level security policy
      return;
    }
    
    const { data: dataPublic, error: errorPublic } = supabase
    .storage
    .from('WebSiteSetting')
    .getPublicUrl(`logoImage/${file.name}`);
    
    const publicUrl = dataPublic.publicUrl;
    //console.log(publicUrl); //https://haeojztqgjldkavhpkeo.supabase.co/storage/v1/object/public/welcome/images/googlelogo.png
    setLogoImageUrl(publicUrl);
    
    alert('로고 이미지 업로드 성공!');
  };
 
  if (loading) 
    return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">웹 사이트 관리 &gt; 설정</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block font-bold mb-1">사이트 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full shadow py-2 px-3 border"
          />
        </div>

        <div className="mb-3">
          <label className="block font-bold mb-1">사이트 하위 제목</label>
          <input
            type="text"
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            className="w-full shadow py-2 px-3 border"
          />
        </div>

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
          <label className="block font-bold mb-1">메시지</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full shadow py-2 px-3 border h-48"
          />
        </div>

        <div className="mb-3">
          <label className="block font-bold mb-1">개인정보 취급방침</label>
          <p><a href="/privacy" target="_blank">개인정보 취급방침 미리 보기</a></p>
          <textarea
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="w-full shadow py-2 px-3 border h-48"
          />
        </div>
             
        <div className="mb-3">
          <label className="block font-bold mb-1">웹사이트 정보</label>
          <textarea
            value={webSiteInformation}
            onChange={(e) => setWebSiteInformation(e.target.value)}
            className="w-full shadow py-2 px-3 border h-48"
          />
        </div>

        <button
          type="submit"
          className="shadow py-2 px-3 border bg-blue-500"
          disabled={loading}
        >
          저장
        </button>
      </form>
    </div>
  );
}
