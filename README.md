# 🛢️ Offshore Maintenance Pro 2.0

> Sistema Inteligente de Gestão de Manutenção para Instalações Offshore

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Características Principais](#-características-principais)
- [Arquitetura](#-arquitetura)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Contato](#-contato)

## 🎯 Visão Geral

O **Offshore Maintenance Pro 2.0** é uma aplicação web profissional desenvolvida para engenheiros e técnicos de instrumentação em ambientes offshore (plataformas fixas e FPSOs). Utiliza inteligência artificial generativa (Google Gemini) para criar planos de manutenção técnicos detalhados, completos e padronizados.

### Principais Aplicações

- Geração automatizada de procedimentos de manutenção preventiva
- Análise de falhas e diagnóstico técnico para manutenção corretiva
- Criação de Análises Preliminares de Risco (APR) conforme NR-37
- Histórico técnico de manutenções realizadas
- Exportação de documentos para PDF e Word

## ✨ Características Principais

### 🤖 Geração Inteligente de Planos

- **IA Contextual**: Integração com Google Gemini 3 Pro para geração de conteúdo técnico especializado
- **Personalização**: Suporte para 8 tipos de instrumentos (transmissores, válvulas, detectores)
- **Conformidade**: Aderência automática a normas ISA, NR-37, NORMAM e API

### 🛡️ Segurança e Compliance

- **APR Automática**: Geração de Análise Preliminar de Risco com identificação de hazards e mitigações
- **Normas Offshore**: Referências técnicas para FPSO e plataformas fixas
- **Especificações Técnicas**: Calibração, ranges, sinais esperados e tolerâncias

### 📊 Gestão e Histórico

- **Dashboard Técnico**: Visualização de histórico de manutenções
- **Armazenamento Local**: Persistência de até 20 planos recentes
- **Exportação Multi-formato**: PDF e DOCX com formatação profissional

### 🎨 Interface Profissional

- **Design Responsivo**: Interface otimizada para desktop e tablets
- **UX Intuitiva**: Formulários simplificados com validação em tempo real
- **Feedback Visual**: Estados de loading, erros e sucessos claramente identificados

## 🏗️ Arquitetura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                     App.tsx (Core)                      │
│  - Estado global da aplicação                           │
│  - Gerenciamento de rotas e navegação                   │
│  - Persistência localStorage                             │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴─────────┬─────────────┬───────────────┐
    │                  │             │               │
┌───▼───┐    ┌────────▼──┐   ┌──────▼─────┐  ┌─────▼──────┐
│Layout │    │ PlanForm  │   │PlanDisplay │  │  Settings  │
│       │    │           │   │            │  │   Panel    │
└───────┘    └─────┬─────┘   └─────┬──────┘  └────────────┘
                   │               │
            ┌──────▼───────────────▼──────┐
            │   geminiService.ts           │
            │  - API Google Gemini         │
            │  - Schema validation         │
            │  - Error handling            │
            └──────────────────────────────┘
```

### Fluxo de Dados

1. **Input do Usuário**: Formulário com categoria, instrumento, plataforma, TAG e sintomas
2. **Processamento IA**: Chamada à API Google Gemini com prompt estruturado
3. **Validação**: Schema JSON valida estrutura da resposta
4. **Renderização**: Componente PlanDisplay exibe plano formatado
5. **Persistência**: Armazenamento no localStorage + histórico

## 🛠️ Tecnologias Utilizadas

### Frontend

- **React 19.2** - Framework UI com hooks modernos
- **TypeScript 5.8** - Tipagem estática e segurança em tempo de compilação
- **Vite 6.2** - Build tool ultra-rápido com HMR
- **TailwindCSS** - Framework CSS utility-first (via index.css)

### Backend/Serviços

- **Google Gemini AI** - Modelo de linguagem generativa
- **@google/genai SDK** - Cliente oficial JavaScript

### Bibliotecas de Exportação

- **jsPDF** - Geração de documentos PDF
- **html2canvas** - Captura de elementos HTML
- **html-docx-js** - Conversão para formato Word

## 📦 Instalação

### Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 ou **yarn** >= 1.22.0
- **Chave API** Google Gemini (obtenha em [Google AI Studio](https://makersuite.google.com/app/apikey))

### Passos de Instalação

```bash
# Clone o repositório
git clone https://github.com/celloweb-ai/Offshore_Maintenance_Pro_2.0.git

# Entre no diretório
cd Offshore_Maintenance_Pro_2.0

# Instale as dependências
npm install
# ou
yarn install
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
API_KEY=sua_chave_api_google_gemini_aqui
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env.local` com chaves reais. O arquivo `.gitignore` já está configurado para ignorá-lo.

### 2. Configurações da Aplicação

Acesse o painel de configurações (ícone ⚙️) na aplicação para personalizar:

- **Pessoal Padrão**: Funções técnicas utilizadas (ex: "Instrumentista, Ajudante de Manutenção")
- **Supervisor**: Cargo do responsável pela aprovação

Estas configurações são persistidas no `localStorage` e aplicadas a todos os novos planos.

## 🚀 Uso

### Executar em Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

Acesse `http://localhost:5173` no navegador.

### Build para Produção

```bash
npm run build
# ou
yarn build
```

Os arquivos otimizados estarão em `dist/`.

### Preview da Build

```bash
npm run preview
# ou
yarn preview
```

### Workflow Típico

1. **Selecione a Categoria**: Preventiva ou Corretiva
2. **Escolha o Instrumento**: Transmissor, válvula, detector, etc.
3. **Defina a Plataforma**: FPSO ou Plataforma Fixa
4. **Informe a TAG**: Código do instrumento (ex: PT-1001)
5. **Descreva o Sintoma** (se corretiva): Problema observado
6. **Gere o Plano**: Aguarde processamento da IA (15-30s)
7. **Revise o Documento**: Visualize procedimentos, APR e especificações
8. **Exporte**: Baixe em PDF ou Word

## 📁 Estrutura do Projeto

```
Offshore_Maintenance_Pro_2.0/
├── components/              # Componentes React
│   ├── Layout.tsx          # Layout principal com navegação
│   ├── PlanForm.tsx        # Formulário de entrada de dados
│   ├── PlanDisplay.tsx     # Exibição do plano gerado
│   └── SettingsPanel.tsx   # Painel de configurações
├── services/               # Serviços e integrações
│   └── geminiService.ts    # Integração Google Gemini API
├── images/                 # Assets visuais
├── App.tsx                 # Componente raiz da aplicação
├── types.ts                # Definições TypeScript (interfaces/enums)
├── index.tsx               # Entry point React
├── index.html              # Template HTML
├── index.css               # Estilos globais e TailwindCSS
├── vite.config.ts          # Configuração Vite
├── tsconfig.json           # Configuração TypeScript
├── package.json            # Dependências e scripts
├── .gitignore              # Arquivos ignorados pelo Git
├── .env.local              # Variáveis de ambiente (não commitado)
└── README.md               # Documentação (este arquivo)
```

### Principais Arquivos

#### `types.ts`

Define as estruturas de dados:

- `MaintenancePlan` - Plano completo de manutenção
- `InstrumentType` - Enum com tipos de instrumentos
- `PlatformType` - Enum com tipos de plataformas
- `MaintenanceCategory` - Preventiva/Corretiva
- `UserSettings` - Configurações do usuário

#### `geminiService.ts`

Serviço de integração com IA:

- Configuração do cliente Gemini
- Schema JSON para validação de resposta
- Função `generateMaintenancePlan()` com prompt engineering

#### `App.tsx`

Gerenciador central:

- Estado global (currentPlan, history, loading, error)
- Persistência localStorage
- Lógica de navegação entre tabs
- Auto-scroll para plano gerado

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Diretrizes de Código

- Use TypeScript com tipagem estrita
- Siga os padrões ESLint do projeto
- Documente funções complexas com JSDoc
- Escreva commits semânticos (feat, fix, docs, refactor)
- Teste localmente antes de submeter PR

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📧 Contato

**CelloWeb AI Solutions**

- 🌐 GitHub: [@celloweb-ai](https://github.com/celloweb-ai)
- 📧 Email: marcus@vasconcellos.net.br
- 💼 LinkedIn: [Marcus Vasconcellos](https://www.linkedin.com/in/marcusvasconcellos)

---

<div align="center">
  <strong>Desenvolvido com 💙 para engenheiros offshore</strong>
  <br>
  <sub>Offshore Maintenance Pro 2.0 - Transformando procedimentos técnicos com IA</sub>
</div>
