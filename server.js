// Local dev server — emulates Vercel serverless functions
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

// API routes MUST come before static middleware to avoid directory redirects
const loginHandler = require('./api/login');
const leadsHandler = require('./api/leads');
const leadsIdHandler = require('./api/leads/[id]');
const contactsHandler = require('./api/contacts');
const productsHandler = require('./api/products');
const productsIdHandler = require('./api/products/[id]');
const projectsHandler = require('./api/projects');
const projectsIdHandler = require('./api/projects/[id]');

function wrap(handler) {
  return (req, res) => handler(req, res);
}

function withId(handler) {
  return (req, res) => {
    Object.defineProperty(req, 'query', { value: { id: req.params.id }, writable: true });
    handler(req, res);
  };
}

app.post('/api/login', wrap(loginHandler));

app.get('/api/leads', wrap(leadsHandler));
app.post('/api/leads', wrap(leadsHandler));
app.delete('/api/leads/:id', withId(leadsIdHandler));

app.get('/api/contacts', wrap(contactsHandler));
app.put('/api/contacts', wrap(contactsHandler));

app.get('/api/products', wrap(productsHandler));
app.post('/api/products', wrap(productsHandler));
app.get('/api/products/:id', withId(productsIdHandler));
app.put('/api/products/:id', withId(productsIdHandler));
app.delete('/api/products/:id', withId(productsIdHandler));

app.get('/api/projects', wrap(projectsHandler));
app.post('/api/projects', wrap(projectsHandler));
app.get('/api/projects/:id', withId(projectsIdHandler));
app.put('/api/projects/:id', withId(projectsIdHandler));
app.delete('/api/projects/:id', withId(projectsIdHandler));

// Public alias routes (from vercel.json rewrites)
app.get('/api/public/contacts', wrap(contactsHandler));
app.get('/api/public/products', wrap(productsHandler));
app.get('/api/public/products/:id', withId(productsIdHandler));
app.get('/api/public/projects', wrap(projectsHandler));
app.get('/api/public/projects/:id', withId(projectsIdHandler));

// Static files AFTER API routes
app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard/`);
});
