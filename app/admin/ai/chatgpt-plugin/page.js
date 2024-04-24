"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [plugins, setPlugins] = useState([]);
  const [selectedPluginId, setSelectedPluginId] = useState(null);
  const [selectedPluginUrl, setSelectedPluginUrl] = useState('');
  const [newPluginUrl, setNewPluginUrl] = useState('');
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
      .update({ url: selectedPluginUrl })
      .eq('id', selectedPluginId);
    if (error) {
      console.error('Failed to update plugin:', error.message);
    } else {
      await fetchPlugins();
      setSelectedPluginId(null);
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
    .insert([{ url: newPluginUrl }]);
    if (error) {
      console.error('Failed to add plugin:', error.message);
    } else {
      await fetchPlugins();
      setNewPluginUrl('');
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
              <th>Url</th>
              <th>수정</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {plugins.map((plugin) => (
              <tr key={plugin.id}>
                <td>{selectedPluginId === plugin.id ? <input type="text" value={selectedPluginUrl} onChange={(e) => setSelectedPluginUrl(e.target.value)} /> : plugin.url}</td>
                <td>
                  {selectedPluginId === plugin.id ? (
                    <button onClick={updatePlugin}>저장</button>
                  ) : (
                    <button onClick={() => {
                      setSelectedPluginId(plugin.id);
                      setSelectedPluginUrl(plugin.url);
                    }}>수정</button>
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
          <label className="block font-bold mb-1">Url</label>
          <input
            type="text"
            value={newPluginUrl}
            onChange={(e) => setNewPluginUrl(e.target.value)}
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
