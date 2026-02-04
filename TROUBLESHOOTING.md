# 🔧 Guia de Solução de Problemas

Guia para resolver problemas comuns ao executar o **Offshore Maintenance Pro 2.0**.

## 📋 Índice Rápido

- [Problemas de Instalação](#-problemas-de-instalação)
- [Erros de Execução](#-erros-de-execução)
- [Problemas com API](#-problemas-com-api)
- [Erros de Build](#-erros-de-build)
- [Problemas de Deploy](#-problemas-de-deploy)

## 📦 Problemas de Instalação

### Erro: `npm install` falha

**Sintomas:**
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Soluções:**

1. **Limpar cache do npm:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Usar versão específica do Node.js:**
```bash
# Recomendado: Node.js 18 LTS
nvm install 18
nvm use 18
npm install
```

3. **Forçar instalação (legado):**
```bash
npm install --legacy-peer-deps
```

### Erro: Módulo TypeScript não encontrado

**Sintomas:**
```bash
Error: Cannot find module 'typescript'
```

**Solução:**
```bash
npm install typescript@~5.8.2 --save-dev
```

## ⚡ Erros de Execução

### Erro: `process.env.API_KEY is undefined`

**Sintomas:**
- Console mostra: `API_KEY is undefined`
- Aplicação carrega mas geração de planos falha

**Soluções:**

1. **Verificar arquivo `.env.local`:**
```bash
# Deve existir na raiz do projeto
ls -la .env.local

# Conteúdo correto:
cat .env.local
API_KEY=sua_chave_aqui
```

2. **Criar arquivo se não existir:**
```bash
cp .env.example .env.local
# Edite .env.local e adicione sua chave real
```

3. **Reiniciar servidor de desenvolvimento:**
```bash
# Ctrl+C para parar
npm run dev
```

### Erro: Porta 3000 já em uso

**Sintomas:**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Soluções:**

1. **Matar processo na porta 3000:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

2. **Usar porta diferente:**
```bash
# Editar vite.config.ts
server: {
  port: 3001,  // Mudar para outra porta
  host: '0.0.0.0',
}
```

### Erro: Tela branca ao abrir a aplicação

**Sintomas:**
- Página carrega mas fica em branco
- Console mostra erros JavaScript

**Soluções:**

1. **Verificar console do navegador (F12):**
   - Procure por erros em vermelho
   - Anote a mensagem de erro completa

2. **Limpar cache do navegador:**
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E

3. **Rebuild do projeto:**
```bash
rm -rf dist node_modules
npm install
npm run dev
```

### Erro: React not defined

**Sintomas:**
```bash
Uncaught ReferenceError: React is not defined
```

**Solução:**
```bash
# Reinstalar React
npm install react@^19.2.4 react-dom@^19.2.4
```

### Erro: Module not found - components

**Sintomas:**
```bash
Error: Cannot find module './components/Layout.tsx'
```

**Solução:**
Verificar estrutura de diretórios:
```bash
# Deve ter esta estrutura:
ls -la components/
# Layout.tsx
# PlanForm.tsx
# PlanDisplay.tsx
# SettingsPanel.tsx
```

## 🤖 Problemas com API

### Erro: API Key inválida

**Sintomas:**
```bash
API request failed with status 401
Invalid API key
```

**Soluções:**

1. **Verificar chave no Google AI Studio:**
   - Acesse: https://makersuite.google.com/app/apikey
   - Verifique se a chave está ativa
   - Gere nova chave se necessário

2. **Atualizar .env.local:**
```bash
# .env.local
API_KEY=AIzaSy...sua_chave_completa_aqui
```

3. **Reiniciar servidor:**
```bash
npm run dev
```

### Erro: Quota excedida

**Sintomas:**
```bash
API request failed with status 429
Quota exceeded
```

**Soluções:**

1. **Verificar quota no Google Cloud:**
   - Acesse: https://console.cloud.google.com/
   - Vá em "APIs & Services" > "Quotas"
   - Verifique limite de requisições

2. **Aguardar reset da quota:**
   - Quotas geralmente resetam a cada minuto/hora
   - Tente novamente em alguns minutos

3. **Solicitar aumento de quota:**
   - No Google Cloud Console
   - Request quota increase

### Erro: CORS policy

**Sintomas:**
```bash
Access blocked by CORS policy
```

**Solução:**
Este erro é raro com Google Gemini API, mas se ocorrer:

```bash
# Adicionar proxy no vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://generativelanguage.googleapis.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## 📦 Erros de Build

### Erro: Build falha com TypeScript

**Sintomas:**
```bash
error TS2304: Cannot find name 'process'
```

**Solução:**

1. **Verificar tsconfig.json:**
```json
{
  "compilerOptions": {
    "types": ["vite/client", "node"]
  }
}
```

2. **Reinstalar @types/node:**
```bash
npm install @types/node@^22.14.0 --save-dev
```

### Erro: Out of memory

**Sintomas:**
```bash
JavaScript heap out of memory
```

**Solução:**

1. **Aumentar memória Node.js:**
```bash
# No package.json
"scripts": {
  "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
}
```

2. **Ou via linha de comando:**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Erro: Vite build output vazio

**Sintomas:**
- Build completa mas pasta `dist/` vazia

**Solução:**
```bash
# Limpar e rebuildar
rm -rf dist
npm run build

# Verificar output
ls -la dist/
```

## 🌐 Problemas de Deploy

### Vercel: Build falha

**Sintomas:**
```bash
Error: No Output Directory named "dist" found
```

**Solução:**

1. **Verificar vercel.json:**
```json
{
  "outputDirectory": "dist",
  "buildCommand": "npm run build"
}
```

2. **Testar build localmente:**
```bash
npm run build
ls dist/
```

### Vercel: Variável de ambiente não funciona

**Sintomas:**
- Deploy completa mas app não funciona
- Erro: API_KEY undefined

**Solução:**

1. **Configurar no Vercel Dashboard:**
   - Project Settings > Environment Variables
   - Add: `API_KEY` = sua_chave
   - Environments: Production, Preview, Development

2. **Redeploy após adicionar:**
   - Deployments > Latest > Redeploy

### Erro 404 ao recarregar página

**Sintomas:**
- App funciona inicialmente
- 404 ao recarregar (F5)

**Solução:**

Adicionar rewrites em `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📝 Logs Úteis para Debug

### Verificar se Vite está carregando .env

```typescript
// Adicionar em App.tsx temporariamente
console.log('API_KEY loaded:', !!process.env.API_KEY);
console.log('API_KEY length:', process.env.API_KEY?.length);
```

### Verificar requisições de rede

1. Abra DevTools (F12)
2. Aba **Network**
3. Gere um plano
4. Procure por requisições para `generativelanguage.googleapis.com`
5. Verifique:
   - Status Code (200 = sucesso)
   - Response (conteúdo da resposta)
   - Headers (se API key está sendo enviada)

### Verificar erros no console

```javascript
// Console do navegador (F12)
// Procure por:
- TypeError
- ReferenceError
- SyntaxError
- API errors
```

## ❓ Problemas Não Resolvidos?

### Passos para obter ajuda:

1. **Cole informações do erro:**
   - Mensagem completa do console
   - Stack trace
   - Versão Node.js: `node -v`
   - Versão npm: `npm -v`
   - Sistema operacional

2. **Abra uma issue no GitHub:**
   - [Criar Issue](https://github.com/celloweb-ai/Offshore_Maintenance_Pro_2.0/issues/new)
   - Use template de bug report
   - Inclua prints de tela

3. **Entre em contato:**
   - Email: marcus@vasconcellos.net.br
   - Inclua todas as informações acima

## 🛠️ Comandos Úteis de Debug

```bash
# Verificar versões
node -v
npm -v

# Listar arquivos
ls -la

# Ver conteúdo de .env.local
cat .env.local

# Verificar processos na porta 3000
lsof -ti:3000

# Limpar tudo e recomeçar
rm -rf node_modules dist .vite package-lock.json
npm install
npm run dev

# Build com logs verbose
npm run build -- --debug

# Verificar se dist foi criado
ls -la dist/

# Testar build localmente
npm run preview
```

## ✅ Checklist de Diagnóstico

Antes de reportar problema, verifique:

- [ ] Node.js >= 18.0.0 instalado
- [ ] `npm install` executado sem erros
- [ ] Arquivo `.env.local` existe na raiz
- [ ] `.env.local` contém `API_KEY=...`
- [ ] Chave API é válida no Google AI Studio
- [ ] Porta 3000 está livre
- [ ] Cache do navegador foi limpo
- [ ] Console não mostra erros JavaScript
- [ ] Servidor foi reiniciado após mudanças em .env

---

<div align="center">
  <strong>Ainda com problemas?</strong>
  <br>
  <sub>Abra uma <a href="https://github.com/celloweb-ai/Offshore_Maintenance_Pro_2.0/issues">issue no GitHub</a> com detalhes do erro</sub>
</div>
