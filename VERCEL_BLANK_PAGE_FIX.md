# 🚫 Corrigindo Página em Branco no Vercel

Guia rápido para resolver o problema de página em branco após deploy no Vercel.

## 🔴 Problema

Após fazer deploy no Vercel, a página aparece em branco (tela branca) sem conteúdo.

## ✅ Solução Implementada

O problema foi causado por múltiplas issues no `index.html`. Já corrigimos:

### Issues Corrigidas:

1. **Import map duplicado e conflitante**
   - ❌ **Antes:** Usava `importmap` para ESM modules do CDN
   - ✅ **Depois:** Removido - Vite gerencia as dependências

2. **Scripts duplicados**
   - ❌ **Antes:** `<script src="index.tsx">` e `<script src="/index.tsx">`
   - ✅ **Depois:** Apenas `<script type="module" src="/index.tsx">`

3. **CSS duplicado**
   - ❌ **Antes:** `<link href="index.css">` e `<link href="/index.css">`
   - ✅ **Depois:** CSS gerenciado pelo Vite automaticamente

4. **Polyfill desnecessário**
   - ❌ **Antes:** `window.process = { env: {} }`
   - ✅ **Depois:** Removido - Vite injeta automaticamente

## 🚀 Como Aplicar a Correção

### Passo 1: Verificar se a correção foi aplicada

```bash
# Puxe as últimas mudanças
git pull origin main

# Verifique o index.html
cat index.html
```

O arquivo deve estar assim:

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offshore Maintenance Pro 2.0</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
</body>
</html>
```

### Passo 2: Testar Localmente

```bash
# Limpar cache
rm -rf dist node_modules/.vite

# Rebuild
npm run build

# Testar preview
npm run preview
```

Acesse `http://localhost:4173` - deve funcionar corretamente.

### Passo 3: Redeploy no Vercel

Se você já tinha feito deploy:

#### Opção A: Automatic Redeploy (Recomendado)

```bash
# Simplesmente faça push
git push origin main
```

O Vercel fará redeploy automaticamente.

#### Opção B: Manual Redeploy via Dashboard

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Deployments**
4. Clique nos **três pontos (...)** do último deploy
5. Selecione **Redeploy**
6. Clique em **Redeploy** novamente para confirmar

### Passo 4: Verificar Variáveis de Ambiente

A página em branco também pode ser causada por falta da API Key:

1. Acesse **Project Settings** > **Environment Variables**
2. Verifique se `API_KEY` está configurada
3. Se não estiver:
   - Clique em **Add New**
   - Name: `API_KEY`
   - Value: Sua chave Google Gemini
   - Environments: **Production**, **Preview**, **Development**
   - Clique em **Save**
4. Faça **Redeploy**

## 🔍 Debug: Como Verificar Erros no Vercel

### 1. Verificar Build Logs

1. Vá em **Deployments**
2. Clique no deploy mais recente
3. Role até **Build Logs**
4. Procure por erros em vermelho

**Erros comuns:**

```bash
# Erro de TypeScript
error TS2304: Cannot find name 'process'

# Solução: Verificar vite.config.ts
```

```bash
# Erro de build vazio
Error: No Output Directory named "dist" found

# Solução: Verificar vercel.json
```

### 2. Verificar Runtime Logs

1. No deploy, vá em **Runtime Logs**
2. Procure por erros JavaScript
3. Se houver erros, anote a mensagem

### 3. Inspecionar no Navegador

Quando a página do Vercel carregar em branco:

1. Pressione **F12** (DevTools)
2. Vá na aba **Console**
3. Procure por erros (texto em vermelho)

**Erros comuns:**

```javascript
// Erro 1: Módulo não encontrado
Uncaught TypeError: Failed to resolve module specifier "react"

// Causa: index.html tinha importmap conflitante
// Solução: Já corrigido no commit c7c50b6
```

```javascript
// Erro 2: API Key undefined
Error: process.env.API_KEY is undefined

// Solução: Configurar API_KEY no Vercel (ver Passo 4)
```

```javascript
// Erro 3: Root element não encontrado
Error: Could not find root element to mount to

// Causa: index.html mal formado
// Solução: Já corrigido
```

### 4. Verificar Network Tab

1. **F12** > Aba **Network**
2. Recarregue a página (F5)
3. Verifique se os arquivos estão carregando:
   - `index.html` - Status 200 ✅
   - `index-[hash].js` - Status 200 ✅
   - `index-[hash].css` - Status 200 ✅

Se algum arquivo der **404** ou **500**, há problema no build.

## 🛠️ Checklist de Verificação

Antes de fazer deploy, confirme:

- [ ] `index.html` está correto (sem importmap, sem duplicações)
- [ ] `vite.config.ts` está simplificado
- [ ] `vercel.json` existe e está correto
- [ ] Build local funciona: `npm run build && npm run preview`
- [ ] `API_KEY` configurada no Vercel Dashboard
- [ ] Sem erros no console do navegador (F12)

## 📊 Arquivos Críticos Verificados

### ✅ index.html (Corrigido)

```html
<!-- Versão correta -->
<script type="module" src="/index.tsx"></script>

<!-- ❌ NÃO USE:
<script type="importmap">...</script>
<script src="index.tsx"></script>
<script src="/index.tsx"></script>
-->
```

### ✅ vite.config.ts (Corrigido)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
```

### ✅ vercel.json (Correto)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {"source": "/(.*)", "destination": "/index.html"}
  ]
}
```

## 🐛 Issues Conhecidas e Soluções

### Issue 1: Página em branco mesmo após correção

**Causa:** Cache do Vercel

**Solução:**
```bash
# Forçar rebuild completo
# No dashboard Vercel:
# Deployments > ... > Redeploy > Disable Cache
```

### Issue 2: Funciona localmente mas não no Vercel

**Causa:** Variáveis de ambiente

**Solução:**
1. Verificar **Environment Variables** no Vercel
2. `API_KEY` deve estar em **Production**
3. Fazer redeploy

### Issue 3: Erro 404 ao recarregar

**Causa:** Falta de rewrites

**Solução:**
Verificar `vercel.json` tem:
```json
"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
```

## 📞 Suporte

Se o problema persistir após seguir todos os passos:

1. **Copie informações do erro:**
   - Build logs do Vercel
   - Console errors (F12)
   - Screenshot da página em branco

2. **Abra uma issue:**
   - [GitHub Issues](https://github.com/celloweb-ai/Offshore_Maintenance_Pro_2.0/issues/new)
   - Inclua todas as informações acima
   - Mencione que seguiu este guia

3. **Contato direto:**
   - Email: marcus@vasconcellos.net.br
   - Assunto: "[Vercel] Página em Branco"

## ✅ Pós-Correção: O que Esperar

Após aplicar as correções:

1. ✅ Página carrega com banner e logo
2. ✅ Formulário de geração aparece
3. ✅ Console sem erros JavaScript
4. ✅ Pode gerar planos de manutenção
5. ✅ Exportação PDF/DOCX funciona

## 🔗 Links Úteis

- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)

---

<div align="center">
  <strong>Problema resolvido?</strong>
  <br>
  <sub>Se sim, marque esta issue como resolvida. Se não, entre em contato!</sub>
</div>
