"use client";
import { useEffect, useState } from 'react';

export default function Page() {

  return (
    <div>
      <p className="mb-3 text-lg font-bold">Ai 관리 &gt; Pc 에서 검색 증강 생성 방법</p>

      <div className="mb-3">
        <p className="block font-bold mb-1">nodejs 를 다운받아 설치</p>
        <a href="https://nodejs.org/en" target="_blank">https://nodejs.org/en</a>에서 nodejs 를 다운받아 설치 합니다.
        <br/>
        <img src="/admin/ai/rag/pc/1.PNG"/>  
      </div>

      <div className="mb-3">
        <p className="block font-bold mb-1">지텁 리포지토리 다운 및 압축 해제</p>
        <br/>
        <img src="/admin/ai/rag/pc/2.PNG"/>  
        <br/>
        <img src="/admin/ai/rag/pc/3.PNG"/>  
      </div>

      <div className="mb-3">
        <p className="block font-bold mb-1">npm 라이브러리 설치 및 로컬 웹 서버 실행</p>
        <br/>
        <img src="/admin/ai/rag/pc/4.PNG"/>  
        <br/>
        <img src="/admin/ai/rag/pc/5.PNG"/>  
        <br/>
        <img src="/admin/ai/rag/pc/6.PNG"/>  
      </div>

      <div className="mb-3">
        <p className="block font-bold mb-1">검색 증강 생성</p>
        <br/>
        <img src="/admin/ai/rag/pc/7.PNG"/>  
        <br/>
        <img src="/admin/ai/rag/pc/8.PNG"/>  
        <br/>
        <img src="/admin/ai/rag/pc/9.PNG"/>  
      </div>
          
    </div>
  );
}
