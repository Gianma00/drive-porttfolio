import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  LogIn, 
  LogOut, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Clock, 
  Download, 
  Search, 
  Loader2, 
  HardDrive, 
  Plus, 
  X, 
  Upload 
} from 'lucide-react';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [accessToken, setAccessToken] = useState('');

 const handleLogin = () => {
    // Usiamo una stringa pulita per evitare errori di interpretazione
    const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      client_id: CLIENT_ID,
      redirect_uri: window.location.origin,
      response_type: "token",
      scope: "https://www.googleapis.com/auth/drive.readonly",
      include_granted_scopes: "true",
      state: "pass-through value"
    };

    // Costruiamo l'URL in modo che non ci siano errori di simboli
    const queryParams = new URLSearchParams(options).toString();
    window.location.href = `${baseUrl}?${queryParams}`;
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get('access_token');
      if (token) {
        setAccessToken(token);
        setIsAuthenticated(true);
        window.location.hash = '';
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchFiles();
    }
  }, [isAuthenticated, accessToken]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,thumbnailLink,createdTime,size)', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken('');
    setFiles([]);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-400" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
    return <File className="w-5 h-5 text-zinc-400" />;
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#030303]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,transparent_50%)]" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md w-full text-center p-12 relative z-10"
        >
          <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Cloud className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">DrivePort</h1>
          <p className="text-zinc-400 mb-10 leading-relaxed">
            Il tuo portfolio cloud personale. Gestisci, visualizza e carica i tuoi file Google Drive in un'interfaccia moderna e fluida.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full bg-white text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            Accedi con Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6 md:p-12 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Cloud className="w-8 h-8" />
            DrivePort
          </h1>
          <p className="text-zinc-500 mt-1">Benvenuto nella tua dashboard cloud.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Cerca file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass p-3 pl-10 rounded-xl w-full md:w-64 focus:outline-none"
            />
          </div>
          <button onClick={handleLogout} className="glass p-3 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
            <LogOut className="w-5 h-5 text-zinc-400" />
            <span className="hidden md:inline">Esci</span>
          </button>
        </div>
      </header>

      <main className="relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-500 gap-4">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p>Sincronizzazione con Google Drive...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl">
            <HardDrive className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">Nessun file trovato.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredFiles.map((file, i) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card group cursor-pointer overflow-hidden p-0"
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="h-40 bg-zinc-900/50 relative flex items-center justify-center">
                    {file.thumbnailLink ? (
                      <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover" />
                    ) : getFileIcon(file.mimeType)}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate text-[15px]">{file.name}</h3>
                    <p className="text-zinc-500 text-[11px] mt-1">{new Date(file.createdTime).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
