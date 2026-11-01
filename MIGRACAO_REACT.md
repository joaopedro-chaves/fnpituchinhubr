# Documentação da Migração: Vanilla JS para React + Vite

Este documento registra todas as mudanças arquiteturais, organização de pastas e comparativos de código ("Antes vs. Depois") da migração do **Rastreador de Pituchinhos (`fnpituchinhubr`)** para **React com Vite** na branch `react`.

---

## 1. Visão Geral e Estrutura de Pastas

A aplicação anteriormente baseada em manipulação imperativa do DOM (`document.createElement`, `innerHTML`, `classList.toggle`) foi reestruturada para o paradigma **declarativo e baseado em componentes** do React.

```text
fnpituchinhubr/
├── index.html                  # Entrada única: <div id="root"></div> + /src/main.jsx
├── public/
│   └── codes.html              # Redirecionador do link antigo para a rota #/codes
├── package.json                # Scripts: dev, build, preview, lint, test
├── vite.config.js              # Vite + plugin React + configuração do Vitest
├── eslint.config.js            # ESLint 9 (flat config) com regras de React e Hooks
├── styles.css                  # Folha de estilos global preservada integralmente
├── sprites/                    # Centenas de imagens .webp dos pituchinhos
├── siteimages/                 # Ícone estático da marca (staticsprite.webp)
├── .github/workflows/
│   ├── ci.yml                  # CI: lint + testes + build
│   └── release-sprites.yml     # Automação de lançamento de sprites (já existente)
└── src/
    ├── main.jsx                # Bootstrap do React (createRoot)
    ├── App.jsx                 # Somente as rotas (HashRouter): "/" e "/codes"
    ├── pages/
    │   └── CatalogPage.jsx     # Página do catálogo: liga hook, filtros, grade e exportações
    ├── components/
    │   ├── Header.jsx          # Cabeçalho e barras de progresso reativas
    │   ├── FilterBar.jsx       # Busca, selects, pílulas e menus
    │   ├── SpriteCard.jsx      # Cartão reutilizável de pituchinho
    │   └── CodesPage.jsx       # Página de Códigos de Trapaça e Recompensas
    ├── hooks/
    │   └── useTrackerState.js  # Estado (useState/useMemo) + persistência (useEffect)
    ├── assets/
    │   └── spriteImages.js     # Mapeamento de imagens .webp com import.meta.glob
    ├── data/
    │   ├── sprites-data.js     # `export const baseSprites`
    │   └── codes-data.js       # `export const baseCodes`
    ├── taxonomy.js             # FONTE ÚNICA de temas e raridades (ordem, rótulos, cores)
    ├── query.js                # Funções puras de filtro, ordenação, contagem e validação
    ├── share-order.js          # Chaves de localStorage, layout de exportação, filtros
    ├── share-codec.js          # Links compartilháveis (?c=...) v1 e v2
    ├── share-legacy-order.js   # Ordem congelada do formato v1 (não editar)
    ├── view-export.js          # Imagens em Canvas 2D e textos de troca
    ├── dom-utils.js            # Toast, área de transferência e Canvas
    ├── query.test.js           # Testes de filtros, ordenação e integridade dos dados
    └── share-codec.test.js     # Testes do codec de compartilhamento
```

---

## 2. Como Executar o Projeto (Setup Vite)

No terminal, certifique-se de estar na branch `react` e possuir o Node.js e `npm` instalados:

```bash
# 1. Instalar as dependências do React e Vite
npm install

# 2. Iniciar o servidor de desenvolvimento com Hot Module Replacement (HMR)
npm run dev

# 3. Gerar o pacote otimizado de produção na pasta dist/
npm run build

# 4. Testar localmente o build de produção
npm run preview

# 5. Verificar qualidade do código
npm run lint
npm test
```

---

## 3. Comparativo Didático: Antes (Vanilla JS) vs. Depois (React)

### 3.1. Renderização de Cartões (`SpriteCard.jsx`)

#### Antes — Vanilla JS (`src/view-grid.js`)
No modelo imperativo, cada cartão era construído concatenando strings HTML (`buildCardHTML`), criando nós manualmente (`document.createElement('div')`) e atualizando classes manualmente (`updateCardDOM`):

