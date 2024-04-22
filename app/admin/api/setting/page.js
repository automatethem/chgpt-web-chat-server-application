"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [id, setId] = useState(null);
  const [apiUrl, setApiUrl] = useState('');
  const [notRegisteredApiOutput, setNotRegisteredApiOutput] = useState({ status: "OK" });
  const [useNotRegisteredApiMessageLog, setUseNotRegisteredApiMessageLog] = useState(false); 
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
        apiUrl,
        notRegisteredApiOutput,
	useNotRegisteredApiMessageLog
      } = data;
      setId(id);
      setApiUrl(apiUrl);
      setNotRegisteredApiOutput(notRegisteredApiOutput);
      setUseNotRegisteredApiMessageLog(useNotRegisteredApiMessageLog);
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
        apiUrl: apiUrl,
        notRegisteredApiOutput: notRegisteredApiOutput,
	useNotRegisteredApiMessageLog: useNotRegisteredApiMessageLog
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

      <div className="mb-3">
        <label className="block font-bold mb-1">미등록 api 출력</label>
	<a href={`${apiUrl}/api/command?command=test&key=123&q=AI`} target="_blank">{`${apiUrl}/api/command?command=test&key=123&q=AI`}</a> 접속시 출력
        <textarea
          value={notRegisteredApiOutput} 
          onChange={(e) => setNotRegisteredApiOutput(e.target.value)}
          className="w-full shadow py-2 px-3 border h-72"
        />
      </div> 

      <div className="mb-3">
        <label className="block font-bold mb-1">미등록 api 메시지 로그 사용</label>
        <input
          type="checkbox"
          checked={useNotRegisteredApiMessageLog}
          onChange={(e) => setUseNotRegisteredApiMessageLog(e.target.checked)}
          className="mr-2"
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
