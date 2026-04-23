import { useState, useEffect, useRef } from 'react';
// ... (tieni gli stessi import di prima)

// CAMBIA LO SCOPE QUI SOTTO
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';

export default function App() {
  // ... (tieni gli stati esistenti)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FUNZIONE PER SCARICARE
  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (err) {
      alert("Errore nel download");
    }
  };

  // FUNZIONE PER CARICARE (UPLOAD)
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const metadata = {
      name: file.name,
      mimeType: file.type
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    try {
      await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
      });
      fetchFiles(); // Ricarica la lista
    } catch (err) {
      alert("Errore nell'upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6">
      <header className="flex justify-between items-center mb-8">
        {/* ... titolo ... */}
        <div className="flex gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Upload size={18} /> Carica File
          </button>
          {/* ... tasto logout ... */}
        </div>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {files.map((file: any) => (
          <div key={file.id} className="glass-card p-4 group relative">
            <div className="aspect-video mb-4 overflow-hidden rounded-lg bg-zinc-900">
               {file.thumbnailLink ? <img src={file.thumbnailLink} className="w-full h-full object-cover" /> : <File size={40} />}
            </div>
            <h3 className="truncate">{file.name}</h3>
            <button 
              onClick={() => downloadFile(file.id, file.name)}
              className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center gap-2"
            >
              <Download size={16} /> Scarica
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
