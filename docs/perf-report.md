# Relatório de Refatoração de Desempenho

Relatório final das Fases 0 a 7 executadas no repositório `fnpituchinhubr`, preservando integralmente o comportamento externo, o visual e os bugs pré-existentes.

---

## 1. Comparativo de Chunks e Métricas (Antes vs. Depois)

| Artefato / Métrica | Baseline (Fase 0 — `61427b7`) | Final (Fase 7 — `54a05ba`) | Variação |
| --- | ---: | ---: | ---: |
| Chunk principal JS (`index-*.js`) | `347.35 kB` (`98.17 kB` gzip) | `341.19 kB` (`95.90 kB` gzip) | `-6.16 kB` (`-2.27 kB` gzip) |
| Chunk sob demanda (`view-export-*.js`) | *embutido no principal* | `12.31 kB` (`4.76 kB` gzip) | carregado só ao exportar |
| CSS principal (`index-*.css`) | `34.20 kB` (`7.39 kB` gzip) | `30.62 kB` (`6.89 kB` gzip) | `-3.58 kB` (`-0.50 kB` gzip / `-10.5%` bruto) |
| HTML (`dist/index.html`) | `1.18 kB` (`0.61 kB` gzip) | `1.13 kB` (`0.59 kB` gzip) | `-0.05 kB` (`Roboto Mono` removida) |
| Precache Workbox (`dist/sw.js`) | `322` entradas (`6644.75 KiB`) | `323` entradas (`6647.21 KiB`) | `+1` chunk separado |
| `npm run lint` | `0` erros | `0` erros | — |
| `npm test` (Vitest) | `2` arquivos, `23` testes (`real 1.32s`) | `5` arquivos, `40` testes (`real 5.16s`, inclui `jsdom`) | `+17` testes (paridade, renders e persistência) |
| `npm run build` | `2.77s` Vite / `real 6.60s` total | `2.81s` Vite / `real 6.81s` total | `+0.21s` |

