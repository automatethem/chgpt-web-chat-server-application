"use client";
import { useEffect, useState } from 'react';

export default function Page() {

  return (

      <div>
        <p className="mb-3 text-lg font-bold">서버 관리 &gt; aws 서버 호스팅 관리 방법</p>

        <div className="mb-3">
          <p className="block font-bold mb-1">알려주실 정보</p>
          <p>aws 아이디 / 암호</p>
        </div>

        <div className="mb-3">
          <p className="block font-bold mb-1">aws 가입</p>
          <p>aws 1년 무료 서버 호스팅 에 가입</p>
          <a href="https://aws.amazon.com" target="_blank">https://aws.amazon.com</a>
          <img src="/admin/server-management/aws/aws-1.png" />
        </div>
            
        <div className="mb-3">
          <p className="block font-bold mb-1">aws 서버 호스팅</p>
          <p>서버 호스팅</p>
          <img src="/admin/server-management/aws/aws-2.png" />
          <p>봇이 미응답시 시스템을 재부팅 (혹은 중지후 다시 시작) 합니다.</p>
          <img src="/admin/server-management/aws/aws-3.png" />
          <p>장시간 미사용시 중지 합니다.</p> 
          <p>완전 삭제시는 종료 합니다.</p>
        </div>

        <div className="mb-3">
          <p className="block font-bold mb-1">aws 서버에 터미널에서 접속</p>
          <p>pem 파일을 다운 받아 터미널 (위도우에서는 파워셀)에서 아래 명령어를 쳐서 접속 하면 됩니다. 아래 111.222.333.444 대신 aws 서버 public ip 사용</p>
<p>chmod 400 /Users/xxx/Documents/aws/xxx.pem</p>
<p>ssh -i "/Users/xxx/Documents/aws/xxx.pem" ubuntu@111.222.333.444</p>
          <br/>
          <img src="/admin/server-management/aws/aws-4.png" />
          <br/>
          <img src="/admin/server-management/aws/aws-5.png" />
        </div>
            
      </div>
  );
}