```javascript
// src/view-grid.js (Legado)
const card = document.createElement('div');
card.dataset.id = sprite.id;
card.className = ['card', `rarity-${sprite.rarity}`, themeClass].join(' ');
card.innerHTML = buildCardHTML(sprite, obtained, mastered, state.viewMode);
frag.appendChild(card);

// Para atualizar um único card sem recriar tudo, era necessário sincronizar o DOM na mão:
export function updateCardDOM(cardEl, spriteName, isObtainedState, isMasteredState) {
    cardEl.classList.toggle('obtained', isObtainedState);
    cardEl.classList.toggle('mastered', isMasteredState);
    cardEl.setAttribute('aria-pressed', String(isObtainedState));
}
```

#### Depois — React (`src/components/SpriteCard.jsx`)
No React, o componente é uma função pura que recebe propriedades (`props`) e retorna JSX. O próprio React calcula a diferença (*diffing*) no Virtual DOM e atualiza apenas os atributos ou elementos filhos que mudaram:

```jsx
// src/components/SpriteCard.jsx
export function SpriteCard({ sprite, obtained, mastered, viewMode, onToggleObtained, onToggleMastery }) {
    const classes = ['card', `rarity-${sprite.rarity}`, `theme-${sprite.theme.replace(/\s+/g, '-')}`];
    if (obtained) classes.push('obtained');
    if (mastered) classes.push('mastered');

    return (
        <div
            className={classes.join(' ')}
            role={!viewMode ? 'button' : undefined}
            aria-pressed={!viewMode ? String(obtained) : undefined}
            onClick={() => !viewMode && onToggleObtained(sprite.id)}
        >
            {sprite.unreleased ? (
                <div className="card-badge unreleased-badge">Não lançado</div>
            ) : mastered ? (
                <div className="card-badge mastered-badge">Dominado</div>
            ) : obtained ? (
                <div className="card-badge collected">Coletado</div>
            ) : null}
            {/* ... */}
        </div>
    );
}
```

**Por que a mudança?**
- **Segurança automática:** O JSX escapa valores dinâmicos automaticamente, tornando desnecessário o uso manual de `escapeHTML()`.
- **Fim da duplicação de lógica:** Não precisamos mais manter duas lógicas separadas (`buildCardHTML` para criar + `updateCardDOM` para atualizar).
- **Eventos encapsulados:** O clique no card (`onToggleObtained`) e o clique na coroa (`e.stopPropagation()` + `onToggleMastery`) ficam declarados diretamente nos elementos correspondentes.

---

### 3.2. Barra de Filtros e Controles (`FilterBar.jsx`)

#### Antes — Vanilla JS (`src/main.js` e `src/view-grid.js`)
Era necessário buscar referências de cada `<input>` e `<select>` via `document.getElementById`, popular `<option>` manualmente com `replaceChildren` e manter a função `applyStateToDOM()` para atualizar classes `.active` nas pílulas:

```javascript
// src/main.js (Legado)
export function applyStateToDOM() {
    if (dom.searchInput) dom.searchInput.value = state.filters.search;
    if (dom.themeFilter) dom.themeFilter.value = state.filters.theme;
    dom.statusPills.querySelectorAll('.pill').forEach(pill => {
        const match = pill.dataset.status === state.filters.status;
        pill.classList.toggle('active', match);
    });
}
```

#### Depois — React (`src/components/FilterBar.jsx`)
Utilizamos **Controlled Components** (Componentes Controlados), onde o valor exibido no input (`value`) e o estado ativo das pílulas derivam diretamente do objeto `filters`:

```jsx
// src/components/FilterBar.jsx
<input
    type="search"
    id="searchInput"
    className="input"
    placeholder="Buscar…"
    value={filters.search}
    onChange={e => onFilterChange('search', e.target.value)}
/>

<select
    id="themeFilter"
    className="select"
    value={filters.theme}
    onChange={e => onFilterChange('theme', e.target.value)}
>
    <option value="all">Todos</option>
    {activeThemes.map(theme => (
        <option key={theme} value={theme}>
            {getUiThemeLabel(theme)}
        </option>
    ))}
</select>
```

**Por que a mudança?**
- **Fonte única da verdade (*Single Source of Truth*):** A interface nunca fica dessincronizada em relação ao estado salvo no `localStorage`.
- **Ciclo de vida limpo para Dropdowns:** Os menus de *Exportar* e *Configurações* agora são controlados pelo estado local `const [openDropdown, setOpenDropdown] = useState(null)` em vez de manipular classes DOM diretamente.

