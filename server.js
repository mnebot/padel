require('dotenv').config();
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.FRONTEND_PORT || 8080;
const HOST = process.env.FRONTEND_HOST || '0.0.0.0';
const BACKEND_PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'localhost';
const PROTOCOL = process.env.PROTOCOL || 'http';

// API proxy - forward all /api requests to the backend
// Always use localhost for backend connection (same machine)
const backendUrl = `http://localhost:${BACKEND_PORT}`;

console.log(`📡 Setting up API proxy: /api -> ${backendUrl}`);

// Health check (before proxy to avoid conflicts)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Frontend server running' });
});

// API proxy - MUST be before static files
app.use('/api', createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] ${req.method} ${req.url} -> ${backendUrl}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({ 
      error: 'ProxyError', 
      message: 'Could not connect to backend API' 
    });
  },
}));

// Serve user app at /usuaris
app.use('/usuaris', express.static(path.join(__dirname, 'user-app/dist')));
app.get('/usuaris/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'user-app/dist/index.html'));
});

// Serve admin app at /admin
app.use('/admin', express.static(path.join(__dirname, 'admin-app/dist')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-app/dist/index.html'));
});

// Redirect root to user app
app.get('/', (req, res) => {
  res.redirect('/usuaris');
});

app.listen(PORT, HOST, () => {
  const baseUrl = DOMAIN === 'localhost' ? `http://localhost:${PORT}` : `${PROTOCOL}://${DOMAIN}:${PORT}`;
  
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`👤 User app: ${baseUrl}/usuaris`);
  console.log(`👨‍💼 Admin app: ${baseUrl}/admin`);
  console.log(`📍 Health check: ${baseUrl}/health`);
  console.log(`🔗 API proxy: ${baseUrl}/api -> http://localhost:${BACKEND_PORT}/api`);
  
  if (DOMAIN !== 'localhost') {
    console.log(`\n🌐 Accessible from network at: ${baseUrl}`);
  }
});
