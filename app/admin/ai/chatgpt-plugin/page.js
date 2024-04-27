"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [plugins, setPlugins] = useState([]);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [newPluginName, setNewPluginName] = useState('');
  const [newPluginUrl, setNewPluginUrl] = useState('');
  const [newPluginUse, setNewPluginUse] = useState(true); 
  const [loading, setLoading] = useState(false);

  const fetchPlugins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('AiChatgptPlugin')
      .select('*');
    if (!error) {
      setPlugins(data);
    } else {
      console.error('Failed to fetch plugins:', error.message);
    }
    setLoading(false);
  };

  const updatePlugin = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('AiChatgptPlugin')
      .update({ name: selectedPlugin.name, url: selectedPlugin.url, use: selectedPlugin.use })
      .eq('id', selectedPlugin.id);
    if (error) {
      console.error('Failed to update plugin:', error.message);
    } else {
      await fetchPlugins();
      setSelectedPlugin(null);
    }
    setLoading(false);
  };

  const deletePlugin = async (id) => {
    const confirmDelete = window.confirm("정말로 삭제 하시겠습니까?");
    if (!confirmDelete) return;

    setLoading(true);
    const { error } = await supabase
      .from('AiChatgptPlugin')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete plugin:', error.message);
    } else {
      await fetchPlugins();
    }
    setLoading(false);
  };

  const addPlugin = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('AiChatgptPlugin')
      .insert([{ name: newPluginName, url: newPluginUrl, use: newPluginUse }]);
    if (error) {
      console.error('Failed to add plugin:', error.message);
    } else {
      await fetchPlugins();
      setNewPluginName('');
      setNewPluginUrl('');
      setNewPluginUse(true); // Reset the use flag to default
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  if (loading) 
    return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">Ai 관리 &gt; 챗지피티 플러그인 관리</p>

      <div className="mb-3">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>Url</th>
              <th>사용</th>
              <th>수정</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {plugins.map((plugin) => (
              <tr key={plugin.id}>
                <td>{selectedPlugin?.id === plugin.id ? <input type="text" value={selectedPlugin.name} onChange={(e) => setSelectedPlugin({...selectedPlugin, name: e.target.value})} /> : plugin.name}</td>
                <td>{selectedPlugin?.id === plugin.id ? <input type="text" value={selectedPlugin.url} onChange={(e) => setSelectedPlugin({...selectedPlugin, url: e.target.value})} /> : plugin.url}</td>
                <td>
                  {selectedPlugin?.id === plugin.id ? (
                    <input 
                      type="checkbox" 
                      checked={selectedPlugin.use} 
                      onChange={(e) => setSelectedPlugin({...selectedPlugin, use: e.target.checked})}
                    />
                  ) : (
                    plugin.use ? '사용' : '미사용'
                  )}
                </td>
                <td>
                  {selectedPlugin?.id === plugin.id ? (
                    <button onClick={updatePlugin}>저장</button>
                  ) : (
                    <button onClick={() => setSelectedPlugin({...plugin, use: plugin.use})}>수정</button>
                  )}
                </td>
                <td><button onClick={() => deletePlugin(plugin.id)}>삭제</button></td>
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
            value={newPluginName}
            onChange={(e) => setNewPluginName(e.target.value)}
            className="shadow py-2 px-3 border"
          />
          <label className="block font-bold mb-1">Url</label>
          <input
            type="text"
            value={newPluginUrl}
            onChange={(e) => setNewPluginUrl(e.target.value)}
            className="shadow py-2 px-3 border"
          />
          <label className="block font-bold mb-1">사용</label>
          <input
            type="checkbox"
            checked={newPluginUse}
            onChange={(e) => setNewPluginUse(e.target.checked)}
            className="shadow py-2 px-3 border"
          />
        </div>

        <button
          type="button"
          className="shadow py-2 px-3 border bg-blue-500"
          disabled={loading}
          onClick={addPlugin}
        >
          추가
        </button>
      </div>
    </div>
  );
}
