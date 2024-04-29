"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [webSiteHideHeaderPages, setWebSiteHideHeaderPages] = useState([]);
  const [newPage, setNewPage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWebSiteHideHeaderPages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('WebSiteHideHeaderPage').select('*');
    if (!error) {
      setWebSiteHideHeaderPages(data);
    } else {
      console.error('Failed to fetch web site hide header pages:', error.message);
    }
    setLoading(false);
  };

  const deleteWebSiteHideHeaderPage = async (id) => {
    const confirmDelete = window.confirm("정말로 삭제 하시겠습니까?");
    if (!confirmDelete) return;

    setLoading(true);
    const { error } = await supabase.from('WebSiteHideHeaderPage').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete web site hide header page:', error.message);
    } else {
      await fetchWebSiteHideHeaderPages();
    }
    setLoading(false);
  };

  const addWebSiteHideHeaderPage = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('WebSiteHideHeaderPage').insert([{ page: newPage }]);
    if (error) {
      console.error('Failed to add web site hide header page:', error.message);
    } else {
      await fetchWebSiteHideHeaderPages();
      setNewPage('');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWebSiteHideHeaderPages();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">웹 사이트 관리 &gt; 헤더 페이지 숨김 관리</p>

      <div className="mb-3">
        <table>
          <thead>
            <tr>
              <th>아이디</th>
              <th>페이지</th>
              <th>날짜</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {webSiteHideHeaderPages.map((page) => (
              <tr key={page.id}>
                <td>{page.id}</td>
                <td>{page.page}</td>
                <td>{new Date(page.date).toLocaleString()}</td>
                <td><button onClick={() => deleteWebSiteHideHeaderPage(page.id)}>삭제</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="mb-3 text-lg font-bold">페이지 추가</p>

        <div className="mb-3">
          <label className="block font-bold mb-1">페이지</label>
          <input
            type="text"
            value={newPage}
            onChange={(e) => { setNewPage(e.target.value); }}
            className="shadow py-2 px-3 border"
          /> 
        </div>

        <button
          type="button"
          className="shadow py-2 px-3 border bg-blue-500"
          disabled={loading}
          onClick={addWebSiteHideHeaderPage}
        >
          추가
        </button> 
      </div>
    </div>
  );
}
