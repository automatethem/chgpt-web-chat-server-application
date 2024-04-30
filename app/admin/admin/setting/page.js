"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [id, setId] = useState(null);
  const [menu, setMenu] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('AdminSetting')
      .select('*')
      .single();
    if (!error && data) {
      setId(data.id);
      setMenu(data.menu);
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
      .from('AdminSetting')
      .update({ menu: menu })
      .match({ id: id });

    if (!error) {
      alert('설정 저장 성공!');
      fetchSettings();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (loading) 
    return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">관리자 관리 &gt; 설정</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block font-bold mb-1">메뉴</label>
          <textarea
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
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
