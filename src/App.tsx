import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, LogIn, LogOut, File, Image as ImageIcon, FileText, Clock, Download, Search, Loader2, HardDrive, Plus, X, Upload } from 'lucide-react';

// Recuperiamo il Client ID dalle variabili che hai impostato su Vercel
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [accessToken, setAccessToken] = useState('');

  // Funzione di Login Diretta (Senza Server)
  const handleLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${window.location.origin}&response_type=token&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
  };

  // Cattura il token dall'URL dopo il login
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get('access_token');
      if (token) {
        setAccessToken(token);
        setIsAuthenticated(true);
        window.location.hash = ''; // Pulisce l'URL
      }
    }
  }, []);

  // Carica i file direttamente da Google Drive API
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
      console.error('Errore caricamento file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken('');
    setFiles([]);
  };

  // ... (Il resto della grafica rimane identica a quella che hai postato)
  // Nota: per brevità qui sotto ho messo solo la logica di login, 
  // assicurati di mantenere tutto il tuo codice del return (JSX) originale.
