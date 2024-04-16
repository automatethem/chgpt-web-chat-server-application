"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AiRagPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('AiRag')
      .select('*')
      .order("date", { ascending: false });
    if (!error) {
      setFiles(data);
    } else {
      console.error('Failed to fetch files:', error.message);
    }
    setLoading(false);
  };

  const deleteFile = async (id, fileName) => {
    const confirmDelete = window.confirm("정말로 삭제 하시겠습니까?");
    if (!confirmDelete) return;

    setLoading(true);

    //DELETE FROM documents WHERE (metadata->'source') = '"/tmp/manual.txt"';
    const { error } = await supabase
      .from('documents')
      .delete()
      .match({ 'metadata->source': '"/tmp/'+fileName+'"' }); 

    const { error: aiRagError } = await supabase
      .from('AiRag')
      .delete()
      .eq('id', id);
    if (aiRagError) {
      console.error('Failed to delete file:', aiRagError.message);
    } else {
      await fetchFiles();
    }
    
    setLoading(false);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const fileName = selectedFile.name;

    // Upload to custom API and save to disk
    const formData = new FormData();
    formData.append('files', selectedFile);
    const response = await fetch('/api/ai/rag', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (response.ok) {
      // Insert file metadata into Supabase table
      const { error } = await supabase
        .from('AiRag')
        .insert([
          { fileName: fileName } 
        ]);
      
      if (error) {
        console.error('Failed to add file to Supabase:', error.message);
      } else {
        await fetchFiles(); // Reload the files list
      }
    } else {
      console.error('Failed to save file to disk:', result.error);
    }

    setLoading(false);
    setSelectedFile(null);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">AI 관리 &gt; 문서 지식 관리</p>

      <div className="mb-3">
        <table>
          <thead>
            <tr>
              <th>파일명</th>
              <th>업로드 날짜</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td>{file.fileName}</td>
                <td>{new Date(file.date).toLocaleString()}</td>
                <td><button onClick={() => deleteFile(file.id, file.fileName)}>삭제</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="mb-3 text-lg font-bold">추가</p>

        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="mb-3 shadow py-2 px-3 border"
        />
        <button
          type="button"
          className="shadow py-2 px-3 border bg-blue-500"
          disabled={loading || !selectedFile}
          onClick={uploadFile}
        >
          업로드
        </button>
      </div>

    </div>
  );
}
