"use client";
import React, { useState, useEffect } from 'react';

const Page = () => {

  return (
    <div>
      <p className="mb-3 text-lg font-bold">웹 사이트 회원 관리 &gt; 회원 수동 추가 방법</p>
수파베이스 무료 사용시 회원 가입 메일 발송 제한 (rate limit이 초과) 이 있어 회원 추가시 수동으로 추가 합니다.<br/> 
<a href="https://supabase.com" target="_blank">https://supabase.com</a> - dashboard - 특정 프로젝트 - Authentication - Users - Add user - Create new user - 추가할 사람의 이메일에 단순한 비밀번호로 추가후 비밀번호를 알려 줍니다.
<br/>
<img src="/admin/web-site-member/add/1.png"/>
<br/>
<img src="/admin/web-site-member/add/2.png"/>
<br/>
<img src="/admin/web-site-member/add/3.png"/>
<br/>
<img src="/admin/web-site-member/add/4.png"/>
    </div>
  );
};

export default Page;
