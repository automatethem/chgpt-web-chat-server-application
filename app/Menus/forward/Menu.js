"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const Menu = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser()
      setLoading(false);
      setUser(data.user);
    };
    fetchUser();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    //setUser(null);
    window.location.replace('/');
  }

  if (loading)
    return <>loading</>;

  if (window.location.pathname === '/chat/ai-web-chat') 
    return null;

  return (
    <>
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <div className="join join-vertical">
          <a className="btn btn-ghost text-xl" href="/">홈</a>
          <p className="text-sm">포워드 관리</p>
        </div>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {user != null ? (
          <>
          <li><a href="/admin">관리</a></li>
          <li>
            <details>
              <summary>
              {user.email}
              </summary>
              <ul className="p-2 bg-base-100 rounded-t-none">
                <li><button type="button" onClick={logout}>로그아웃</button></li>
              </ul>
            </details>
          </li>
          </>
          ) : (
            <li><a href="/login">로그인</a></li>
          )}
        </ul>
      </div>
    </div>

  </>
  );


};
export default Menu;
