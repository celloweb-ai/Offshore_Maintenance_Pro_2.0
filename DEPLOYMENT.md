# 🚀 Guia de Deploy - Vercel

Guia completo para fazer deploy do **Offshore Maintenance Pro 2.0** na plataforma Vercel.

## 📋 Índice

- [Pré-requisitos](#-pré-requisitos)
- [Configuração Inicial](#-configuração-inicial)
- [Deploy via GitHub](#-deploy-via-github)
- [Configuração de Variáveis de Ambiente](#-configuração-de-variáveis-de-ambiente)
- [Verificação e Testes](#-verificação-e-testes)
- [Deploy via CLI](#-deploy-via-cli-opcional)
- [Troubleshooting](#-troubleshooting)
- [Monitoramento](#-monitoramento)

## ✅ Pré-requisitos

Antes de iniciar o deploy, certifique-se de ter:

- [x] Conta no [Vercel](https://vercel.com) (gratuita)
- [x] Repositório GitHub conectado
- [x] **Chave API do Google Gemini** ([obter aqui](https://makersuite.google.com/app/apikey))
- [x] Node.js >= 18.0.0 instalado localmente (para testes)

## ⚙️ Configuração Inicial

### 1. Arquivos de Configuração

O projeto já inclui os arquivos necessários para deploy no Vercel:

#### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "NODE_VERSION": "18"
  }
}
```

#### `vite.config.ts`
Configurado para ler a variável `API_KEY` corretamente:
```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.API_KEY)
}
```

### 2. Variáveis de Ambiente Locais

Para desenvolvimento local, crie o arquivo `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione sua chave:
```env
API_KEY=sua_chave_api_google_gemini_aqui
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env.local` no Git!

## 🐛 Deploy via GitHub

### Passo 1: Conectar ao Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Selecione o repositório `celloweb-ai/Offshore_Maintenance_Pro_2.0`
4. Clique em **"Import"**

### Passo 2: Configurar o Projeto

O Vercel detectará automaticamente as configurações:

| Campo | Valor Auto-detectado | Ação |
|-------|---------------------|--------|
| **Framework Preset** | Vite | ✅ Manter |
| **Root Directory** | ./ | ✅ Manter |
| **Build Command** | `npm run build` | ✅ Manter |
| **Output Directory** | `dist` | ✅ Manter |
| **Install Command** | `npm install` | ✅ Manter |

### Passo 3: Configurar Variáveis de Ambiente

**ANTES de fazer o primeiro deploy:**

1. Na página de configuração, expanda **"Environment Variables"**
2. Adicione a variável:
   - **Name**: `API_KEY`
   - **Value**: Sua chave Google Gemini
   - **Environments**: Selecione **Production**, **Preview** e **Development**

3. Clique em **"Add"**

![Environment Variables Configuration](https://vercel.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4JlB3Y9F0Y2MqGmK2e8W8a%2F5f9c8e7d1f5b6c8d9e0f1a2b3c4d5e6f%2Fenv-vars.png&w=3840&q=75)

### Passo 4: Deploy!

1. Clique em **"Deploy"**
2. Aguarde o build (geralmente 1-3 minutos)
3. Seu site estará disponível em: `https://seu-projeto.vercel.app`

## 🔑 Configuração de Variáveis de Ambiente

### Adicionar Variáveis Após Deploy

Se precisar adicionar ou modificar variáveis após o deploy:

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Clique em **"Add New"**
5. Configure:
   - **Key**: `API_KEY`
   - **Value**: Sua chave
   - **Environments**: Production, Preview, Development
6. Clique em **"Save"**
7. **Redeploy** o projeto para aplicar as mudanças:
   - Vá em **Deployments**
   - Clique nos **três pontos** do último deploy
   - Selecione **"Redeploy"**

### Variáveis Disponíveis

| Variável | Obrigatória | Descrição |
|----------|------------|-------------|
| `API_KEY` | ✅ Sim | Chave da API Google Gemini |

## ✅ Verificação e Testes

### Checklist Pós-Deploy

Após o deploy, verifique:

- [ ] Site carrega corretamente em `https://seu-projeto.vercel.app`
- [ ] Banner e logo aparecem na homepage
- [ ] Formulário de geração de planos é exibido
- [ ] Console do navegador (F12) não mostra erros críticos
- [ ] Testar geração de um plano de manutenção:
  - Selecionar categoria (Preventiva/Corretiva)
  - Escolher instrumento
  - Definir plataforma
  - Informar TAG
  - Clicar em "Gerar Plano"
  - Verificar se o plano é gerado com sucesso
- [ ] Exportação PDF funciona
- [ ] Exportação DOCX funciona
- [ ] Histórico salva e recupera planos

### Teste de Integração com API

Para verificar se a API Key está configurada corretamente:

1. Abra o Console do navegador (F12)
2. Vá na aba **Network**
3. Gere um plano de manutenção
4. Procure por requisições para `generativelanguage.googleapis.com`
5. Status `200` = ✅ Sucesso
6. Status `401` ou `403` = ❌ Problema com API Key

## 💻 Deploy via CLI (Opcional)

### Instalar Vercel CLI

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy de Desenvolvimento

```bash
# Deploy preview (ambiente de teste)
vercel
```

### Deploy de Produção

```bash
# Deploy para produção
vercel --prod
```

### Configurar Variáveis via CLI

```bash
# Adicionar variável de ambiente
vercel env add API_KEY

# Quando solicitado:
# - Value: [cole sua chave]
# - Environments: Selecione Production, Preview, Development
```

## 🔧 Troubleshooting

### Problema: Build Falha

**Erro**: `No Output Directory named "dist" found`

**Solução**:
1. Verificar se `vercel.json` existe na raiz
2. Confirmar que `outputDirectory` está definido como `"dist"`
3. Testar build local: `npm run build`

### Problema: Variável de Ambiente Não Reconhecida

**Erro**: `process.env.API_KEY is undefined`

**Solução**:
1. Verificar se `API_KEY` está configurada no Vercel Dashboard
2. Garantir que foi aplicada aos ambientes corretos
3. Fazer **redeploy** após adicionar variáveis
4. Verificar se `vite.config.ts` define corretamente:
   ```typescript
   define: {
     'process.env.API_KEY': JSON.stringify(env.API_KEY)
   }
   ```

### Problema: Erro 401/403 na API Gemini

**Erro**: `API request failed with status 401`

**Solução**:
1. Verificar se a chave API é válida
2. Confirmar que a API Gemini está habilitada no Google Cloud
3. Verificar quotas da API no [Google AI Studio](https://makersuite.google.com/app/apikey)
4. Testar a chave localmente antes de fazer deploy

### Problema: Roteamento SPA Não Funciona

**Erro**: 404 ao recarregar páginas

**Solução**:
Verificar se `vercel.json` contém:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

### Problema: Erro de TypeScript no Build

**Erro**: `TS2304: Cannot find name...`

**Solução**:
1. Verificar se todas as dependências estão em `package.json`
2. Executar localmente: `npm install && npm run build`
3. Verificar tipos em `tsconfig.json`

## 📊 Monitoramento

### Analytics do Vercel

O Vercel fornece analytics automáticos:

1. Acesse **Analytics** no dashboard do projeto
2. Monitore:
   - **Page Views**: Número de visualizações
   - **Unique Visitors**: Visitantes únicos
   - **Top Pages**: Páginas mais acessadas
   - **Performance**: Core Web Vitals

### Logs de Deploy

1. Vá em **Deployments**
2. Clique em qualquer deploy
3. Visualize:
   - **Build Logs**: Logs do processo de build
   - **Function Logs**: Logs de funções serverless (se houver)
   - **Runtime Logs**: Erros em tempo de execução

### Alertas e Notificações

Configure notificações:

1. **Settings** > **Notifications**
2. Configure alertas para:
   - Deploy com falha
   - Builds lentos
   - Erros em produção
   - Uso de recursos

## 🔄 Deploy Contínuo (CI/CD)

### Automático com GitHub

O Vercel automaticamente:

- ✅ **Push para `main`** → Deploy em Produção
- ✅ **Pull Request** → Preview Deploy com URL única
- ✅ **Push para outras branches** → Preview Deploy

### Preview URLs

Cada PR recebe uma URL de preview:
- `https://offshore-maintenance-pro-2-0-git-feature-abc.vercel.app`
- Perfeito para testar antes de fazer merge

## 🌐 Domínio Customizado (Opcional)

### Adicionar Domínio Próprio

1. Vá em **Settings** > **Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `maintenance.seudominio.com.br`)
4. Siga as instruções de configuração DNS
5. Aguarde propagação (até 48h)
6. SSL automático será provisionado

## 📚 Recursos Adicionais

- [Documentação Oficial Vercel](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Environment Variables Best Practices](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## ❓ Suporte

Problemas durante o deploy?

1. Consulte a seção [Troubleshooting](#-troubleshooting)
2. Abra uma [Issue no GitHub](https://github.com/celloweb-ai/Offshore_Maintenance_Pro_2.0/issues)
3. Entre em contato: marcus@vasconcellos.net.br

---

<div align="center">
  <strong>Desenvolvido com 💙 para engenheiros offshore</strong>
  <br>
  <sub>Offshore Maintenance Pro 2.0 - Deploy simplificado com Vercel</sub>
</div>
