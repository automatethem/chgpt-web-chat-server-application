"use client";
import AdminMenu from './AdminMenu';
import { redirect } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const AdminLayout = ({ children }) => {
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

  if (loading)
    return <>loading</>;

  if (user == null)
    return <>접근 권한이 없습니다.</>

  return (
    <>
    <div class="flex flex-row">
      <div className="mr-3"><AdminMenu/></div>
      <div>{children}</div>
    </div>
    </>
  );
};
export default AdminLayout;
