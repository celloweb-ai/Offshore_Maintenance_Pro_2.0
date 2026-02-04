# Guia de Contribuição

Obrigado por considerar contribuir com o **Offshore Maintenance Pro 2.0**! Este documento fornece diretrizes para contribuir com o projeto.

## 🎯 Código de Conduta

Este projeto adere a um código de conduta. Ao participar, você se compromete a manter um ambiente respeitoso e profissional.

### Nossas Expectativas

- Usar linguagem acolhedora e inclusiva
- Respeitar diferentes pontos de vista e experiências
- Aceitar críticas construtivas de forma profissional
- Focar no que é melhor para a comunidade
- Demonstrar empatia com outros membros

## 📝 Como Contribuir

### Reportando Bugs

Antes de criar um issue de bug:

1. **Verifique se o bug já foi reportado** na aba Issues
2. **Confirme que é um bug** e não uma dúvida sobre uso
3. **Colete informações de debug**:
   - Versão do navegador
   - Console logs (F12 > Console)
   - Steps para reproduzir
   - Comportamento esperado vs observado

#### Template de Bug Report

```markdown
**Descrição**
Descreva o bug de forma clara e concisa.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [ex: Windows 10, macOS 13]
- Navegador: [ex: Chrome 120, Firefox 115]
- Versão do Node: [ex: 18.17.0]

**Contexto Adicional**
Qualquer outra informação relevante.
```

### Sugerindo Melhorias

Melhorias são sempre bem-vindas! Antes de sugerir:

1. **Verifique se já existe uma sugestão similar**
2. **Explique o caso de uso**: Por que esta melhoria é útil?
3. **Descreva a solução ideal** e alternativas consideradas
4. **Indique complexidade estimada** (se possível)

#### Template de Feature Request

```markdown
**Problema/Necessidade**
Descreva qual problema esta feature resolve.

**Solução Proposta**
Descreva a solução que você gostaria de ver.

**Alternativas Consideradas**
Outras abordagens que foram avaliadas.

**Impacto**
Quem se beneficiaria desta feature?

**Exemplo de Uso**
```typescript
// Exemplo de código mostrando o uso
```
```

### Pull Requests

#### Processo

1. **Fork o repositório** e crie sua branch a partir de `main`
2. **Implemente suas mudanças** seguindo os padrões do projeto
3. **Teste completamente** suas alterações
4. **Atualize a documentação** se necessário
5. **Commit com mensagens semânticas** (veja abaixo)
6. **Submeta o Pull Request** com descrição detalhada

#### Checklist de PR

Antes de submeter seu PR, verifique:

- [ ] Código segue os padrões TypeScript do projeto
- [ ] Todos os tipos estão corretamente definidos
- [ ] Não há erros de lint (`npm run lint` se houver)
- [ ] Build funciona sem erros (`npm run build`)
- [ ] Documentação foi atualizada (README, JSDoc)
- [ ] Commits seguem padrão semântico
- [ ] PR tem título descritivo e descrição completa

#### Mensagens de Commit Semânticas

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição curta>

<corpo opcional com detalhes>

<footer opcional com breaking changes>
```

**Tipos:**

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Formatação, ponto-e-vírgula faltando, etc
- `refactor`: Refatoração de código
- `perf`: Melhorias de performance
- `test`: Adição/correção de testes
- `chore`: Manutenção geral (deps, config)

**Exemplos:**

```bash
feat(planform): adiciona validação de TAG format
fix(gemini): corrige timeout em requisições longas
docs(readme): atualiza instruções de instalação
refactor(types): reorganiza interfaces de MaintenancePlan
```

## 🛠️ Desenvolvimento

### Setup do Ambiente

```bash
# Clone seu fork
git clone https://github.com/SEU_USUARIO/Offshore_Maintenance_Pro_2.0.git
cd Offshore_Maintenance_Pro_2.0

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com sua API key

# Inicie o servidor de desenvolvimento
npm run dev
```

### Estrutura de Branches

- `main` - Branch principal (protegida)
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Melhorias na documentação
- `refactor/*` - Refatorações de código

### Padrões de Código

#### TypeScript

```typescript
// BOM: Tipos explícitos e interfaces bem definidas
interface MaintenanceProps {
  plan: MaintenancePlan;
  onExport: (format: 'pdf' | 'docx') => Promise<void>;
}

const Component: React.FC<MaintenanceProps> = ({ plan, onExport }) => {
  // ...
};

// RUIM: Uso de 'any'
const processData = (data: any) => { // Não faça isso!
  // ...
};
```

#### React Components

```typescript
// BOM: Componente funcional com tipos
import React, { useState, useEffect } from 'react';
import { MaintenancePlan } from '../types';

interface PlanDisplayProps {
  plan: MaintenancePlan;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    // Side effects aqui
  }, [plan]);
  
  return (
    <div className="plan-display">
      {/* JSX */}
    </div>
  );
};

