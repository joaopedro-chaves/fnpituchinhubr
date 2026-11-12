# Baseline de Desempenho (Fase 0)

Medido em `HEAD` antes de qualquer alteração no código (`2026-11-12`).

## 1. Métricas de Build e Chunks (`npm run build`)

- **Tempo reportado pelo Vite:** `2.77s`
- **Tempo total do processo (`time -p npm run build`, inclui PWA/Workbox):** `real 6.60s` (`user 9.75s`, `sys 0.85s`)
- **Módulos transformados:** `359`
- **Precache Workbox (`dist/sw.js`):** `322` entradas (`6644.75 KiB`)

| Artefato | Tamanho Bruto | Tamanho Gzip |
| --- | ---: | ---: |
| `dist/index.html` | `1.18 kB` | `0.61 kB` |
| `dist/assets/index-BO4Q3hvc.css` | `34.20 kB` | `7.39 kB` |
| `dist/assets/index-ZHHXRyNL.js` | `347.35 kB` | `98.17 kB` |
| `dist/registerSW.js` | `0.14 kB` | — |
| `dist/manifest.webmanifest` | `0.46 kB` | — |

## 2. Métricas de Testes e Lint (`npm test` / `npm run lint`)

- **`npm run lint`:** `0` erros/avisos.
- **`npm test` (`vitest run` v5.0.5):**
  - `2` arquivos de teste (`src/query.test.js`: 16 testes em `42ms`; `src/share-codec.test.js`: 7 testes em `106ms`)
  - Total: `23` testes aprovados
  - Duração reportada pelo Vitest: `439ms`
  - Tempo total do processo (`time -p npm test`): `real 1.32s` (`user 1.75s`, `sys 0.25s`)

## 3. Lista de Medições Manuais no DevTools (Antes e Depois)

Como este ambiente não executa navegador interativo, registre manualmente em `npm run preview` (produção) os pontos abaixo antes e depois da refatoração:

1. **CPU em repouso (sem controle conectado):**
   - Aba *Performance*: gravar 5 segundos sem interagir. Verificar se há callbacks contínuos de `Animation Frame Fired` (`requestAnimationFrame`) rodando em idle (antes da Fase 2, o loop `pollGamepad` roda em todos os frames).
2. **Digitação na busca (`#searchInput`):**
   - Aba *Performance*: gravar enquanto digita rapidamente uma palavra (ex.: `"peely"`). Observar duração dos frames (*Main* / *Scripting*), re-renderizações de `Header`/`FilterBar`/cards e escritas síncronas em `localStorage`.
3. **Clique/Foco nos cards e navegação por teclado/gamepad:**
   - Aba *Performance* ou *React DevTools Profiler*: medir quantos componentes re-renderizam e o tempo de script ao clicar em um card para coletar/dominar ou ao mover o foco com as setas direcionais.
4. **Exportação de imagem PNG ("Exportar -> Baixar imagem"):**
   - Aba *Performance*: medir o tempo de *Long Task* na main thread durante a geração do canvas e na conversão final (`toDataURL` vs `toBlob`), além do tempo de download de rede ao exportar com filtros ativos.
5. **Network no carregamento inicial:**
   - Aba *Network* (cache desativado): verificar o total de JavaScript transferido no boot, fontes carregadas (`Roboto` vs `Roboto Mono`) e priorização das primeiras imagens vs imagens fora da dobra.
