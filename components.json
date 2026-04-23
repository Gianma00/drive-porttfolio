import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  Upload, 
  Download, 
  File, 
  Image as ImageIcon, 
  FileText, 
  LogOut, 
  LogIn, 
  Plus, 
  X,
  Search,
  Grid,
  List as ListIcon,
  HardDrive,
  Clock,
  Eye,
  Loader2
} from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  size?: string;
  createdTime: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchFiles();
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsAuthenticated(true);
        fetchFiles();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drive/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        setIsAuthenticated(true);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const res = await fetch('/api/auth/url');
    const { url } = await res.json();
    window.open(url, 'google_auth', 'width=600,height=700');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setFiles([]);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const uploadedFiles = Array.from(e.dataTransfer.files);
    // In a real app, implement file upload chunking/multipart here
    console.log('Uploading files:', uploadedFiles);
    alert('Funzionalità di upload attiva! (Mocked per questa demo - richiederebbe implementazione backend stream)');
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
      <div className="min-height-[100vh] flex items-center justify-center relative overflow-hidden bg-[#030303]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,transparent_50%)]" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md w-full text-center p-12 relative z-10"
        >
          <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Cloud className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">DrivePort</h1>
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
    <div 
      className="min-h-screen bg-[#030303] text-white p-6 md:p-12 font-sans"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Cerca file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass p-3 pl-10 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 ring-white/20 transition-all"
            />
          </div>
          <button 
            onClick={handleLogout}
            className="glass p-3 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="hidden md:inline">Esci</span>
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">I Miei File</h2>
            <div className="h-px w-24 bg-zinc-800" />
          </div>
          <button className="glass px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
            <Plus className="w-4 h-4" />
            Nuovo Caricamento
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-500 gap-4">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="animate-pulse">Sincronizzazione con Google Drive...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl">
            <HardDrive className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">Nessun file trovato.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredFiles.map((file, i) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card group cursor-pointer overflow-hidden p-0"
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="h-40 bg-zinc-900/50 relative overflow-hidden flex items-center justify-center">
                    {file.thumbnailLink ? (
                      <img 
                        src={file.thumbnailLink.replace('=s220', '=s600')} 
                        alt={file.name}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 bg-black/40 px-2 py-1 rounded backdrop-blur">
                        {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                      <div className="flex gap-2">
                        <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             window.open(`/api/drive/file/${file.id}`, '_blank');
                           }}
                          className="p-2 glass rounded-full hover:bg-white text-zinc-300 hover:text-black transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate text-[15px] mb-1 group-hover:text-blue-400 transition-colors">
                      {file.name}
                    </h3>
                    <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(file.createdTime).toLocaleDateString()}
                      </span>
                      <span>{(parseInt(file.size || '0') / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* File Preview Modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass max-w-4xl w-full max-h-[85vh] overflow-hidden rounded-3xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getFileIcon(selectedFile.mimeType)}
                  <h3 className="text-xl font-bold">{selectedFile.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="p-2 glass rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 bg-zinc-950 flex items-center justify-center p-8 overflow-auto">
                {selectedFile.mimeType.startsWith('image/') ? (
                  <img 
                    src={`/api/drive/file/${selectedFile.id}`} 
                    className="max-w-full max-h-full rounded-lg shadow-2xl" 
                    referrerPolicy="no-referrer"
                  />
                ) : selectedFile.mimeType.includes('pdf') ? (
                  <iframe 
                    src={`/api/drive/file/${selectedFile.id}#toolbar=0`} 
                    className="w-full h-[60vh] rounded-lg"
                  />
                ) : (
                  <div className="text-center p-12">
                    <File className="w-20 h-20 text-zinc-800 mx-auto mb-6" />
                    <p className="text-zinc-500">Nessuna anteprima disponibile per questo tipo di file.</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-white/5 flex items-center justify-between">
                <div className="text-zinc-400 text-sm">
                  Aggiunto il {new Date(selectedFile.createdTime).toLocaleString()}
                </div>
                <div className="flex gap-3">
                  <a 
                    href={`/api/drive/file/${selectedFile.id}`}
                    download={selectedFile.name}
                    className="bg-white text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Scarica File
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-blue-500/20 backdrop-blur-md border-4 border-dashed border-blue-500 m-8 rounded-3xl flex items-center justify-center"
          >
            <div className="text-center">
              <Upload className="w-24 h-24 text-white mx-auto mb-6 animate-bounce" />
              <h2 className="text-4xl font-bold text-white">Rilascia per caricare</h2>
              <p className="text-white/80 mt-2 text-xl italic select-none">I tuoi file saranno al sicuro nel cloud</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