export default PlanDisplay;
```

#### Naming Conventions

- **Componentes**: PascalCase (`PlanForm`, `SettingsPanel`)
- **Funções**: camelCase (`generatePlan`, `handleSubmit`)
- **Constantes**: UPPER_SNAKE_CASE (`API_KEY`, `MAX_HISTORY_SIZE`)
- **Interfaces/Types**: PascalCase (`MaintenancePlan`, `UserSettings`)
- **Enums**: PascalCase com valores PascalCase

```typescript
enum InstrumentType {
  PRESSURE_TRANSMITTER = 'Transmissor de Pressão',
  CONTROL_VALVE = 'Válvula de Controle'
}
```

### Documentação de Código

Documente funções complexas com JSDoc:

```typescript
/**
 * Gera um plano de manutenção utilizando IA generativa.
 * 
 * @param category - Tipo de manutenção (preventiva ou corretiva)
 * @param instrumentType - Tipo de instrumento a ser mantido
 * @param platformType - Tipo de plataforma offshore
 * @param tag - TAG de identificação do instrumento
 * @param symptom - Sintoma de falha (obrigatório para manutenção corretiva)
 * @param settings - Configurações personalizadas do usuário
 * @returns Promise com o plano de manutenção gerado
 * @throws Error se a geração falhar ou timeout
 */
export const generateMaintenancePlan = async (
  category: MaintenanceCategory,
  instrumentType: InstrumentType,
  platformType: PlatformType,
  tag: string,
  symptom?: string,
  settings?: UserSettings
): Promise<MaintenancePlan> => {
  // Implementação
};
```

## 🧪 Testes

Atualmente o projeto não possui testes automatizados, mas contribuições para adicionar:

- **Unit tests** (Jest + React Testing Library)
- **Integration tests** para fluxos completos
- **E2E tests** (Playwright/Cypress)

são muito bem-vindas!

### Testes Manuais

Antes de submeter PR, teste manualmente:

1. **Formulário de geração**
   - Validações funcionam corretamente
   - Loading state é exibido
   - Erros são tratados adequadamente

2. **Geração de planos**
   - Preventiva e Corretiva funcionam
   - Todos os instrumentos geram planos válidos
   - APR contém pelo menos 4 riscos

3. **Histórico**
   - Planos são salvos no localStorage
   - Carregamento de planos antigos funciona
   - Limite de 20 planos é respeitado

4. **Exportação**
   - PDF gera documento formatado
   - Word preserva formatação
   - Links e referências estão corretos

5. **Configurações**
   - Persistência funciona
   - Valores são aplicados aos novos planos

## 📈 Roadmap

Áreas onde contribuições são especialmente bem-vindas:

### Alta Prioridade

- [ ] Adição de testes automatizados
- [ ] Suporte a múltiplas línguas (i18n)
- [ ] Modo offline com cache inteligente
- [ ] Autenticação e sincronização em nuvem

### Média Prioridade

- [ ] Editor de planos gerados
- [ ] Templates personalizados
- [ ] Integração com CMMS (SAP PM, Maximo)
- [ ] Análise de tendências de falhas

### Baixa Prioridade

- [ ] Tema dark/light mode
- [ ] Exportação para Excel
- [ ] Assinatura digital de documentos
- [ ] Módulo de treinamento interativo

## ❓ Dúvidas

Se tiver dúvidas sobre como contribuir:

1. Verifique a [documentação existente](README.md)
2. Procure em [Issues fechadas](https://github.com/celloweb-ai/Offshore_Maintenance_Pro_2.0/issues?q=is%3Aissue+is%3Aclosed)
3. Abra uma [Discussion](https://github.com/celloweb-ai/Offshore_Maintenance_Pro_2.0/discussions)
4. Entre em contato: marcus@vasconcellos.net.br

## 🚀 Primeiros Passos

Se é sua primeira contribuição, considere começar com:

- **Good First Issues**: Issues marcadas com `good first issue`
- **Documentação**: Melhorias no README, JSDoc, exemplos
- **Refatorações**: Pequenas otimizações de código
- **Testes**: Adição de casos de teste

## 🎉 Reconhecimento

Todos os contribuidores serão reconhecidos no projeto. Contribuições significativas serão destacadas no README.

---

**Obrigado por contribuir com o Offshore Maintenance Pro 2.0!** 🚀
