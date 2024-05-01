"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function WebSitePageManager() {
  const [pages, setPages] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [editingPage, setEditingPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('WebSitePage')
      .select('*')
      .order('date', { ascending: false });
    if (!error) {
      setPages(data);
    } else {
      console.error('Failed to fetch pages:', error.message);
    }
    setLoading(false);
  };

  const deletePage = async (id) => {
    const confirmDelete = window.confirm("정말로 삭제 하시겠습니까?");
    if (!confirmDelete) return;

    setLoading(true);
    const { error } = await supabase
      .from('WebSitePage')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete page:', error.message);
    } else {
      await fetchPages();
    }
    setLoading(false);
  };

  const addPage = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      alert("제목과 메시지를 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('WebSitePage')
      .insert([{ title: newTitle, message: newMessage }]);
    if (error) {
      console.error('Failed to add page:', error.message);
    } else {
      await fetchPages();
      setNewTitle('');
      setNewMessage('');
      setShowAddModal(false);
    }
    setLoading(false);
  };

  const startEdit = (page) => {
    setEditingPage({ ...page });
    setShowEditModal(true);
  };

  const handleEditChange = (field) => (event) => {
    setEditingPage(prev => ({ ...prev, [field]: event.target.value }));
  };

  const saveEdit = async () => {
    if (!editingPage.title.trim() || !editingPage.message.trim()) {
      alert("제목과 메시지를 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('WebSitePage')
      .update({
        title: editingPage.title,
        message: editingPage.message
      })
      .match({ id: editingPage.id });
    if (error) {
      console.error('Failed to update page:', error.message);
    } else {
      await fetchPages();
      setShowEditModal(false);
      setEditingPage(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">웹 사이트 관리 &gt; 페이지 관리</p>
    
      <button
        type="button"
        className="mb-3 shadow py-2 px-3 border bg-blue-500"
        onClick={() => setShowAddModal(true)}
      >
        추가
      </button>

      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">페이지 추가</h3>
            <div className="py-2">
              <div className="mb-2">
                <label className="label">
                  <span className="label-text">제목</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
              </div>
              <div className="mb-2">
                <label className="label">
                  <span className="label-text">메시지</span>
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="textarea textarea-bordered"
                  rows="7" cols="60"
                ></textarea>
              </div>
            </div>
            <div className="modal-action">
              <button onClick={addPage} className="btn btn-primary">추가</button>
              <button onClick={() => setShowAddModal(false)} className="btn">취소</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">페이지 수정</h3>
            <div className="py-2">
              <div className="mb-2">
                <label className="label">
                  <span className="label-text">제목</span>
                </label>
                <input
                  type="text"
                  placeholder="제목"
                  className="input input-bordered w-full max-w-xs"
                  value={editingPage.title}
                  onChange={handleEditChange('title')}
                />
              </div>
              <div className="mb-2">
                <label className="label">
                  <span className="label-text">메시지</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="메시지"
                  rows="7" cols="60"
                  value={editingPage.message}
                  onChange={handleEditChange('message')}
                ></textarea>
              </div>
            </div>
            <div className="modal-action">
              <button onClick={saveEdit} className="btn btn-primary">저장</button>
              <button onClick={() => setShowEditModal(false)} className="btn">취소</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <table className="table w-full">
          <thead>
            <tr>
              <th>제목</th>
              <th>Url</th>
              <th>수정/삭제</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td>{page.title}</td>
                <td><a href={`/web-site/page/${page.id}`} target='_blank'>/web-site/page/{page.id}</a></td>
                <td>
                  <button onClick={() => startEdit(page)} className="btn btn-sm btn-success mr-2">수정</button>
                  <button onClick={() => deletePage(page.id)} className="btn btn-sm btn-error">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
