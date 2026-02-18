// Base da API: quando o dashboard é servido pelo mesmo Express, use ''; senão ajuste para http://localhost:3000
const API = window.API_BASE != null ? window.API_BASE : '';

function getToken() {
  return localStorage.getItem('hometop_token');
}

function authHeaders() {
  const t = getToken();
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) };
}

function redirectLogin() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return true;
  }
  return false;
}

// Navegação
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const section = el.getAttribute('data-section');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    const panel = document.getElementById('section-' + section);
    if (panel) panel.classList.add('active');
  });
});

// User email
const user = JSON.parse(localStorage.getItem('hometop_user') || '{}');
document.getElementById('userEmail').textContent = user.email || 'Admin';

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// ════════════════════════════════════════
// ——  LEADS
// ════════════════════════════════════════
async function loadLeads() {
  if (redirectLogin()) return;
  const res = await fetch(API + '/api/leads', { headers: authHeaders() });
  if (res.status === 401) { redirectLogin(); return; }
  const list = await res.json();
  const tbody = document.getElementById('leadsList');
  const empty = document.getElementById('leadsEmpty');
  tbody.innerHTML = '';
  if (!list || list.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.forEach(lead => {
    const tr = document.createElement('tr');
    const data = new Date(lead.data).toLocaleString('pt-BR');
    tr.innerHTML = `
      <td>${data}</td>
      <td>${escapeHtml(lead.nome)}</td>
      <td><a href="https://wa.me/55${lead.telefone.replace(/\D/g,'')}" target="_blank">${escapeHtml(lead.telefone)}</a></td>
      <td>${escapeHtml(lead.mensagem || '-')}</td>
      <td>${escapeHtml(lead.origem || 'site')}</td>
      <td class="actions"><button type="button" data-id="${lead.id}" class="btn-delete">Excluir</button></td>
    `;
    tr.querySelector('.btn-delete').addEventListener('click', () => deleteLead(lead.id));
    tbody.appendChild(tr);
  });
}

async function deleteLead(id) {
  if (!confirm('Excluir este lead?')) return;
  const res = await fetch(API + '/api/leads/' + id, { method: 'DELETE', headers: authHeaders() });
  if (res.ok) loadLeads();
}

// ════════════════════════════════════════
// ——  CONTATOS
// ════════════════════════════════════════
let numbersList = [];
let sitesList = [];

async function loadContacts() {
  if (redirectLogin()) return;
  const res = await fetch(API + '/api/contacts', { headers: authHeaders() });
  if (res.status === 401) { redirectLogin(); return; }
  const data = await res.json();
  const c = data.contacts || {};
  numbersList = Array.isArray(c.numbers) ? c.numbers.slice() : [];
  sitesList = Array.isArray(data.sites) ? data.sites.slice() : [];
  renderNumbers();
  renderSites();
}

function renderNumbers() {
  const container = document.getElementById('numbersList');
  container.innerHTML = '';
  numbersList.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'number-item';
    div.innerHTML = `
      <label class="number-item__label">Número</label>
      <input type="text" class="number-item__input" data-idx="${idx}" value="${escapeHtml(item.number || '')}" placeholder="5547999999999">
      <button type="button" class="number-item__remove">Remover</button>
    `;
    div.querySelector('.number-item__input').addEventListener('change', function () {
      numbersList[idx].number = this.value.trim();
    });
    div.querySelector('.number-item__remove').addEventListener('click', () => {
      numbersList.splice(idx, 1);
      renderNumbers();
    });
    container.appendChild(div);
  });
}

