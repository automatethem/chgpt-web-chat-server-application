"use client";
import React, { useState, useEffect } from 'react';

const Page = () => {

  return (
    <div>
      <p className="mb-3 text-lg font-bold">서버 관리 &gt; 수파베이스 데이터 베이스 관리 방법</p>
    
      <div className="mb-3">
        <p className="block font-bold mb-1">회원 가입 제한</p>
        수파베이스 (<a href="https://supabase.com" target="_blank">https://supabase.comr</a>) 
        <img src="/admin/server-management/supabase/0.png" />
        <br/>
        <img src="/admin/server-management/supabase/1.png" />      
        <br/>
        <img src="/admin/server-management/supabase/3.png" />      
      </div>
    
      <div className="mb-3">
        <p className="block font-bold mb-1">가입 초대</p>

        <img src="/admin/server-management/supabase/5.png" />
        <br/>
        <img src="/admin/server-management/supabase/4.png" />        
      </div>

      <div className="mb-3">
        <p className="block font-bold mb-1">수동 가입</p>

        <img src="/admin/server-management/supabase/6.png" />
        <br/>
        <img src="/admin/server-management/supabase/7.png" />        
      </div>
  
    </div>
  );
};

export default Page;
