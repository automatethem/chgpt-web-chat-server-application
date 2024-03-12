"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  /*
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
  */
);

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('회원 목록을 가져오는데 실패했습니다.', error);
      setLoading(false);
      return;
    }
    setUsers(data.users || []);
    setLoading(false);
  };

  const deleteUser = async (userId) => {
    if (window.confirm("정말로 이 회원을 삭제하시겠습니까?")) {
      setLoading(true);
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        console.error('회원 삭제에 실패했습니다.', error.message);
      } 
      else {
        alert('회원이 성공적으로 삭제되었습니다.');
        fetchUsers(); // 회원 목록을 다시 가져옵니다.
      }
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">웹 사이트 회원 관리 &gt; 회원 관리</p>

      <table>
        <thead>
          <tr>
            <th>아이디</th>
            <th>이메일</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => { deleteUser(user.id); }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