function renderSites() {
  const container = document.getElementById('sitesList');
  container.innerHTML = '';
  sitesList.forEach((site, idx) => {
    const div = document.createElement('div');
    div.className = 'site-item site-item--editable';
    div.innerHTML = `
      <div class="site-item__row">
        <div class="field">
          <label>Nome</label>
          <input type="text" class="site-item__label-input" data-idx="${idx}" value="${escapeHtml(site.label || '')}" placeholder="Ex: Instagram">
        </div>
        <div class="field">
          <label>URL</label>
          <input type="url" class="site-item__url-input" data-idx="${idx}" value="${escapeHtml(site.url || '')}" placeholder="https://...">
        </div>
        <button type="button" class="site-item__remove">Remover</button>
      </div>
    `;
    div.querySelector('.site-item__label-input').addEventListener('change', function () {
      sitesList[idx].label = this.value.trim();
    });
    div.querySelector('.site-item__url-input').addEventListener('change', function () {
      sitesList[idx].url = this.value.trim();
    });
    div.querySelector('.site-item__remove').addEventListener('click', () => {
      sitesList.splice(idx, 1);
      renderSites();
    });
    container.appendChild(div);
  });
}

document.getElementById('btnAddNumber').addEventListener('click', () => {
  numbersList.push({ id: String(Date.now()), number: '' });
  renderNumbers();
});

document.getElementById('btnSaveContacts').addEventListener('click', async () => {
  const inputs = document.querySelectorAll('.number-item__input');
  const numbers = [];
  inputs.forEach((input, i) => {
    const num = (input.value || '').trim();
    if (num) numbers.push({ id: numbersList[i]?.id || String(Date.now() + i), number: num });
  });
  const res = await fetch(API + '/api/contacts', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ contacts: { numbers } })
  });
  if (res.ok) {
    numbersList = numbers;
    alert('Contatos salvos.');
  } else alert('Erro ao salvar.');
});

document.getElementById('btnAddSite').addEventListener('click', () => {
  sitesList.push({ id: String(Date.now()), label: '', url: '' });
  renderSites();
});

document.getElementById('btnSaveSites').addEventListener('click', async () => {
  const inputs = document.querySelectorAll('.site-item--editable');
  const sites = [];
  inputs.forEach((row, idx) => {
    const labelInput = row.querySelector('.site-item__label-input');
    const urlInput = row.querySelector('.site-item__url-input');
    if (labelInput && urlInput) {
      sites.push({
        id: sitesList[idx]?.id || String(Date.now() + idx),
        label: labelInput.value.trim(),
        url: urlInput.value.trim()
      });
    }
  });
  const res = await fetch(API + '/api/contacts', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ sites })
  });
  if (res.ok) {
    sitesList = sites;
    alert('Sites salvos.');
  } else alert('Erro ao salvar.');
});

// ════════════════════════════════════════
// ——  PRODUTOS (blocos com coleções)
// ════════════════════════════════════════
let productsList = [];

async function loadProducts() {
  if (redirectLogin()) return;
  const res = await fetch(API + '/api/products', { headers: authHeaders() });
  if (res.status === 401) { redirectLogin(); return; }
  productsList = await res.json();
  renderProducts();
}

function resolveImageSrc(src) {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return '/' + src;
}

function reopenBlock(prodId) {
  setTimeout(() => {
    const el = document.querySelector('.prod-block[data-id="' + prodId + '"]');
    if (el) el.classList.add('open');
  }, 50);
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch(API + '/api/upload', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + getToken() },
    body: fd
  });
  const d = await r.json();
  return d.url || null;
}