---

### 3.3. Gestão de Estado com `useState` e `useMemo` (`useTrackerState.js`)

#### Antes — Vanilla JS (`src/main.js`)
O estado ficava em um objeto global mutável (`export const state = { ... }`). Qualquer mutação exigia lembrar de chamar `saveCollection()` e `renderGrid(dom, state, sprites)` manualmente:

```javascript
// src/main.js (Legado)
export function toggleObtained(id, sprites) {
    if (isObtained(state, id)) {
        state.obtained = state.obtained.filter(x => x !== id);
        state.mastered = state.mastered.filter(x => x !== id);
    } else {
        state.obtained.push(id); // Mutação direta do array
    }
    saveCollection();
    renderGrid(dom, state, sprites); // Apaga e recria todo o HTML da grade
}
```

#### Depois — React (`src/hooks/useTrackerState.js`)
Substituímos a mutação direta por atualizações imutáveis com `useState` e cálculos memorizados com `useMemo`:

```javascript
// src/hooks/useTrackerState.js
const [obtained, setObtained] = useState(initialCollection.obtained);
const [mastered, setMastered] = useState(initialCollection.mastered);
const [filters, setFilters] = useState(() => getInitialFilters(sprites));

// Recalcula a lista visível APENAS quando filtros, ordenação ou coleção mudam
const visibleSprites = useMemo(() => {
    const filtered = filterSprites(sprites, trackerState);
    return sortSprites(filtered, settings.sortOrder);
}, [sprites, trackerState, settings.sortOrder]);

// Recalcula as barras de progresso automaticamente
const progressStats = useMemo(() => {
    const released = getReleasedSprites(sprites, filters.season);
    return getCollectionCounts(released, trackerState);
}, [sprites, filters.season, trackerState]);
```

**Por que a mudança?**
- **`useState`:** Garante que toda alteração na coleção ou nos filtros dispare automaticamente a atualização visual dos componentes dependentes (como o `Header` de progresso e a grade de `SpriteCard`), sem precisarmos chamar `updateProgress()` ou `renderGrid()`.
- **`useMemo`:** Evita reexecutar a filtragem e a ordenação caso o componente sofra re-renderizações que não afetem a lista de sprites, mantendo alta performance mesmo com centenas de cartões.

---

### 3.4. Tratamento de Imagens Estáticas no Vite (`src/assets/spriteImages.js`)

#### Antes — Vanilla JS (`src/view-grid.js`)
O caminho era montado como string relativa fixa:
```javascript
const imgPath = `sprites/${encodeURIComponent(sprite.id)}.webp`;
```
Em um bundler moderno como o Vite, referenciar strings dinâmicas soltas pode impedir que o empacotador inclua os arquivos na pasta `dist/` ou adicione hashes de cache em produção.

#### Depois — Vite `import.meta.glob` (`src/assets/spriteImages.js`)
Utilizamos a funcionalidade nativa `import.meta.glob` do Vite para mapear estaticamente todos os arquivos `.webp` da pasta `/sprites/` e `/siteimages/` em tempo de compilação:

```javascript
// src/assets/spriteImages.js
const spriteModules =
    typeof import.meta.glob === 'function'
        ? import.meta.glob('/sprites/*.webp', { eager: true, import: 'default' })
        : {};

export function getSpriteImageUrl(spriteId) {
    if (!spriteId) return '';
    const key = `/sprites/${spriteId}.webp`;
    return spriteModules[key] || `sprites/${encodeURIComponent(spriteId)}.webp`;
}
```

**Por que a mudança?**
- Garante que todas as imagens `.webp` sejam reconhecidas pelo grafo de dependências do Vite durante o `vite build`, funcionando perfeitamente tanto nos cartões `<SpriteCard />` quanto na exportação em `<canvas>` (`src/view-export.js`).

---

## 4. Refinamentos Pós-Migração

Depois da migração inicial, uma análise do projeto apontou 8 pontos de melhoria. Todos foram aplicados e estão registrados abaixo.

