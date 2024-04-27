"use client";
import { createClient } from '@supabase/supabase-js';

export default function Page() {

  return (
    <div>
      <p className="mb-3 text-lg font-bold">Ai 관리 &gt; 파인 튜닝 방법</p>

      <div className="mb-3">
        <a href="https://github.com/automatethem/chatgpt-fine-tuning" target="_blank">https://github.com/automatethem/chatgpt-fine-tuning</a>
        설명을 보고 파인 튜닝 한후 <a href="/admin/ai/setting" target="_blank">AI 관리 &gt; 설정</a>에서 Openai 모델에 파인튜닝 한 모델 이름을 넣으면 됩니다.  
        <br/>
        <img src="/admin/ai/fine-tuning/1.png"/>
        <br/>
        <img src="/admin/ai/fine-tuning/2.png"/>
      </div>
    </div>
  );
}
