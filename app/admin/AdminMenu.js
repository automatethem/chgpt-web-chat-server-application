"use client";
import React, { useState, useEffect } from 'react';
import Script from 'next/script'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
 
const Page = () => {
  const [id, setId] = useState(null);
  const [menu, setMenu] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
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
  }, []);

  if (loading)
    return <>loading</>;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: menu }} />
    </>
  );
};
export default Page;