| # | Problema | Solução | Onde |
|---|---|---|---|
| 1 | ~1.000 linhas de código morto do Vanilla JS | Arquivos removidos | `main.js`, `view-grid.js`, `app.js`, `codes-app.js` |
| 2 | Efeitos colaterais dentro de atualizadores de estado | Atualizadores puros + persistência em `useEffect` | `useTrackerState.js` |
| 3 | 279 imagens com `loading="eager"` e `fetchPriority="high"` | Prioridade só para os primeiros 24 cards | `SpriteCard.jsx`, `CatalogPage.jsx` |
| 4 | Coleção local "piscava" antes da compartilhada | Modo somente leitura já nasce vazio quando há `?c=` | `useTrackerState.js` |
| 5 | Temas e raridades duplicados em 3 arquivos | `taxonomy.js` como fonte única | `taxonomy.js`, `share-order.js`, `query.js`, `view-export.js` |
| 6 | Sprite placeholder com campos vazios | Componente tolerante + validação de dados em teste | `SpriteCard.jsx`, `getSpriteDataIssues` |
| 7 | Navegação improvisada com `#codes` e `pathname` | `react-router-dom` com `HashRouter` | `App.jsx`, `public/codes.html` |
| 8 | Sem ESLint, testes, CI ou README atualizado | ESLint 9, Vitest, workflow de CI e README | `eslint.config.js`, `*.test.js`, `ci.yml` |

### 4.1. Código morto removido

O app React não importa mais nenhum destes arquivos, então foram apagados. Além deles, saíram os helpers de DOM que só serviam ao Vanilla JS (`escapeHTML`, `setDropdownOpen`, `closeDropdowns`) e o fallback global `typeof baseSprites !== 'undefined'` dos parâmetros padrão.

**Por que:** código que ninguém chama confunde quem está estudando o projeto ("qual destes arquivos manda?") e faz o ESLint e a revisão perderem tempo.

### 4.2. Atualizadores puros e persistência em `useEffect`

#### Antes
```javascript
setObtained(prev => {
    const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    persistValue(KEYS.obtained, next);              // efeito colateral dentro do atualizador
    if (prev.includes(id)) setMastered(/* ... */);  // setState dentro de setState
    return next;
});
```

#### Depois
```javascript
// obtained e mastered no MESMO estado: a atualização é atômica
setCollection(prev =>
    prev.obtained.includes(id)
        ? { obtained: prev.obtained.filter(x => x !== id),
            mastered: prev.mastered.filter(x => x !== id) }
        : { ...prev, obtained: [...prev.obtained, id] }
);

// A gravação acontece em um efeito, depois da renderização
useEffect(() => {
    if (viewMode) return;   // nunca sobrescreve a coleção local ao ver um link
    persistValue(KEYS.obtained, collection.obtained);
    persistValue(KEYS.mastered, collection.mastered);
}, [collection, viewMode]);
```

**Por que:** o React pode executar a função passada a `setState` mais de uma vez (o `StrictMode` faz isso de propósito em desenvolvimento). Por isso ela precisa ser **pura**: só calcula o próximo estado. Gravar no `localStorage` é um efeito colateral e pertence ao `useEffect`. Juntar `obtained` e `mastered` em um só estado também elimina o `setState` aninhado.

### 4.3. Carregamento de imagens

```jsx
// SpriteCard.jsx
<img
    loading={priority ? 'eager' : 'lazy'}
    fetchPriority={priority ? 'high' : 'auto'}
    /* ... */
/>

// CatalogPage.jsx — só os 24 primeiros cards (acima da dobra) têm prioridade
<SpriteCard priority={index < PRIORITY_CARDS} /* ... */ />
```

**Por que:** pedir prioridade alta para as 279 imagens equivale a não priorizar nenhuma. Agora o navegador carrega primeiro o que o usuário vê e adia o resto.

### 4.4. Coleção compartilhada sem "piscar"

#### Antes
O estado nascia com a coleção salva localmente e, só depois que a decodificação assíncrona do `?c=` terminava, era trocado pela coleção compartilhada. Por um instante o usuário via os próprios dados dentro do link de outra pessoa.

#### Depois
```javascript
const [initial] = useState(() => {
    const shareCode = getShareCode();
    return {
        shareCode,
        collection: shareCode ? EMPTY_COLLECTION : getStoredCollection(sprites),
    };
});
const [viewMode, setViewMode] = useState(Boolean(initial.shareCode));
const [loadingShared, setLoadingShared] = useState(Boolean(initial.shareCode));
```

**Por que:** a decisão "estou em modo compartilhado?" é tomada de forma síncrona, na primeira renderização. A grade expõe `aria-busy` enquanto a coleção é decodificada.

### 4.5. Taxonomia única (`taxonomy.js`)

