"use client";
import { useEffect, useState } from 'react';

export default function Page() {

  return (

      <div>
        <p className="mb-3 text-lg font-bold">서버 관리 &gt; cafe24 서버 호스팅 관리 방법</p>

        <div className="mb-3">
          <label className="block font-bold mb-1">알려주실 정보</label>
          <p>cafe24 아이디 / 암호</p>
        </div>
    
        <div className="mb-3">
          <label className="block font-bold mb-1">카페 24 가입</label>
          <p>카페에 가입</p>
          <a href="https://hosting.cafe24.com/?controller=new_product_page&page=virtual" target="_blank">https://hosting.cafe24.com/?controller=new_product_page&page=virtual</a>
          <br/>        
          <img src="/admin/server-management/cafe24/cafe24-1.png" />        
        </div>

        <div className="mb-3">
          <label className="block font-bold mb-1">카페 24 서버 호스팅</label>
          <p>카페 24 월 5000원 서버 호스팅에 호스팅</p>     
          <p>봇이 미응답시 시스템을 종료후 다시 시작 합니다.</p> 
          <p>나의서비스 관리 페이지 접속 &gt; 서버 원격 관리 클릭</p>
          <img src="/admin/server-management/cafe24/cafe24-2.png" />
          <br/>
          <img src="/admin/server-management/cafe24/cafe24-3.png" />
          <br/>
          <img src="/admin/server-management/cafe24/cafe24-4.png" />
          <p>장시간 미사용시 종료 합니다.</p> 
        </div>

        <div className="mb-3">
          <p className="block font-bold mb-1">카페 24 서버에 터미널에서 접속</p>
          <p>터미널 (위도우에서는 파워셀)에서 아래 명령어를 쳐서 접속 하면 됩니다. 아래 xxx 대신 카페24 아이디 사용</p>
          <p>ssh root@xxx.cafe24.com</p>
          <br/>
          <img src="/admin/server-management/cafe24/cafe24-5.png" />
        </div>
            
      </div>
  );
}
