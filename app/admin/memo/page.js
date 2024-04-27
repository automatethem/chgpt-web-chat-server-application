"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [memos, setMemos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [editingMemo, setEditingMemo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchMemos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Memo')
      .select('*')
      .order('date', { ascending: false });
    if (!error) {
      setMemos(data);
    } else {
      console.error('Failed to fetch memos:', error.message);
    }
    setLoading(false);
  };

  const deleteMemo = async (id) => {
    const confirmDelete = window.confirm("정말로 삭제 하시겠습니까?");
    if (!confirmDelete) return;

    setLoading(true);
    const { error } = await supabase
      .from('Memo')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete memo:', error.message);
    } else {
      await fetchMemos();
    }
    setLoading(false);
  };

  const addMemo = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      alert("제목과 메시지를 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('Memo')
      .insert([{ title: newTitle, message: newMessage }]);
    if (error) {
      console.error('Failed to add memo:', error.message);
    } else {
      await fetchMemos();
      setNewTitle('');
      setNewMessage('');
      setShowAddModal(false);
    }
    setLoading(false);
  };

  const startEdit = (memo) => {
    setEditingMemo({ ...memo });
    setShowEditModal(true);
  };

  const handleEditChange = (field) => (event) => {
    setEditingMemo(prev => ({ ...prev, [field]: event.target.value }));
  };

  const saveEdit = async () => {
    if (!editingMemo.title.trim() || !editingMemo.message.trim()) {
      alert("제목과 메시지를 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('Memo')
      .update({
        title: editingMemo.title,
        message: editingMemo.message
      })
      .match({ id: editingMemo.id });
    if (error) {
      console.error('Failed to update memo:', error.message);
    } else {
      await fetchMemos();
      setShowEditModal(false);
      setEditingMemo(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">메모 관리 &gt; 메모 관리</p>
      <button type="button" className="mb-3 shadow py-2 px-3 border bg-blue-500" onClick={() => setShowAddModal(true)}>추가</button>
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">메모 추가</h3>
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
              <button onClick={addMemo} className="btn btn-primary">추가</button>
              <button onClick={() => setShowAddModal(false)} className="btn">취소</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">메모 수정</h3>
            <div className="py-2">
              <div className="mb-2">
                <label className="label">
                  <span className="label-text">제목</span>
                </label>
                <input
                  type="text"
                  placeholder="제목"
                  className="input input-bordered w-full max-w-xs"
                  value={editingMemo.title}
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
                  value={editingMemo.message}
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
              <th>수정/삭제</th>
            </tr>
          </thead>
          <tbody>
            {memos.map((memo) => (
              <tr key={memo.id}>
                <td>{memo.title}</td>
                <td>
                  <button onClick={() => startEdit(memo)} className="btn btn-sm btn-success mr-2">수정</button>
                  <button onClick={() => deleteMemo(memo.id)} className="btn btn-sm btn-error">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
