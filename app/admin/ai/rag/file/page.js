"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(1);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('AiRagFile')
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

    //setLoading(true);
    setDeleting(true);

    setDeletingId(id);

    //DELETE FROM documents WHERE (metadata->'source') = '"/tmp/manual.txt"';
    ///*
    const { error } = await supabase
      .from('documents')
      .delete()
      .match({ 'metadata->source': '"/tmp/'+fileName+'"' }); 
    const { error: errorDot } = await supabase
      .from('documents')
      .delete()
      .match({ 'metadata->source': '"./'+fileName+'"' }); 
    //*/
    /*
    //x
    const { error } = await supabase
      .from('documents')
      .delete()
      .match({ 'metadata->source': '"/tmp/'+fileName+'"' })
      .or(`metadata->source.eq."./${fileName}"`); 
    */
    
    const { error: aiRagFileError } = await supabase
      .from('AiRagFile')
      .delete()
      .eq('id', id);
    if (aiRagFileError) {
      console.error('Failed to delete file:', aiRagFileError.message);
    } else {
      await fetchFiles();
    }
    
    //setLoading(false);
    setDeleting(false);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    //setLoading(true);
    setUploading(true);

    const fileName = selectedFile.name;

    // Upload to custom API and save to disk
    const formData = new FormData();
    formData.append('files', selectedFile);
    const response = await fetch('/api/ai/rag/file', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (response.ok) {
      // Insert file metadata into Supabase table
      const { error } = await supabase
        .from('AiRagFile')
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

    //setLoading(false);
    setUploading(false);

    setSelectedFile(null);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p className="mb-3 text-lg font-bold">Ai 관리 &gt; 검색 증강 생성 관리 (파일)</p>

버셀 무료 서버 사용시 데이터 처리 시간이 10 초 이상되면 (타임 아웃) 중지 합니다. 팀 (유료) 전환하거나 PC 에 로컬 웹서버를 띄워 파일을 업로드해 파일 내용을 벡터화 합니다.
    
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
                <td><button onClick={() => deleteFile(file.id, file.fileName)}>
                  {
                    uploading && deletingId == file.id ? (<span className="loading loading-spinner text-primary"></span>) : null
                  } 
                  삭제</button></td>
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
          {
            uploading ? (<span className="loading loading-spinner text-primary"></span>) : null
          }
          업로드
        </button>
      </div>

    </div>
  );
}
