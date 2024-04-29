'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [newToolName, setNewToolName] = useState('');
  const [newToolUse, setNewToolUse] = useState(true); // Default new tools to be usable
  const [loading, setLoading] = useState(false);

  const fetchTools = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('AiTool')
      .select('*');
    if (!error) {
      setTools(data);
    } else {
      console.error('Failed to fetch tools:', error.message);
    }
    setLoading(false);
  };

  const updateTool = async () => {
    if (!selectedTool) return;
    setLoading(true);
    const { error } = await supabase
      .from('AiTool')
      .update({ name: selectedTool.name, use: selectedTool.use })
      .eq('id', selectedTool.id);
    if (error) {
      console.error('Failed to update tool:', error.message);
    } else {
      await fetchTools();
      setSelectedTool(null);
    }
    setLoading(false);
  };

  const deleteTool = async (id) => {
    const confirmDelete = window.confirm("정말로 삭제 하시겠습니까?");
    if (!confirmDelete) return;

    setLoading(true);
    const { error } = await supabase
      .from('AiTool')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete tool:', error.message);
    } else {
      await fetchTools();
    }
    setLoading(false);
  };

  const addTool = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('AiTool')
      .insert([{ name: newToolName, use: newToolUse }]);
    if (error) {
      console.error('Failed to add tool:', error.message);
    } else {
      await fetchTools();
      setNewToolName('');
      setNewToolUse(true); // Reset the use flag to default
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  if (loading) 
    return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">Ai 관리 &gt; 툴 관리</p>
    
<br/>
기본 툴 설명
<br/>
<br/>
supabase-retriever-tool<br/>
<br/>
webbrowser-tool<br/>
웹브라우저 툴<br/>
예) https://www.naver.com 주소의 내용 요약 해줘<br/>
예) https://www.naver.com 주소에서 링크 주소만 뽑아줘<br/>
<br/>
tavilysearch-tool<br/>
테빌리 서치 툴<br/>
예) 현재 한국 대통령 알려줘<br/>
예) 오늘 서울 날씨 알려줘<br/>
<br/>
dalle-tool<br/>
<br/>
coin-price-tool<br/>
코인 가격 툴<br/>
예) 비트 코인 가격 알려줘<br/>
예) 월드 코인 가격 알려줘<br/>
<br/>
    
      <div className="mb-3">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>사용</th>
              <th>수정</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool.id}>
                <td>{selectedTool?.id === tool.id ? <input type="text" value={selectedTool.name} onChange={(e) => setSelectedTool({...selectedTool, name: e.target.value})} /> : tool.name}</td>
                <td>
                  {selectedTool?.id === tool.id ? (
                    <input 
                      type="checkbox" 
                      checked={selectedTool.use} 
                      onChange={(e) => setSelectedTool({...selectedTool, use: e.target.checked})}
                    />
                  ) : (
                    tool.use ? '사용' : '미사용'
                  )}
                </td>
                <td>
                  {selectedTool?.id === tool.id ? (
                    <button onClick={updateTool}>저장</button>
                  ) : (
                    <button onClick={() => setSelectedTool({...tool, use: tool.use})}>수정</button>
                  )}
                </td>
                <td><button onClick={() => deleteTool(tool.id)}>삭제</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="mb-3 text-lg font-bold">추가</p>
        <div className="mb-3">
          <label className="block font-bold mb-1">이름</label>
          <input
            type="text"
            value={newToolName}
            onChange={(e) => setNewToolName(e.target.value)}
            className="shadow py-2 px-3 border"
          />
          <label className="block font-bold mb-1">사용</label>
          <input
            type="checkbox"
            checked={newToolUse}
            onChange={(e) => setNewToolUse(e.target.checked)}
            className="shadow py-2 px-3 border"
          />
        </div>

        <button
          type="button"
          className="shadow py-2 px-3 border bg-blue-500"
          disabled={loading}
          onClick={addTool}
        >
          추가
        </button>
      </div>
    </div>
  );
}
