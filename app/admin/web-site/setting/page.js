"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AdminSettingPage() {
  return (
    <div>
      <p className="mb-3 text-lg font-bold">웹 사이트 관리 &gt; 설정</p>

    </div>
  );
}
