# Dashboard Home Top Cortinas Decor

## O que foi criado

- **Backend** (pasta `backend/`): API em Node.js + Express com login, contatos, leads, coleções e upload de imagens. Dados salvos em `backend/db.json`.
- **Dashboard** (pasta `dashboard/`): painel com login e seções:
  - **Leads**: lista de quem clicou em contato / enviou o formulário (nome, telefone, mensagem, data).
  - **Contatos**: editar WhatsApp 1 e 2, Instagram, Maps e descrição do rodapé.
  - **Imagens**: trocar imagem do hero e da galeria da página inicial.
  - **Coleções**: criar/editar/excluir coleções da página Galeria.
- **Site**: botão "Solicitar Orçamento" abre um modal; o visitante preenche nome e telefone, o lead é enviado para a API e em seguida ele é redirecionado para o WhatsApp.

## Como rodar

1. **Instalar dependências do backend**
   ```bash
   cd backend
   npm install
   ```

2. **Criar arquivo de ambiente (opcional)**
   ```bash
   cp .env.example .env
   ```
   Edite `.env` e altere `JWT_SECRET` em produção.

3. **Subir o servidor**
   ```bash
   npm start
   ```
   O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT` no `.env`).

4. **Acessar o site e o dashboard**
   - Site: `http://localhost:3000/index.html` ou `http://localhost:3000/`
   - Login do dashboard: `http://localhost:3000/dashboard/login.html`
   - Credenciais padrão: **e-mail** `admin@hometop.com.br`, **senha** `admin123`

## Fluxo de leads

1. No site, o visitante clica em "Solicitar Orçamento".
2. Abre o modal com nome, telefone e mensagem (opcional).
3. Ao enviar, os dados são enviados para `POST /api/leads` (lead salvo no dashboard).
4. O visitante é redirecionado para o WhatsApp com uma mensagem pré-preenchida.

Os leads aparecem no dashboard na seção **Leads**, com data, nome, telefone, mensagem e origem.

## Observações

- O dashboard e a API precisam ser acessados **pelo mesmo servidor** (por exemplo `http://localhost:3000`) para login e salvamento de leads funcionarem.
- Contatos e imagens alterados no dashboard ficam na API; para refletir no site estático (HTML atual), é preciso publicar/atualizar o site usando esses dados (por exemplo gerando páginas a partir da API ou usando os valores no HTML).
- Para produção: use HTTPS, altere `JWT_SECRET` e a senha do usuário em `db.json` (ou implemente troca de senha pela API).
