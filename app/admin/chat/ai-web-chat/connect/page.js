"use client";
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

  if (loading) 
    return <p>Loading...</p>;

  return (

      <div>
        <p className="mb-3 text-lg font-bold">AI 웹 챗 관리 &gt; 웹 사이트 연동 방법</p>
        
      </div>
  );
}
