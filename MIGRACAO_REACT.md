# Documentação da Migração: Vanilla JS para React + Vite

Este documento registra todas as mudanças arquiteturais, organização de pastas e comparativos de código ("Antes vs. Depois") da migração do **Rastreador de Pituchinhos (`fnpituchinhubr`)** para **React com Vite** na branch `react`.

---

## 1. Visão Geral e Estrutura de Pastas

A aplicação anteriormente baseada em manipulação imperativa do DOM (`document.createElement`, `innerHTML`, `classList.toggle`) foi reestruturada para o paradigma **declarativo e baseado em componentes** do React.

```text
fnpituchinhubr/
├── index.html                  # Entrada principal montando <div id="root"></div> e /src/main.jsx
├── codes.html                  # Entrada secundária compatível com links diretos para Trapaças
├── package.json                # Scripts do Vite (dev, build, preview) e dependências React
├── vite.config.js              # Configuração do bundler Vite e múltiplos pontos de entrada
├── styles.css                  # Folha de estilos global preservada integralmente
├── sprites/                    # Centenas de imagens .webp dos pituchinhos
├── siteimages/                 # Ícone estático da marca (staticsprite.webp)
└── src/
    ├── main.jsx                # Bootstrap do React (createRoot)
    ├── App.jsx                 # Componente raiz (orquestra rotas, estado e ações de exportação)
    ├── assets/
    │   └── spriteImages.js     # Mapeamento dinâmico de imagens .webp com import.meta.glob
    ├── components/
    │   ├── Header.jsx          # Cabeçalho e barras de progresso reativas (Coleção e Dominados)
    │   ├── FilterBar.jsx       # Barra de busca, selects de filtro/ordenação, pílulas e menus
    │   ├── SpriteCard.jsx      # Componente reutilizável de cartão de pituchinho
    │   └── CodesPage.jsx       # Página completa de Códigos de Trapaça e Recompensas
    ├── hooks/
    │   └── useTrackerState.js  # Hook customizado com useState, useMemo e persistência localStorage
    ├── data/
    │   ├── sprites-data.js     # Catálogo estático exportado via ES Modules (`export const baseSprites`)
    │   └── codes-data.js       # Lista de códigos exportada via ES Modules (`export const baseCodes`)
    ├── query.js                # Funções puras de filtragem, ordenação e contagem (100% reaproveitadas)
    ├── share-order.js          # Constantes de ordenação, chaves de localStorage e layout
    ├── share-codec.js          # Compressão/descompressão de links compartilháveis (?c=...)
    ├── view-export.js          # Geração de imagens em Canvas 2D e textos de troca
    └── dom-utils.js            # Utilitários de toast, área de transferência e Canvas
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
