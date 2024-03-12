"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [messageLocks, setMessageLocks] = useState([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [newDay, setNewDay] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchMessageLocks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('TelegramChatMessageLock').select('*');
    if (!error) {
      setMessageLocks(data);
    } else {
      console.error('Failed to fetch message locks:', error.message);
    }
    setLoading(false);
  };

  const deleteMessageLock = async (id) => {
    const confirmDelete = window.confirm("정말로 삭제 하시겠습니까?");
    if (!confirmDelete) return; // 사용자가 취소한 경우

    setLoading(true);
    const { error } = await supabase.from('TelegramChatMessageLock').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete message lock:', error.message);
    } else {
      await fetchMessageLocks();
    }
    setLoading(false);
  };

  const uploadWelcomeMessageImageFile = async (event) => {
    const file = event.target.files[0];
    const bucket = "welcome"

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`images/${file.name}`, file, { upsert: true });

    if(error) {
      alert(error.message); //new row violates row-level security policy
      return;
    }

    const { data: dataPublic, error: errorPublic } = supabase
    .storage
    .from('welcome')
    .getPublicUrl(`images/${file.name}`);
    
    const publicUrl = dataPublic.publicUrl;
    //console.log(publicUrl); //https://haeojztqgjldkavhpkeo.supabase.co/storage/v1/object/public/welcome/images/googlelogo.png
    setWelcomeMessageImageUrl(publicUrl);
    
    alert('환영 메시지 이미지 업로드 성공!');
  };

  useEffect(() => {
    fetchMessageLocks();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">AI 관리 &gt; 내부 지식 관리</p>

      <div className="mb-3">
        <table>
          <thead>
            <tr>
              <th>아이디</th>
              <th>날짜</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {messageLocks.map((lock) => (
              <tr key={lock.id}>
                <td>{lock.memberId}</td>
                <td>{new Date(lock.date).toLocaleString()}</td>
                <td><button onClick={() => deleteMessageLock(lock.id)}>삭제</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="mb-3 text-lg font-bold">추가</p>

        <div className="mb-3">
          <label className="block font-bold mb-1">아이디</label>
          <input
            type="number"
            value={newMemberId}
            onChange={(e) => { setNewMemberId(e.target.value); }}
            className="shadow py-2 px-3 border"
          /> 
        </div>

        <div className="mb-3">
          <label className="block font-bold mb-1">락 일수</label>
          <input
            type="number"
            value={newDay}
            onChange={(e) => { setNewDay(Number(e.target.value)); }}
            className="shadow py-2 px-3 border"
          /> 
        </div>

        <div className="mb-3">
          <label className="block font-bold mb-1">환영 메시지 이미지</label>
          <input 
            type="text"

            className="w-full shadow py-2 px-3 border"
          />
          <input type="file" onChange={(e) => {uploadWelcomeMessageImageFile(e);}} />
        </div>
              
        <button
          type="button"
          className="shadow py-2 px-3 border bg-blue-500"
          disabled={loading}
          onClick={(e) => {uploadWelcomeMessageImageFile(e);}}
        >
          추가
        </button> 
      </div>
    </div>
  );
}
