"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [id, setId] = useState(null); 
  const [useAi, setUseAi] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [useOpenai, setUseOpenai] = useState(false);
  const [openaiModelName, setOpenaiModelName] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [useCoinPriceTool, setUseCoinPriceTool] = useState(false);
  const [useTavilysearchTool, setUseTavilysearchTool] = useState(false);
  const [tavilysearchToolApiKey, setTavilysearchToolApiKey] = useState('');
  const [useWebbrowserTool, setUseWebbrowserTool] = useState(false);
  const [useMessageLog, setUseMessageLog] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('AiSetting')
      .select('*')
      .single();
    if (!error) {
      const {
        id,
        useAi,
        systemPrompt,
      	useOpenai,
	      openaiModelName,
      	openaiApiKey,
        useCoinPriceTool,
        useTavilysearchTool,
	      tavilysearchToolApiKey,
        useWebbrowserTool,
	      useMessageLog
      } = data;
      setId(id);
      setUseAi(useAi);
      setSystemPrompt(systemPrompt);
      setUseOpenai(useOpenai);
      setOpenaiModelName(openaiModelName);
      setOpenaiApiKey(openaiApiKey);
      setUseCoinPriceTool(useCoinPriceTool);
      setUseTavilysearchTool(useTavilysearchTool);
      setTavilysearchToolApiKey(tavilysearchToolApiKey);
      setUseWebbrowserTool(useWebbrowserTool);
      setUseMessageLog(useMessageLog);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from('AiSetting')
      .update({
        useAi: useAi,
        systemPrompt: systemPrompt,
        useOpenai: useOpenai,
	      openaiModelName: openaiModelName,
        openaiApiKey: openaiApiKey,
        useCoinPriceTool: useCoinPriceTool,
        useTavilysearchTool: useTavilysearchTool,
        tavilysearchToolApiKey: tavilysearchToolApiKey,
        useWebbrowserTool: useWebbrowserTool,
        useMessageLog: useMessageLog
      })
      .match({ id: id });

    if (!error) {
      alert('설정 저장 성공!');
      fetchSettings();
    } 
    else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (loading) 
    return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">Ai 관리 &gt; 설정</p>

      <div className="mb-3">
        <label className="block font-bold mb-1">AI 사용</label>
        <input
          type="checkbox"
          checked={useAi}
          onChange={(e) => setUseAi(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">시스템 프롬프트</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full shadow py-2 px-3 border h-72"
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">Openai 사용</label>
        <input
          type="checkbox"
          checked={useOpenai}
          onChange={(e) => setUseOpenai(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">Openai 모델 이름</label>  
	<p>예) gpt-3.5-turbo</p>
        <p>예) gpt-4</p>
        <p>플레이 그라운드 (<a href="https://platform.openai.com/playground" target="_blank">https://platform.openai.com/playground</a>) 우측 상단 모델 리스트의 모델 이름중 하나 선택</p>
        <p>모델에 대한 세부 사항은 여기 (<a href="https://platform.openai.com/docs/models/overview" target="_blank">https://platform.openai.com/docs/models/overview</a>) 를 참고</p>
        <input
          type="text"
          value={openaiModelName}
          onChange={(e) => setOpenaiModelName(e.target.value)}
          className="w-full shadow py-2 px-3 border"
        />
      </div>
		  
      <div className="mb-3">
        <label className="block font-bold mb-1">Openai api 키</label>
	<p>api 키 만들기: <a href="https://platform.openai.com/api-keys" target="_blank">https://platform.openai.com/api-keys</a></p>
        <p>api 키 만들고 신용 카드 등록후 충전해야 정상적으로 사용 가능:  <a href="https://platform.openai.com/account/billing/overview" target="_blank">https://platform.openai.com/account/billing/overview</a></p>	
        <input
          type="text"
          value={openaiApiKey}
          onChange={(e) => setOpenaiApiKey(e.target.value)}
          className="w-full shadow py-2 px-3 border"
        />
      </div>
            
      <div className="mb-3">
        <label className="block font-bold mb-1">코인 가격 툴 사용</label>
	<p>예) 비트 코인 가격 알려줘</p>
	<p>예) 월드 코인 가격 알려줘</p>
        <input
          type="checkbox"
          checked={useCoinPriceTool}
          onChange={(e) => setUseCoinPriceTool(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">웹브라우저 툴 사용</label>
	<p>예) https://www.naver.com 주소의 내용 요약 해줘</p>
	<p>예) https://www.naver.com 주소에서 링크 주소만 뽑아줘</p>
        <input
          type="checkbox"
          checked={useWebbrowserTool}
          onChange={(e) => setUseWebbrowserTool(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">테빌리 서치 툴 사용</label>
	<p>예) 현재 한국 대통령 알려줘</p>
	<p>예) 오늘 서울 날씨 알려줘</p>
        <input
          type="checkbox"
          checked={useTavilysearchTool}
          onChange={(e) => setUseTavilysearchTool(e.target.checked)}
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">테빌리 서치 툴 api 키</label>
	<p>api 키 만들기: <a href="https://app.tavily.com/home" target="_blank">https://app.tavily.com/home</a></p>
        <input
          type="text"
          value={tavilysearchToolApiKey}
          onChange={(e) => setTavilysearchToolApiKey(e.target.value)}
          className="w-full shadow py-2 px-3 border"
        />
      </div>

      <div className="mb-3">
        <label className="block font-bold mb-1">메시지 로그 사용</label>
        <input
          type="checkbox"
          checked={useMessageLog}
          onChange={(e) => setUseMessageLog(e.target.checked)}
        />
      </div>
            
      <button
        type="submit"
        className="shadow py-2 px-3 border bg-blue-500"
        disabled={loading}
        onClick={handleSubmit}
      >
        저장
      </button>
    </div>
  );
}
