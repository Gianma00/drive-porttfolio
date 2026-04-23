import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = `${process.env.APP_URL}/auth/callback`;

// Helper to get access token from cookie
const getAccessToken = (req: express.Request) => req.cookies.access_token;

// --- AUTH ROUTES ---

app.get('/api/auth/url', (req, res) => {
  if (!CLIENT_ID) {
    return res.status(500).json({ error: 'CLIENT_ID not configured' });
  }
  
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });

  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
});

app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code } = req.query;

  if (!code || !CLIENT_ID || !CLIENT_SECRET) {
    return res.send('Error: Missing code or configuration');
  }

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token } = response.data;

    // Set cookies with required AI Studio iframe settings
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600 * 1000 // 1 hour
    });

    if (refresh_token) {
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 3600 * 1000 // 30 days
      });
    }

    res.send(`
      <html>
        <body style="background: #09090b; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <div style="text-align: center;">
            <h2>Autenticazione completata!</h2>
            <p>Questa finestra si chiuderà automaticamente.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed');
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.status(200).json({ success: true });
});

// --- DRIVE PROXY API ---

app.get('/api/drive/files', async (req, res) => {
  const token = getAccessToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        pageSize: 50,
        fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, iconLink, size, createdTime)',
        q: "trashed = false",
        orderBy: 'createdTime desc'
      }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Drive API error' });
  }
});

// For simplicity, we proxy the file content or download link
app.get('/api/drive/file/:fileId', async (req, res) => {
  const token = getAccessToken(req);
  const { fileId } = req.params;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const response = await axios.get(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { alt: 'media' },
      responseType: 'arraybuffer'
    });

    // Pass through content type
    const metadata = await axios.get(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { fields: 'mimeType,name' }
    });

    res.setHeader('Content-Type', metadata.data.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${metadata.data.name}"`);
    res.send(Buffer.from(response.data));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
