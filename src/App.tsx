import { useState, useEffect, useRef } from 'react';
import { LogOut, Search, File, Upload, Download, Loader2 } from 'lucide-react';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
// Scope aggiornati per leggere, caricare e scaricare
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.replace('#', '?')).get('access_token');
      if (token) {
        setAccessToken(token);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (accessToken) fetchFiles();
  }, [accessToken]);

  const handleLogin = () => {
    const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      client_id: CLIENT_ID,
      redirect_uri: window.location.origin,
      response_type: "token",
      scope: SCOPES,
      include_granted_scopes: "true",
      state: "pass-through-value"
    };
    const queryParams = new URLSearchParams(options).toString();
    window.location.href = `${baseUrl}?${queryParams}`;
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,thumbnailLink)&pageSize=20',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Errore caricamento file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !accessToken) return;

    setLoading(true);
    try {
      const metadata = { name: file.name, mimeType: file.type };
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
      });
      fetchFiles();
    } catch (err) {
      alert("Errore durante l'upload");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileId: string, fileName: string) => {
    if (!accessToken) return;
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
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Errore nel download");
    }
  };

  const filteredFiles = files.filter((file: any) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            DrivePort
          </h1>
          <p className="text-zinc-400 mb-8 max-w-md">Accedi per gestire i tuoi file di Google Drive in un'interfaccia moderna.</p>
          <button onClick={handleLogin} className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition-colors">
            Accedi con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold">DrivePort</h1>
        
        <div className="flex-1 max-w-xl w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Cerca tra i tuoi file..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg"
            title="Carica file"
          >
            <Upload size={20} />
          </button>
          <button onClick={() => setAccessToken(null)} className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Sincronizzazione in corso...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFiles.map((file: any) => (
            <div key={file.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 group hover:border-zinc-700 transition-all">
              <div className="aspect-video mb-4 overflow-hidden rounded-xl bg-zinc-950 flex items-center justify-center">
                {file.thumbnailLink ? (
                  <img src={file.thumbnailLink} className="w-full h-full object-cover" alt="" />
                ) : (
                  <File size={40} className="text-zinc-700" />
                )}
              </div>
              <h3 className="text-sm font-medium truncate mb-4">{file.name}</h3>
              <button
                onClick={() => downloadFile(file.id, file.name)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors"
              >
                <Download size={14} /> Scarica
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
