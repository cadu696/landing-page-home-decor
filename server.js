// Local dev server — emulates Vercel serverless functions
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

// Rewrite /uploads/* → backend/uploads/* (mirrors vercel.json rewrite)
app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));

// Serve static files (root site + dashboard)
app.use(express.static(path.join(__dirname)));

// API routes — map to Vercel serverless handlers
const loginHandler = require('./api/login');
const leadsHandler = require('./api/leads');
const leadsIdHandler = require('./api/leads/[id]');
const contactsHandler = require('./api/contacts');
const productsHandler = require('./api/products');
const productsIdHandler = require('./api/products/[id]');
const projectsHandler = require('./api/projects');
const projectsIdHandler = require('./api/projects/[id]');

function wrap(handler) {
  return (req, res) => {
    req.query = req.query || {};
    handler(req, res);
  };
}

app.post('/api/login', wrap(loginHandler));

app.get('/api/leads', wrap(leadsHandler));
app.post('/api/leads', wrap(leadsHandler));
app.delete('/api/leads/:id', (req, res) => {
  req.query = { id: req.params.id };
  leadsIdHandler(req, res);
});

app.get('/api/contacts', wrap(contactsHandler));
app.put('/api/contacts', wrap(contactsHandler));

app.get('/api/products', wrap(productsHandler));
app.post('/api/products', wrap(productsHandler));
app.get('/api/products/:id', (req, res) => { req.query = { id: req.params.id }; productsIdHandler(req, res); });
app.put('/api/products/:id', (req, res) => { req.query = { id: req.params.id }; productsIdHandler(req, res); });
app.delete('/api/products/:id', (req, res) => { req.query = { id: req.params.id }; productsIdHandler(req, res); });

app.get('/api/projects', wrap(projectsHandler));
app.post('/api/projects', wrap(projectsHandler));
app.get('/api/projects/:id', (req, res) => { req.query = { id: req.params.id }; projectsIdHandler(req, res); });
app.put('/api/projects/:id', (req, res) => { req.query = { id: req.params.id }; projectsIdHandler(req, res); });
app.delete('/api/projects/:id', (req, res) => { req.query = { id: req.params.id }; projectsIdHandler(req, res); });

// Public alias routes (from vercel.json rewrites)
app.get('/api/public/contacts', wrap(contactsHandler));
app.get('/api/public/products', wrap(productsHandler));
app.get('/api/public/products/:id', (req, res) => { req.query = { id: req.params.id }; productsIdHandler(req, res); });
app.get('/api/public/projects', wrap(projectsHandler));
app.get('/api/public/projects/:id', (req, res) => { req.query = { id: req.params.id }; projectsIdHandler(req, res); });

app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard/`);
});