function renderProducts() {
  const container = document.getElementById('productBlocks');
  container.innerHTML = '';
  if (!productsList || productsList.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhum produto cadastrado.</p>';
    return;
  }
  productsList.forEach((prod) => {
    const block = document.createElement('div');
    block.className = 'prod-block';
    block.dataset.id = prod.id;

    const coverSrc = resolveImageSrc(prod.image);
    const collections = prod.collections || [];

    // Gerar HTML das coleções
    let collectionsHtml = '';
    collections.forEach((col, colIdx) => {
      const colCoverSrc = resolveImageSrc(col.image);
      const colImages = col.images || [];
      collectionsHtml += `
        <div class="collection-block" data-col-idx="${colIdx}">
          <div class="collection-block__header">
            <strong>${escapeHtml(col.title || 'Sem título')}</strong>
            <span style="color:#999;font-size:0.85rem;margin-left:8px;">${colImages.length} imagem(ns)</span>
            <button type="button" class="collection-block__toggle" style="margin-left:auto;background:none;border:none;color:#999;cursor:pointer;font-size:1rem;">▸</button>
            <button type="button" class="collection-block__remove" style="background:none;border:none;color:#e57373;cursor:pointer;font-size:0.85rem;margin-left:8px;">Excluir</button>
          </div>
          <div class="collection-block__body" style="display:none;padding:12px 0;">
            <div class="field">
              <label>Nome da coleção</label>
              <input type="text" class="js-col-title" value="${escapeHtml(col.title || '')}">
            </div>
            <div class="prod-block__cover-section">
              <h4 style="font-size:0.9rem;color:var(--accent);margin-bottom:6px;">Capa da coleção</h4>
              <div class="prod-block__cover-preview" style="width:90px;height:90px;">
                ${colCoverSrc ? '<img src="' + escapeHtml(colCoverSrc) + '" alt="">' : '<span style="color:#999;font-size:0.7rem">Sem capa</span>'}
              </div>
              <div class="upload-row">
                <input type="file" class="js-col-cover-file" accept="image/*">
                <button type="button" class="btn btn-secondary js-col-cover-upload" style="font-size:0.8rem;padding:6px 12px;">Enviar capa</button>
              </div>
            </div>
            <div class="prod-block__images-section">
              <h4 style="font-size:0.9rem;color:var(--accent);margin-bottom:6px;">Galeria da coleção</h4>
              <div class="prod-block__images-grid">
                ${colImages.map((img, imgIdx) => `
                  <div class="prod-block__img-thumb" data-img-idx="${imgIdx}">
                    <img src="${escapeHtml(resolveImageSrc(img))}" alt="">
                    <button type="button" class="remove-img" data-img-idx="${imgIdx}">✕</button>
                  </div>
                `).join('')}
              </div>
              <div class="upload-row">
                <input type="file" class="js-col-images-file" accept="image/*" multiple>
                <button type="button" class="btn btn-secondary js-col-images-upload" style="font-size:0.8rem;padding:6px 12px;">Adicionar imagens</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    block.innerHTML = `
      <div class="prod-block__header">
        <div class="prod-block__cover">
          ${coverSrc ? '<img src="' + escapeHtml(coverSrc) + '" alt="">' : '<span style="color:#999;font-size:0.75rem">Sem capa</span>'}
        </div>
        <div>
          <div class="prod-block__title">${escapeHtml(prod.title)}</div>
          <div class="prod-block__desc">${escapeHtml(prod.desc || '')} · ${collections.length} coleção(ões)</div>
        </div>
        <span class="prod-block__arrow">▼</span>
      </div>
      <div class="prod-block__body">
        <div class="field">
          <label>Título</label>
          <input type="text" class="js-prod-title" value="${escapeHtml(prod.title || '')}">
        </div>
        <div class="field">
          <label>Descrição</label>
          <textarea class="js-prod-desc" rows="2">${escapeHtml(prod.desc || '')}</textarea>
        </div>

        <div class="prod-block__cover-section">
          <h4>Imagem de Capa do Produto</h4>
          <div class="prod-block__cover-preview">
            ${coverSrc ? '<img src="' + escapeHtml(coverSrc) + '" alt="">' : '<span style="color:#999;font-size:0.75rem">Sem imagem</span>'}
          </div>
          <div class="upload-row">
            <input type="file" class="js-prod-cover-file" accept="image/*">
            <button type="button" class="btn btn-secondary js-prod-cover-upload">Enviar capa</button>
          </div>
        </div>

        <div class="prod-block__collections-section" style="margin-top:20px;border-top:1px solid var(--border);padding-top:16px;">
          <h4 style="font-size:1.05rem;color:var(--accent);margin-bottom:12px;">Coleções</h4>
          <div class="js-collections-list">${collectionsHtml}</div>
          <button type="button" class="btn btn-secondary js-add-collection" style="margin-top:8px;">+ Nova coleção</button>
        </div>

        <div class="prod-block__actions">
          <button type="button" class="btn btn-primary js-prod-save">Salvar tudo</button>
          <button type="button" class="btn-delete-product js-prod-delete">Excluir produto</button>
        </div>
      </div>
    `;

    // Abrir/fechar bloco principal
    block.querySelector('.prod-block__header').addEventListener('click', () => {
      block.classList.toggle('open');
    });

    // Upload de capa do produto
    block.querySelector('.js-prod-cover-upload').addEventListener('click', async () => {
      const fileInput = block.querySelector('.js-prod-cover-file');
      if (!fileInput.files || !fileInput.files[0]) { alert('Selecione uma imagem'); return; }
      const url = await uploadFile(fileInput.files[0]);
      if (url) {
        prod.image = url;
        fileInput.value = '';
        await saveProduct(prod);
        renderProducts();
        reopenBlock(prod.id);
      } else alert('Erro no upload.');
    });

    // Eventos das coleções
    block.querySelectorAll('.collection-block').forEach(colBlock => {
      const colIdx = parseInt(colBlock.dataset.colIdx);
      const col = collections[colIdx];

      // Toggle abrir/fechar coleção
      colBlock.querySelector('.collection-block__toggle').addEventListener('click', () => {
        const body = colBlock.querySelector('.collection-block__body');
        const btn = colBlock.querySelector('.collection-block__toggle');
        if (body.style.display === 'none') {
          body.style.display = 'block';
          btn.textContent = '▾';
        } else {
          body.style.display = 'none';
          btn.textContent = '▸';
        }
      });

      // Remover coleção
      colBlock.querySelector('.collection-block__remove').addEventListener('click', async () => {
        if (!confirm('Excluir a coleção "' + col.title + '"?')) return;
        prod.collections.splice(colIdx, 1);
        await saveProduct(prod);
        renderProducts();
        reopenBlock(prod.id);
      });

      // Alterar título da coleção (on change)
      colBlock.querySelector('.js-col-title').addEventListener('change', function() {
        col.title = this.value.trim();
      });

      // Upload capa da coleção
      colBlock.querySelector('.js-col-cover-upload').addEventListener('click', async () => {
        const fileInput = colBlock.querySelector('.js-col-cover-file');
        if (!fileInput.files || !fileInput.files[0]) { alert('Selecione uma imagem'); return; }
        const url = await uploadFile(fileInput.files[0]);
        if (url) {
          col.image = url;
          fileInput.value = '';
          await saveProduct(prod);
          renderProducts();
          reopenBlock(prod.id);
        } else alert('Erro no upload.');
      });

      // Upload imagens da galeria da coleção
      colBlock.querySelector('.js-col-images-upload').addEventListener('click', async () => {
        const fileInput = colBlock.querySelector('.js-col-images-file');
        if (!fileInput.files || fileInput.files.length === 0) { alert('Selecione imagens'); return; }
        col.images = col.images || [];
        for (const file of fileInput.files) {
          const url = await uploadFile(file);
          if (url) col.images.push(url);
        }
        fileInput.value = '';
        await saveProduct(prod);
        renderProducts();
        reopenBlock(prod.id);
      });

      // Remover imagem individual da galeria
      colBlock.querySelectorAll('.remove-img').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const imgIdx = parseInt(btn.dataset.imgIdx);
          col.images.splice(imgIdx, 1);
          await saveProduct(prod);
          renderProducts();
          reopenBlock(prod.id);
        });
      });
    });

    // Adicionar nova coleção
    block.querySelector('.js-add-collection').addEventListener('click', async () => {
      const title = prompt('Nome da nova coleção:');
      if (!title) return;
      const colId = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'colecao-' + Date.now();
      prod.collections = prod.collections || [];
      prod.collections.push({ id: colId, title, image: '', images: [] });
      await saveProduct(prod);
      renderProducts();
      reopenBlock(prod.id);
    });

    // Salvar tudo (título, desc + coleções editadas)
    block.querySelector('.js-prod-save').addEventListener('click', async () => {
      prod.title = block.querySelector('.js-prod-title').value.trim();
      prod.desc = block.querySelector('.js-prod-desc').value.trim();
      // Atualizar títulos das coleções dos inputs
      block.querySelectorAll('.collection-block').forEach(colBlock => {
        const colIdx = parseInt(colBlock.dataset.colIdx);
        const titleInput = colBlock.querySelector('.js-col-title');
        if (titleInput && prod.collections[colIdx]) {
          prod.collections[colIdx].title = titleInput.value.trim();
        }
      });
      await saveProduct(prod);
      alert('Produto salvo.');
      renderProducts();
      reopenBlock(prod.id);
    });

    // Excluir produto
    block.querySelector('.js-prod-delete').addEventListener('click', () => deleteProduct(prod.id));

    container.appendChild(block);
  });
}

async function saveProduct(prod) {
  const body = {
    title: prod.title,
    desc: prod.desc,
    image: prod.image,
    collections: prod.collections || []
  };
  await fetch(API + '/api/products/' + prod.id, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  const idx = productsList.findIndex(p => p.id === prod.id);
  if (idx >= 0) productsList[idx] = { ...productsList[idx], ...body };
}

document.getElementById('btnNewProduct').addEventListener('click', async () => {
  const title = prompt('Nome do novo produto:');
  if (!title) return;
  const res = await fetch(API + '/api/products', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, desc: '', image: '', collections: [] })
  });
  if (res.ok) loadProducts();
  else alert('Erro ao criar produto.');
});

async function deleteProduct(id) {
  if (!confirm('Excluir este produto?')) return;
  await fetch(API + '/api/products/' + id, { method: 'DELETE', headers: authHeaders() });
  loadProducts();
}

// ════════════════════════════════════════
// ——  GALERIA DE PROJETOS
// ════════════════════════════════════════
let projectsList = [];

async function loadProjects() {
  if (redirectLogin()) return;
  const res = await fetch(API + '/api/projects', { headers: authHeaders() });
  if (res.status === 401) { redirectLogin(); return; }
  projectsList = await res.json();
  renderProjects();
}

function reopenProjectBlock(projId) {
  setTimeout(() => {
    const el = document.querySelector('.proj-block[data-id="' + projId + '"]');
    if (el) el.classList.add('open');
  }, 50);
}

function renderProjects() {
  const container = document.getElementById('projectBlocks');
  container.innerHTML = '';
  if (!projectsList || projectsList.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhum projeto cadastrado.</p>';
    return;
  }
  projectsList.forEach((proj) => {
    const block = document.createElement('div');
    block.className = 'prod-block proj-block';
    block.dataset.id = proj.id;

    const coverSrc = resolveImageSrc(proj.image);
    const media = proj.media || [];

    block.innerHTML = `
      <div class="prod-block__header">
        <div class="prod-block__cover">
          ${coverSrc ? '<img src="' + escapeHtml(coverSrc) + '" alt="">' : '<span style="color:#999;font-size:0.75rem">Sem capa</span>'}
        </div>
        <div>
          <div class="prod-block__title">${escapeHtml(proj.title)}</div>
          <div class="prod-block__desc">${media.length} arquivo(s)</div>
        </div>
        <span class="prod-block__arrow">▼</span>
      </div>
      <div class="prod-block__body">
        <div class="field">
          <label>Nome do projeto</label>
          <input type="text" class="js-proj-title" value="${escapeHtml(proj.title || '')}">
        </div>

        <div class="prod-block__cover-section">
          <h4>Capa do Projeto</h4>
          <div class="prod-block__cover-preview">
            ${coverSrc ? '<img src="' + escapeHtml(coverSrc) + '" alt="">' : '<span style="color:#999;font-size:0.75rem">Sem imagem</span>'}
          </div>
          <div class="upload-row">
            <input type="file" class="js-proj-cover-file" accept="image/*">
            <button type="button" class="btn btn-secondary js-proj-cover-upload">Enviar capa</button>
          </div>
        </div>

        <div class="prod-block__images-section">
          <h4>Fotos e Vídeos do Projeto</h4>
          <div class="prod-block__images-grid js-proj-media-grid">
            ${media.map((url, idx) => {
              const src = resolveImageSrc(url);
              const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(src);
              return `
                <div class="prod-block__img-thumb" data-media-idx="${idx}">
                  ${isVideo
                    ? '<video src="' + escapeHtml(src) + '" style="width:100%;height:100%;object-fit:cover;"></video>'
                    : '<img src="' + escapeHtml(src) + '" alt="">'}
                  <button type="button" class="remove-img" data-media-idx="${idx}">✕</button>
                </div>
              `;
            }).join('')}
          </div>
          <div class="upload-row">
            <input type="file" class="js-proj-media-file" accept="image/*,video/*" multiple>
            <button type="button" class="btn btn-secondary js-proj-media-upload">Adicionar fotos/vídeos</button>
          </div>
        </div>

        <div class="prod-block__actions">
          <button type="button" class="btn btn-primary js-proj-save">Salvar projeto</button>
          <button type="button" class="btn-delete-product js-proj-delete">Excluir projeto</button>
        </div>
      </div>
    `;

    // Abrir/fechar
    block.querySelector('.prod-block__header').addEventListener('click', () => {
      block.classList.toggle('open');
    });

    // Upload capa
    block.querySelector('.js-proj-cover-upload').addEventListener('click', async () => {
      const fileInput = block.querySelector('.js-proj-cover-file');
      if (!fileInput.files || !fileInput.files[0]) { alert('Selecione uma imagem'); return; }
      const url = await uploadFile(fileInput.files[0]);
      if (url) {
        proj.image = url;
        fileInput.value = '';
        await saveProject(proj);
        renderProjects();
        reopenProjectBlock(proj.id);
      } else alert('Erro no upload.');
    });

    // Upload mídia
    block.querySelector('.js-proj-media-upload').addEventListener('click', async () => {
      const fileInput = block.querySelector('.js-proj-media-file');
      if (!fileInput.files || fileInput.files.length === 0) { alert('Selecione arquivos'); return; }
      proj.media = proj.media || [];
      for (const file of fileInput.files) {
        const url = await uploadFile(file);
        if (url) proj.media.push(url);
      }
      fileInput.value = '';
      await saveProject(proj);
      renderProjects();
      reopenProjectBlock(proj.id);
    });

    // Remover mídia individual
    block.querySelectorAll('.remove-img').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.mediaIdx);
        proj.media.splice(idx, 1);
        await saveProject(proj);
        renderProjects();
        reopenProjectBlock(proj.id);
      });
    });

    // Salvar
    block.querySelector('.js-proj-save').addEventListener('click', async () => {
      proj.title = block.querySelector('.js-proj-title').value.trim();
      await saveProject(proj);
      alert('Projeto salvo.');
      renderProjects();
      reopenProjectBlock(proj.id);
    });

    // Excluir
    block.querySelector('.js-proj-delete').addEventListener('click', async () => {
      if (!confirm('Excluir o projeto "' + proj.title + '"?')) return;
      await fetch(API + '/api/projects/' + proj.id, { method: 'DELETE', headers: authHeaders() });
      loadProjects();
    });

    container.appendChild(block);
  });
}

async function saveProject(proj) {
  const body = { title: proj.title, image: proj.image, media: proj.media || [] };
  await fetch(API + '/api/projects/' + proj.id, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  const idx = projectsList.findIndex(p => p.id === proj.id);
  if (idx >= 0) projectsList[idx] = { ...projectsList[idx], ...body };
}

document.getElementById('btnNewProject').addEventListener('click', async () => {
  const title = prompt('Nome do novo projeto:');
  if (!title) return;
  const res = await fetch(API + '/api/projects', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, image: '', media: [] })
  });
  if (res.ok) loadProjects();
  else alert('Erro ao criar projeto.');
});

// ════════════════════════════════════════
// ——  INICIALIZAÇÃO
// ════════════════════════════════════════
if (redirectLogin()) {
  // para em redirect
} else {
  loadLeads();
  loadContacts();
  loadProducts();
  loadProjects();
}
