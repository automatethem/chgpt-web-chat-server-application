"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'
import './Pagination.css';
import Pagination from "react-js-pagination";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [page, setPage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [itemsCountPerPage, setItemsCountPerPage] = useState(100);
  const [apiMessageLogs, setApiMessageLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChatBotMessages = async () => {
    setLoading(true);

    const { count } = await supabase
    .from('ApiMessageLog')
    .select('*', { count: 'exact', head: true });
    setTotalItemsCount(count);

    const { data, error } = await supabase
      .from('ApiMessageLog')
      .select('*')
      .order('date', { ascending: false })
      .limit(itemsCountPerPage)
      .range(page-1, page-1 + (itemsCountPerPage - 1))

    setApiMessageLogs(data);

    setLoading(false);
  };

  useEffect(() => {
    fetchChatBotMessages();
  }, [page]);

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleDeleteLogs = async () => {
    const confirmDelete = window.confirm("정말로 메시지 로그를 삭제하시겠습니까?");
    if (confirmDelete) {
      //https://www.reddit.com/r/Supabase/comments/u2pvk7/how_to_delete_all_rows/
      await supabase
      .from('ApiMessageLog')
      .delete()
      .neq("id", 0);
      fetchChatBotMessages();
    }
  };
  
  if (loading) 
    return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">Api 관리 &gt; 메시지 로그</p>

      <div className="mb-3">
        <p>{totalItemsCount} 개의 메시지</p>
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          className="shadow py-2 px-3 border bg-blue-500"
          disabled={loading}
          onClick={handleDeleteLogs}
        >
          메시지 로그 삭제
        </button>
      </div>
    
      <table className="mb-3">
        <thead>
          <tr>
            <th>명령</th>
            <th>메시지</th>
            <th>날짜</th>
          </tr>
        </thead>
        <tbody>
          {apiMessageLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.command}</td>
              <td>{log.message}</td>
              <td>{new Date(log.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        activePage={page}
        itemsCountPerPage={itemsCountPerPage}
        totalItemsCount={totalItemsCount}
        pageRangeDisplayed={5}
        prevPageText={"‹"}
        nextPageText={"›"}
        onChange={handlePageChange}
      />
    </div>
  );
}