> **Nota sobre o chunk JS principal:** A extração de [src/view-export.js](file:///home/radiant/DevHub/fnpituchinhubr/src/view-export.js) reduziu o JS inicial de `347.35 kB` (`98.17 kB` gzip) para `338.51 kB` (`95.13 kB` gzip) na Fase 3; as pequenas adições estruturais das Fases 4 e 5 (`React.memo`, `WeakMap`, hooks incrementais/debounce) deixaram o final em `341.19 kB` (`95.90 kB` gzip).

---

## 2. O Que Foi Implementado, O Que Foi Pulado e Por Quê

### Implementado por Fase
- **Fase 0 (`61427b7`):** Medição inicial documentada em [docs/perf-baseline.md](file:///home/radiant/DevHub/fnpituchinhubr/docs/perf-baseline.md).
- **Fase 1 (`768e325`):** Ampliação de [src/query.test.js](file:///home/radiant/DevHub/fnpituchinhubr/src/query.test.js) (todos os métodos de `sortSprites`, `getCollectionCounts`, `getSeasonData`, `getFamilyKeys`, `getActiveThemes`, `getCharName`, `getFamilyThemeMap`, `getSpriteIdSet`, `uniqueValidIds`, `isObtained`, `isMastered`, `getDisplayName`) e criação de [src/view-export.test.js](file:///home/radiant/DevHub/fnpituchinhubr/src/view-export.test.js), ambos aprovados sem modificar o código original.
- **Fase 2 (`55cfcb7`):** Em [src/hooks/useGamepadAndSpatialNav.js](file:///home/radiant/DevHub/fnpituchinhubr/src/hooks/useGamepadAndSpatialNav.js):
  - `requestAnimationFrame` (`pollGamepad`) iniciado sob demanda apenas quando há controle conectado no mount ou em `gamepadconnected`, parado em `gamepaddisconnected` (quando zera) e pausado/retomado via `visibilitychange` (`document.hidden`).
  - Substituição de `Array.from(...).filter(Boolean)` por iteração `for` direta (`findActiveGamepad`), remoção da ref morta `visibleSpritesRef` e fast-path de `document.activeElement` em `moveFocusInDirection` com fallback para `querySelector`.
  - **Prova de equivalência em `findSpatialCandidate`:** Em [src/pages/CatalogPage.jsx](file:///home/radiant/DevHub/fnpituchinhubr/src/pages/CatalogPage.jsx), `#spriteGrid` renderiza diretamente `{visibleSprites.map(...)}` — cards filtrados são desmontados do DOM (nunca ocultados com `display: none` ou `hidden`), e nem [src/components/SpriteCard.jsx](file:///home/radiant/DevHub/fnpituchinhubr/src/components/SpriteCard.jsx) nem [styles.css](file:///home/radiant/DevHub/fnpituchinhubr/styles.css) aplicam ocultação condicional em `.card`. Assim, verificar `container.checkVisibility()` uma única vez e iterar `container.children` (com fallback `candidate.offsetParent === null` se `checkVisibility` não existir) é estritamente equivalente a checar `checkVisibility()` nos 314 cards.
- **Fase 3 (`0e17827`):**
  - Remoção de `Roboto Mono` de [index.html](file:///home/radiant/DevHub/fnpituchinhubr/index.html) mantendo `Roboto` com todos os pesos/itálico (`0,100..900;1,100..900`).
  - `decoding="async"` na `<img>` de [src/components/SpriteCard.jsx](file:///home/radiant/DevHub/fnpituchinhubr/src/components/SpriteCard.jsx).
  - Carregamento sob demanda de [src/view-export.js](file:///home/radiant/DevHub/fnpituchinhubr/src/view-export.js) com preload em `onPointerEnter`/`onFocus`/`onClick` de `#exportToggle` em [src/components/FilterBar.jsx](file:///home/radiant/DevHub/fnpituchinhubr/src/components/FilterBar.jsx) e execução síncrona quando já pré-carregado (preservando o *user gesture* para Clipboard/`window.open`).
  - Em [src/view-export.js](file:///home/radiant/DevHub/fnpituchinhubr/src/view-export.js): carregamento apenas de `mascot` + `config.items` (os sprites realmente desenhados), cache em memória (`loadedImageCache` `Map` por `src`), e exportação desktop via `canvas.toBlob` + `URL.createObjectURL` + `URL.revokeObjectURL`.
  - **Proposta para `PRIORITY_CARDS` (mantido em `24` sem alteração):** Com base em `.app` (`max-width: 1400px`, `padding: 20px`) e `.grid` em [styles.css](file:///home/radiant/DevHub/fnpituchinhubr/styles.css):
    - **Desktop:** `repeat(auto-fill, minmax(116px, 1fr))` com `gap: 16px` acomoda até ~10 colunas; acima da dobra cabem ~2 linhas (`~20` cards).
    - **Mobile:** `repeat(3, minmax(0, 1fr))` em `<= 480px` (~6–9 cards acima da dobra) e `repeat(2, ...)` em `<= 320px` (~4–6 cards).
    - **Proposta:** separar `EAGER_CARDS = 20` (`loading="eager"`) e `fetchPriority="high"` apenas nos primeiros `8` cards (primeira linha mobile/desktop), reduzindo contenção inicial de rede no mobile sem impactar LCP.
- **Fase 4 (`30c80bc`):**
  - Instalação de `@testing-library/react` e `jsdom` em `devDependencies` (autorizada pelo usuário).
  - `React.memo` em [SpriteCard.jsx](file:///home/radiant/DevHub/fnpituchinhubr/src/components/SpriteCard.jsx), [Header.jsx](file:///home/radiant/DevHub/fnpituchinhubr/src/components/Header.jsx), [FilterBar.jsx](file:///home/radiant/DevHub/fnpituchinhubr/src/components/FilterBar.jsx) (`M3FilterMenu` + `FilterBar`) e [ControllerHud.jsx](file:///home/radiant/DevHub/fnpituchinhubr/src/components/ControllerHud.jsx).
  - `WeakMap` de metadados estáticos do sprite em `SpriteCard` (confirmado via `grep` que `baseSprites` e os objetos `sprite` nunca são mutados em `src/`).
  - Memoização de opções (`themeOptions`, `SEASON_OPTIONS`, `SORT_OPTIONS`) em `FilterBar.jsx` e estabilização de handlers com `useRef`/`useCallback` em [CatalogPage.jsx](file:///home/radiant/DevHub/fnpituchinhubr/src/pages/CatalogPage.jsx).
  - Teste automatizado em [src/render-count.test.js](file:///home/radiant/DevHub/fnpituchinhubr/src/render-count.test.js) comprovando sobre todos os 314 cards reais: mover foco re-renderiza apenas **`2` `SpriteCard`s** (`0` `Header`/`FilterBar`/`ControllerHud`); clicar para coletar/dominar/desmarcar domínio re-renderiza **`1` `SpriteCard`** (`0` `FilterBar`/`ControllerHud`). Telemetria protegida por `import.meta.env.MODE === 'test'` (`0` ocorrências no bundle de produção verificado com `grep`).
- **Fase 5 (`59b280c`):** Em [src/hooks/useTrackerState.js](file:///home/radiant/DevHub/fnpituchinhubr/src/hooks/useTrackerState.js):
  - Persistência incremental no `localStorage` (0 gravações no mount inicial; grava apenas a chave alterada), debounce de `200 ms` para `KEYS.search` com flush imediato em `pagehide`, `visibilitychange` (`hidden`) e unmount — validado em [src/useTrackerState.test.js](file:///home/radiant/DevHub/fnpituchinhubr/src/useTrackerState.test.js).
  - `useDeferredValue(filters.search)` para filtrar o grid mantendo digitação responsiva, `progressStats` com dependências mínimas `[sprites, filters.season, obtained, mastered]` e `new Set(obtained)` em `getStoredCollection`.
- **Fase 6 (`f6f602e`):** Versão enxuta em [src/query.js](file:///home/radiant/DevHub/fnpituchinhubr/src/query.js) e [src/view-export.js](file:///home/radiant/DevHub/fnpituchinhubr/src/view-export.js): `Intl.Collator` reutilizável em `sortSprites` (com paridade verificada contra `localeCompare` em todos os `baseSprites`), `Set` em `getFamilyKeys`, `getActiveThemes`, `filterSprites`, `getCollectionCounts`, `getExportConfig`, `generateTradeText` e `generateTradeGridText`, e loop de passagem única em `getCollectionCounts`.
- **Fase 7 (`54a05ba`):** Remoção segura em [styles.css](file:///home/radiant/DevHub/fnpituchinhubr/styles.css) após `grep` em `index.html`, `src/`, `src/taxonomy.js` e `sprites-data.js`: utilitários tipográficos (`.display-*`, `.headline-*`, `.title-*`, `.body-*`, `.label-*`), botões legados (`.btn-accent`, `.btn-sm`, `.btn-redeemed`), dropdowns legados (`.dropdown`, `.dropdown-menu*`), temas ausentes da taxonomia (`.theme-Rift`, `.theme-Trapaça`, `.theme-Hacker` mantendo `.theme-Trapaceiro` e `.theme-Hacker-de-Saque`) e `.footer a`.

### O Que Foi Pulado e Por Quê
- **Import dinâmico de `share-legacy-order.js` / `share-codec.js`:** Pulado na Fase 3 porque [src/share-legacy-order.js](file:///home/radiant/DevHub/fnpituchinhubr/src/share-legacy-order.js) tem apenas `4.913` bytes brutos (`1.271` bytes gzip), ganho irrisório frente ao custo de um chunk e roundtrip extras.
- **Lógica condicional para pular `filterSprites`/`sortSprites` (Fase 5):** Pulada conforme regra explícita do usuário, mantendo dependências completas e corretas.
- **Caches `WeakMap`/`Map` em `getSeasonData`, `getCharName`, `getFamilyKeys`, `getActiveThemes` e `getOrderedIndex` (Fase 6):** Pulados conforme regra da versão enxuta.
- **`.m3-card-tooltip`, `.dropdown-divider` e `.dropdown-section-title` (Fase 7):** `.m3-card-tooltip` foi mantida porque ainda é referenciada no trecho comentado em `SpriteCard.jsx` (reservado para reativação futura); `.dropdown-divider` e `.dropdown-section-title` são ativamente usadas dentro de `.modal-body` em `FilterBar.jsx`.

---

## 3. Divergências Entre o Plano e o Código Real

1. **`FilterBar.jsx` e IDs duplicados:** O plano mencionava possível duplicidade de `id`, porém `M3FilterMenu` já usa `${id}MenuTrigger` enquanto os `<select>` mobile usam `id="themeFilter"|"seasonFilter"|"sortOrder"` — não havia duplicidade no DOM.
2. **`importCollection` em `useTrackerState.js`:** Já validava `mastered` com `new Set(cleanObtained)`; apenas `getStoredCollection` ainda usava `obtained.includes(id)`.
3. **Referências de linha:** Os números de linha do plano original não correspondiam exatamente ao `HEAD` atual (deslocados após commits anteriores de UI/M3); todas as edições foram localizadas diretamente nos arquivos reais.
4. **Google Fonts:** A busca simples por `"Roboto Mono"` não encontrava a string em `index.html` porque na URL estava codificada como `Roboto+Mono`.

---

## 4. Bugs Pré-Existentes Encontrados (Não Corrigidos)

1. **`--duration-short3` indefinido em [styles.css](file:///home/radiant/DevHub/fnpituchinhubr/styles.css):** Usado em `.m3-menu` (`L550`) e `.m3-card-tooltip` (`L1051-1053`), porém apenas `--duration-short1`, `--duration-short2`, `--duration-short`, `--duration-medium1`, `--duration-standard`, `--duration-medium2` e `--duration-long1` existem em `:root`, fazendo essas transições/animações caírem no fallback `0s`.
2. **ObjectURL sem `revokeObjectURL` no fluxo iOS/`openExports` em [src/view-export.js](file:///home/radiant/DevHub/fnpituchinhubr/src/view-export.js):** Na linha do `shouldOpenInNewTab` (`window.open(url, '_blank')`), a URL criada não é revogada após abrir a aba.

---

## 5. Checklist de Validação Manual no Navegador

Execute `npm run preview` e valide os seguintes itens (de preferência comparando com as medições do DevTools sugeridas em [docs/perf-baseline.md](file:///home/radiant/DevHub/fnpituchinhubr/docs/perf-baseline.md)):

- [ ] **Cards e Rarity `Especial`:** Verificar visual normal, estados `COLETADO` / `DOMINADO`, coroa de dominação, clique em card dominado voltando para apenas coletado e animação arco-íris/glow somente em hover/toque.
- [ ] **Menus Desktop & Mobile:** Abrir menus M3 (`Tipos`, `Temporadas`, `Categorias`) em `>= 768px` e selects nativos + botões circulares de ação em `<= 767px`.
- [ ] **Busca e Persistência:** Digitar rapidamente na barra de busca e imediatamente recarregar a página (`F5` / `Ctrl+R`) para confirmar que `fn_state_search` e filtros/coleção permanecem salvos no reload.
- [ ] **Exportação e Clipboard:** Testar exportação PNG (desktop download e, se possível, iOS/nova aba), `Lista de trocas (texto)`, `Grade de trocas (texto)` (inclusive em iOS/Safari para confirmar preservação do *user gesture*), backup JSON e compartilhamento por URL `?c=`.
- [ ] **Teclado e Gamepad:** Navegar com setas, `Enter` e `D`; conectar e desconectar um controle verificando o HUD inferior direito e os atalhos.
- [ ] **DevTools Performance (Idle):** Gravar 5 segundos na aba *Performance* sem controle conectado e sem interagir na página — confirmar que **não há** callbacks contínuos de `requestAnimationFrame` rodando em repouso.
