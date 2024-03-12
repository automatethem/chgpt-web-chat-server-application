"use client";
import { useEffect, useState } from 'react';

export default function Page() {

  return (

      <div>
        <p className="mb-3 text-lg font-bold">서버 관리 &gt; github 소스 코드 리포지토리 이전 받는 방법</p>

        <div className="mb-3">
          <label className="block font-bold mb-1">알려주실 정보</label>
          <p>github 사용자 이름</p>
          <img src="/admin/server-management/github/github-0.png" />
        </div>
    
        <div className="mb-3">
          <label className="block font-bold mb-1">github 소스 코드 리포지토리 이전</label>
          github 소스 코드 리포지토리 호스팅에 가입
          <a href="https://github.com" target="_blank">https://github.com</a>
          <img src="/admin/server-management/github/github-1.png" />     
          <p>가입한 github 사용자 이름을 알려 주시면 이전 해드리고 아래와 같이 리포지토리 이전 메일이 갑니다. 승인 해주시면 리포지토리가 이전 완료 됩니다. </p>
          <img src="/admin/server-management/github/github-2.png" />
          <p>위 링크를 누르면 아래 지텁으로 이동하며 좌측 상단에 이전된 리포지토리가 표시되며 클릭해 이전된 리포지토리로 들어갈 수 있습니다.</p>
          <img src="/admin/server-management/github/github-3.png" />
          <img src="/admin/server-management/github/github-4.png" />
        </div>

      </div>
  );
}
