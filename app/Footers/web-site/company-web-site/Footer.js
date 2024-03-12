"use client";
import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setLoading(false);
  }, []);

  if (loading)
    return <>loading</>;

  if (window.location.pathname === '/chat/ai-web-chat') 
    return null;

  return (
    <>
      <hr class="mb-2"/>
      <div class="flex flex-col justify-center items-center">
        <p className="text-sm">크랜베리 | (우: 41974) 대구광역시 중구 달구벌대로 1970 (남산동, 청라 센트럴파크) 201동 2002호 | 대표: 권상기 | 개인정보관리책임자: 권상기</p>
        <p className="text-sm">사업자등록번호: 504-16-12178 | <a href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=5041612178" target="_blank">사업자 등록 번호 확인</a> | 통신판매업신고: 제 2012-대구중구-3090 호</p>
        <p className="text-sm mb-2">고객센터: 010-5778-1756 automatethem@gmail.com</p>
        <p className="text-xs">Copyright © 2024 Cranberry Co. All rights reserved.</p>
      </div>
    </>
  );
};
export default Footer;
