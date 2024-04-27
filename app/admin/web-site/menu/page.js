"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [menus, setMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedMenuName, setSelectedMenuName] = useState('');
  const [selectedMenuUrl, setSelectedMenuUrl] = useState('');
  const [selectedMenuPriority, setSelectedMenuPriority] = useState(1);
  const [selectedMenuOpenWindow, setSelectedMenuOpenWindow] = useState(false); // 변경된 부분
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuUrl, setNewMenuUrl] = useState('');
  const [newMenuPriority, setNewMenuPriority] = useState(1);
  const [newMenuOpenWindow, setNewMenuOpenWindow] = useState(false); // 변경된 부분
  const [loading, setLoading] = useState(false);

  const fetchMenus = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('WebSiteMenu')
      .select('*')
      .order("priority");
    if (!error) {
      setMenus(data);
    } 
    else {
      console.error('Failed to fetch menu items:', error.message);
    }
    setLoading(false);
  };

  const updateMenuItem = async () => {
    if (!selectedMenuId) return;
    setLoading(true);
    const { error } = await supabase
      .from('WebSiteMenu')
      .update({
        name: selectedMenuName,
        url: selectedMenuUrl,
        priority: selectedMenuPriority,
        openWindow: selectedMenuOpenWindow // 변경된 부분
      })
      .eq('id', selectedMenuId);
    if (error) {
      console.error('Failed to update menu item:', error.message);
    } else {
      await fetchMenus();
      setSelectedMenuId(null);
    }
    setLoading(false);
  };

  const deleteMenuItem = async (id) => {
    const confirmDelete = window.confirm("정말로 삭제 하시겠습니까?");
    if (!confirmDelete) return;

    setLoading(true);
    const { error } = await supabase
      .from('WebSiteMenu')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete menu item:', error.message);
    } else {
      await fetchMenus();
    }
    setLoading(false);
  };

  const addMenuItem = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('WebSiteMenu')
      .insert([
        { 
          name: newMenuName, 
          url: newMenuUrl, 
          priority: newMenuPriority,
          openWindow: newMenuOpenWindow // 변경된 부분
        }
      ]);
    if (error) {
      console.error('Failed to add menu item:', error.message);
    } else {
      await fetchMenus();
      setNewMenuName('');
      setNewMenuUrl('');
      setNewMenuPriority(1);
      setNewMenuOpenWindow(false); // 변경된 부분
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">웹 사이트 관리 &gt; 메뉴 관리</p>

      <div className="mb-3">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>URL</th>
              <th>우선순위</th>
              <th>새 창</th> {/* 변경된 부분 */}
              <th>수정</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((item) => (
              <tr key={item.id}>
                <td>{selectedMenuId === item.id ? <input type="text" value={selectedMenuName} onChange={(e) => setSelectedMenuName(e.target.value)} /> : item.name}</td>
                <td>{selectedMenuId === item.id ? <input type="text" value={selectedMenuUrl} onChange={(e) => setSelectedMenuUrl(e.target.value)} /> : item.url}</td>
                <td>{selectedMenuId === item.id ? <input type="number" value={selectedMenuPriority} onChange={(e) => setSelectedMenuPriority(Number(e.target.value))} /> : item.priority}</td>
                <td>{selectedMenuId === item.id ? <input type="checkbox" checked={selectedMenuOpenWindow} onChange={(e) => setSelectedMenuOpenWindow(e.target.checked)} /> : item.openWindow ? "예" : "아니요"}</td> {/* 변경된 부분 */}
                <td>
                  {selectedMenuId === item.id ? (
                    <button onClick={updateMenuItem}>저장</button>
                  ) : (
                    <button onClick={() => {
                      setSelectedMenuId(item.id);
                      setSelectedMenuName(item.name);
                      setSelectedMenuUrl(item.url);
                      setSelectedMenuPriority(item.priority);
                      setSelectedMenuOpenWindow(item.openWindow); // 변경된 부분
                    }}>수정</button>
                  )}
                </td>
                <td><button onClick={() => deleteMenuItem(item.id)}>삭제</button></td>
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
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            className="shadow py-2 px-3 border"
          />
        </div>

        <div className="mb-3">
          <label className="block font-bold mb-1">URL</label>
          <input
            type="text"
            value={newMenuUrl}
            onChange={(e) => setNewMenuUrl(e.target.value)}
            className="shadow py-2 px-3 border"
          />
        </div>

        <div className="mb-3">
          <label className="block font-bold mb-1">우선순위</label>
          <input
            type="number"
            value={newMenuPriority}
            onChange={(e) => setNewMenuPriority(Number(e.target.value))}
            className="shadow py-2 px-3 border"
          />
        </div>

        <div className="mb-3">
          <label className="block font-bold mb-1">새 창</label> {/* 변경된 부분 */}
          <input
            type="checkbox"
            checked={newMenuOpenWindow}
            onChange={(e) => setNewMenuOpenWindow(e.target.checked)}
            className="shadow py-2 px-3 border"
          />
        </div>

        <button
          type="button"
          className="shadow py-2 px-3 border bg-blue-500"
          disabled={loading}
          onClick={addMenuItem}
        >
          추가
        </button>
      </div>
    </div>
  );
}
