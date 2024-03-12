"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [id, setId] = useState(null);
  const [apiUrl, setApiUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ApiSetting')
      .select('*')
      .single();
    if (!error) {
      const {
        id,
        apiUrl
      } = data;
      setId(id);
      setApiUrl(apiUrl);
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
      .from('ApiSetting')
      .update({
        apiUrl: apiUrl
      })
      .match({ id: id });

    if (!error) {
      alert('설정 저장 성공!');
      fetchSettings();
    } 
    else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (loading) 
    return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">Api 관리 &gt; 설정</p>

      <div className="mb-3">
        <label className="block font-bold mb-1">Api Url (웹 사이트 주소)</label>
	<p>Vercel 무료 웹 호스팅을 사용하는 경우 Vercel 인증 비활성화</p>
        <img src="/admin/api/setting/1.png"/><br/>
        <img src="/admin/api/setting/2.png"/>
	<p>다른 웹 호스팅을 사용하는 경우 Api Url (웹 사이트 주소) 입력</p>
	<p>예) https://novercelwebsite.com</p>
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="w-full shadow py-2 px-3 border"
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