#### Antes
Ordem e rótulos de tema/raridade estavam em `share-order.js` (`THEME_ORDER`, `EXPORT_THEME_LABELS`...), cores duplicadas em `taxonomy.js` e de novo em `getRarityGradient` e `getRarityTagColors` de `view-export.js`, com temas legados (`Rift`, `Trapaça`, `Hacker`) e tabelas em inglês que os dados nunca usam.

#### Depois
```javascript
// taxonomy.js — o único lugar a editar para criar um tema novo
export const THEME = {
    'Básico': { order: 0, gradient: [...], exportLabel: 'NORMAL', tradeLabel: 'Base' },
    'Dourado': { order: 1, gradient: [...], exportLabel: 'DOURADO' },
    // ...
};
export const THEME_ORDER = byOrder(THEME);        // derivado
export const RARITY_ORDER = byOrder(RARITIES);    // derivado
```

`query.js` (`getExportThemeLabel`, `getTradeThemeLabel`) e `view-export.js` (cores do card exportado) agora leem desse módulo.

**Por que:** com uma fonte única, adicionar um tema não exige lembrar de três arquivos. Durante a unificação apareceu um erro de digitação (`'GALÁTICO'`, faltava o C) que passaria a aparecer nas imagens exportadas; foi corrigido para `'GALÁCTICO'`, o texto que o app já gerava antes.

### 4.6. Sprites incompletos e validação de dados

- `SpriteCard` tolera `name`, `theme` e `rarity` vazios (usa o `id` como nome), então um placeholder como `chesthunter_basic` não quebra a tela se for exibido com "Não lançados" ligado.
- `getSpriteDataIssues(sprites)` em `query.js` valida os dados: ids únicos e, para sprites **lançados**, nome preenchido, tema e raridade conhecidos.
- Um teste roda essa validação nos dados reais. Se alguém lançar um sprite sem preencher os campos, o `npm test` e o CI falham antes do deploy.

### 4.7. Rotas com `react-router-dom`

#### Antes
```javascript
// App.jsx — navegação manual
const [currentPage, setCurrentPage] = useState(getInitialPage);
window.history.pushState({}, '', '#codes');
if (window.location.pathname.endsWith('/codes.html')) { /* ... */ }
```

#### Depois
```jsx
// App.jsx
<HashRouter>
    <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/codes" element={<CodesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
</HashRouter>

// Em qualquer componente
const navigate = useNavigate();
navigate('/codes');
```

**Por que `HashRouter`:** o site é estático no GitHub Pages, sem servidor para reescrever URLs. As rotas ficam em `#/` e `#/codes`, e o link de compartilhamento (`?c=...`) continua na query string real.

**Compatibilidade:** o antigo `codes.html` virou `public/codes.html`, uma página mínima que redireciona para `#/codes`. Links e favoritos antigos continuam funcionando e o Vite voltou a ter uma única entrada.

### 4.8. Qualidade: ESLint, Vitest e CI

| Ferramenta | Comando | O que cobre |
|---|---|---|
| ESLint 9 + `react` + `react-hooks` | `npm run lint` | Erros comuns, regras dos Hooks, variáveis não usadas |
| Vitest | `npm test` | 23 testes: filtros, ordenação, contagens, rótulos, integridade dos dados e codec de compartilhamento (v1, v2, `2r.`, entradas inválidas) |
| GitHub Actions | `.github/workflows/ci.yml` | Roda lint, testes e build a cada push na branch `react` e em pull requests |

> **Nota:** o ESLint está fixado na versão 9 porque `eslint-plugin-react` ainda não declara suporte ao ESLint 10. O lint ajudou na própria refatoração: apontou os fallbacks `baseSprites` herdados do Vanilla JS e um bloco `catch` vazio.

### 4.9. Verificação

| Verificação | Resultado |
|---|---|
| `npm run lint` | Sem erros |
| `npm test` | 23 de 23 testes passando |
| `npm run build` | 337 módulos; JS 370 KB (108 KB gzip), CSS 28 KB; `dist/codes.html` gerado |

> **Limitação:** a verificação cobre lint, testes unitários e build. Os componentes React e a navegação não têm testes automatizados e não foram exercitados em um navegador. Vale clicar pelo app (`npm run dev`): coletar, dominar, filtrar, compartilhar, abrir `?c=...` e ir para Trapaças.
