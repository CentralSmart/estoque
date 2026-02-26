# 📦 Estoque — Sistema de Gestão com Neon PostgreSQL

Sistema multi-usuário sincronizado em tempo real via Neon PostgreSQL.

## ⚡ Setup Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar servidor
```bash
npm start
# ou em desenvolvimento (auto-reload):
npm run dev
```

### 3. Acessar
Abra `http://localhost:3000` no navegador.
Todos que acessarem o mesmo endereço veem o mesmo estoque, sincronizado.

---

## 🌐 Deploy em Produção

### Opção A — Railway (gratuito)
1. Crie conta em [railway.app](https://railway.app)
2. Clique em "New Project" → "Deploy from GitHub"
3. Suba este projeto e Railway detecta automaticamente

### Opção B — Render
1. Crie conta em [render.com](https://render.com)
2. New → Web Service → conecte o repositório
3. Start Command: `npm start`

### Opção C — VPS (DigitalOcean, etc.)
```bash
git clone <seu-repo>
cd estoque
npm install
# Opcional: usar PM2 para manter rodando
npm install -g pm2
pm2 start server.js --name estoque
pm2 startup
pm2 save
```

---

## 🗄️ Estrutura do Banco (Neon)
A tabela `estoque` usa o schema fornecido + colunas extras adicionadas automaticamente:
- `unidade` — ex: un, kg, L, cx
- `minimo` — quantidade mínima para alerta
- `codigo` — código interno/SKU
- `nota` — observação livre
- `atualizado_em` — timestamp de última edição

---

## ♻️ Sincronização
O frontend faz polling a cada **8 segundos** para manter todos sincronizados.
O indicador no canto superior (ponto verde) mostra o status da conexão.

---

## 📋 Funcionalidades
- ✅ Múltiplas listas independentes
- ✅ Adicionar, editar inline, remover itens
- ✅ Status automático: 🟢 OK / 🟡 Baixo / 🔴 Zerado
- ✅ Busca e ordenação
- ✅ Exportar CSV
- ✅ Sincronizado para todos os usuários
