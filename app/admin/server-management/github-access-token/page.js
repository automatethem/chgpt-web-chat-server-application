"use client";
import { useEffect, useState } from 'react';

export default function Page() {

  return (

      <div>
        <p className="mb-3 text-lg font-bold">서버 관리 &gt; github 액세스 토큰 만드는 방법</p>

        <div className="mb-3">
          <label className="block font-bold mb-1">알려주실 정보</label>
          <p>github 액세스 토큰</p>
          <img src="/admin/server-management/github-access-token/9.png" />
        </div>
    
        <div className="mb-3">
          <p>github 소스 코드 리포지토리 호스팅에 가입 <a href="https://github.com" target="_blank">https://github.com</a></p>
          <img src="/admin/server-management/github-access-token/1.png" />
          <br/>
          <img src="/admin/server-management/github-access-token/2.png" />
          <p>Settings - Developers settings - Personal access tokens - Tokens (classic) 메뉴로 갑니다.</p>
          <img src="/admin/server-management/github-access-token/3.png" />
          <br/>
          <img src="/admin/server-management/github-access-token/4.png" />
          <br/>
          <img src="/admin/server-management/github-access-token/5.png" />
          <p>Generate new token (classic) 를 클릭합니다.</p>
          <img src="/admin/server-management/github-access-token/6.png" />
          <br/>
          <img src="/admin/server-management/github-access-token/7.png" />
          <p>Generate token 버튼을 클릭 합니다.</p>
          <img src="/admin/server-management/github-access-token/8.png" />
          <p>생성된 액세스 토큰을 메모 합니다.</p>
          <img src="/admin/server-management/github-access-token/9.png" />
        </div>

      </div>
  );
}
