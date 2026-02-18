require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'hometop-secret-alterar-em-producao';

// Diretórios
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_PATH = path.join(__dirname, 'db.json');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Banco de dados
const defaultData = {
  users: [
    { id: '1', email: 'admin@hometop.com.br', password: 'admin123' }
  ],
  contacts: {
    numbers: [
      { id: '1', number: '5547999140885' },
      { id: '2', number: '5547997287663' }
    ]
  },
  sites: [
    { id: '1', label: 'Instagram', url: 'https://www.instagram.com/hometopcortinasdecor/' },
    { id: '2', label: 'Google Maps', url: 'https://maps.app.goo.gl/g35MoFnewbufKrgx9' }
  ],
  leads: [],
  heroImage: 'assets/img/hero-interior.png',
  projects: []
};

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
}

const adapter = new JSONFile(DB_PATH);
const db = new Low(adapter, defaultData);

// Multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + (file.originalname || 'img'))
});
const upload = multer({ storage });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Não autorizado' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// —— Login ——
app.post('/api/login', async (req, res) => {
  await db.read();
  const { email, password } = req.body || {};
  const user = db.data.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email } });
});

// —— Contatos (público para o site) ——
app.get('/api/public/contacts', async (req, res) => {
  await db.read();
  const c = db.data.contacts || {};
  let numbers = c.numbers || [];
  if (numbers.length === 0 && (c.whatsapp1 || c.whatsapp2)) {
    if (c.whatsapp1) numbers.push({ id: '1', number: c.whatsapp1 });
    if (c.whatsapp2) numbers.push({ id: '2', number: c.whatsapp2 });
  }
  res.json({
    numbers,
    sites: db.data.sites || []
  });
});

// —— Contatos (admin) ——
app.get('/api/contacts', authMiddleware, async (req, res) => {
  await db.read();
  let sites = db.data.sites || [];
  const c = db.data.contacts || {};
  if (sites.length === 0 && (c.instagram || c.maps)) {
    if (c.instagram) sites.push({ id: '1', label: 'Instagram', url: c.instagram });
    if (c.maps) sites.push({ id: '2', label: 'Google Maps', url: c.maps });
  }
  let numbers = c.numbers || [];
  if (numbers.length === 0 && (c.whatsapp1 || c.whatsapp2)) {
    if (c.whatsapp1) numbers.push({ id: '1', number: c.whatsapp1 });
    if (c.whatsapp2) numbers.push({ id: '2', number: c.whatsapp2 });
  }
  res.json({
    contacts: { numbers },
    sites
  });
});
app.put('/api/contacts', authMiddleware, async (req, res) => {
  await db.read();
  const { contacts, sites } = req.body || {};
  if (contacts && typeof contacts === 'object') {
    if (Array.isArray(contacts.numbers)) {
      db.data.contacts = db.data.contacts || {};
      db.data.contacts.numbers = contacts.numbers;
    }
  }
  if (Array.isArray(sites)) {
    db.data.sites = sites;
  }
  await db.write();
  res.json({ contacts: db.data.contacts, sites: db.data.sites || [] });
});

// —— Leads ——
app.post('/api/leads', async (req, res) => {
  await db.read();
  const { nome, telefone, mensagem, origem = 'site' } = req.body || {};
  if (!nome || !telefone) return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  const lead = {
    id: Date.now().toString(),
    nome: String(nome).trim(),
    telefone: String(telefone).trim(),
    mensagem: (mensagem || '').trim(),
    origem,
    data: new Date().toISOString()
  };
  db.data.leads = db.data.leads || [];
  db.data.leads.unshift(lead);
  await db.write();
  res.status(201).json(lead);
});
app.get('/api/leads', authMiddleware, async (req, res) => {
  await db.read();
  const list = (db.data.leads || []).slice();
  res.json(list);
});
app.delete('/api/leads/:id', authMiddleware, async (req, res) => {
  await db.read();
  db.data.leads = (db.data.leads || []).filter(l => l.id !== req.params.id);
  await db.write();
  res.json({ ok: true });
});

// —— Produtos (público) ——
app.get('/api/public/products', async (req, res) => {
  await db.read();
  res.json(db.data.products || []);
});
app.get('/api/public/products/:id', async (req, res) => {
  await db.read();
  const prod = (db.data.products || []).find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(prod);
});

// —— Produtos (admin) ——
app.get('/api/products', authMiddleware, async (req, res) => {
  await db.read();
  res.json(db.data.products || []);
});
app.put('/api/products/:id', authMiddleware, async (req, res) => {
  await db.read();
  db.data.products = db.data.products || [];
  const idx = db.data.products.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Produto não encontrado' });
  db.data.products[idx] = { ...db.data.products[idx], ...req.body };
  await db.write();
  res.json(db.data.products[idx]);
});
app.post('/api/products', authMiddleware, async (req, res) => {
  await db.read();
  db.data.products = db.data.products || [];
  const { title, desc, image, collections } = req.body || {};
  const id = (title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'produto-' + Date.now();
  const product = { id, title: title || 'Novo Produto', desc: desc || '', image: image || '', collections: collections || [] };
  db.data.products.push(product);
  await db.write();
  res.status(201).json(product);
});
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  await db.read();
  db.data.products = (db.data.products || []).filter(p => p.id !== req.params.id);
  await db.write();
  res.json({ ok: true });
});

// —— Imagens (upload e hero/galeria) ——
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo' });
  const url = '/uploads/' + req.file.filename;
  res.json({ url, filename: req.file.filename });
});
app.get('/api/hero-image', async (req, res) => {
  await db.read();
  res.json({ url: db.data.heroImage || '' });
});
app.put('/api/hero-image', authMiddleware, async (req, res) => {
  await db.read();
  db.data.heroImage = req.body.url || db.data.heroImage;
  await db.write();
  res.json({ url: db.data.heroImage });
});
// —— Projetos (galeria de projetos) ——
app.get('/api/public/projects', async (req, res) => {
  await db.read();
  res.json(db.data.projects || []);
});
app.get('/api/public/projects/:id', async (req, res) => {
  await db.read();
  const proj = (db.data.projects || []).find(p => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });
  res.json(proj);
});
app.get('/api/projects', authMiddleware, async (req, res) => {
  await db.read();
  res.json(db.data.projects || []);
});
app.post('/api/projects', authMiddleware, async (req, res) => {
  await db.read();
  db.data.projects = db.data.projects || [];
  const { title, image, media } = req.body || {};
  const id = (title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'projeto-' + Date.now();
  const project = { id, title: title || 'Novo Projeto', image: image || '', media: media || [] };
  db.data.projects.push(project);
  await db.write();
  res.status(201).json(project);
});
app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  await db.read();
  db.data.projects = db.data.projects || [];
  const idx = db.data.projects.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Projeto não encontrado' });
  db.data.projects[idx] = { ...db.data.projects[idx], ...req.body };
  await db.write();
  res.json(db.data.projects[idx]);
});
app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  await db.read();
  db.data.projects = (db.data.projects || []).filter(p => p.id !== req.params.id);
  await db.write();
  res.json({ ok: true });
});

// Servir dashboard e site estático (opcional)
const projectRoot = path.join(__dirname, '..');
app.use(express.static(projectRoot));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('API: /api/login, /api/contacts, /api/leads, /api/collections, /api/upload');
});
