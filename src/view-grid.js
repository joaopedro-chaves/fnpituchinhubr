/* ===================================================
   Grid View & Card Rendering
   =================================================== */

import { CROWN_ICON } from './share-order.js';
import { escapeHTML } from './dom-utils.js';
import {
    getReleasedSprites,
    getCollectionCounts,
    getActiveThemes,
    getUiThemeLabel,
    getSeasonData,
    filterSprites,
    sortSprites,
    isObtained,
    isMastered,
} from './query.js';

export function updateProgress(dom, state, sprites = (typeof baseSprites !== 'undefined' ? baseSprites : [])) {
    const releasedSprites = getReleasedSprites(sprites, state.filters.season);
    const { total, collected, mastered } = getCollectionCounts(releasedSprites, state);

    if (dom.collectionRatio) dom.collectionRatio.textContent = `${collected} / ${total}`;
    if (dom.collectionFill) dom.collectionFill.style.width = total > 0 ? `${(collected / total) * 100}%` : '0%';
    if (dom.masteryRatio) dom.masteryRatio.textContent = `${mastered} / ${total}`;
    if (dom.masteryFill) dom.masteryFill.style.width = total > 0 ? `${(mastered / total) * 100}%` : '0%';
}

export function populateThemeFilter(dom, state, sprites = (typeof baseSprites !== 'undefined' ? baseSprites : [])) {
    if (!dom.themeFilter) return;
    const themes = getActiveThemes(sprites);
    const selectedTheme = themes.includes(state.filters.theme) ? state.filters.theme : 'all';

    dom.themeFilter.replaceChildren(
        new Option('Todos', 'all'),
        ...themes.map(theme => new Option(getUiThemeLabel(theme), theme))
    );
    state.filters.theme = selectedTheme;
}

export function buildCardHTML(sprite, obtained, mastered, viewMode = false) {
    const rarityLabel = sprite.rarity === 'Mythic' ? 'MYTHIC' : sprite.rarity.toUpperCase();
    const imgPath = `sprites/${encodeURIComponent(sprite.id)}.webp`;
    const safeName = escapeHTML(sprite.name);
    const safeRarity = escapeHTML(rarityLabel);
    const seasonData = getSeasonData(sprite.season);
    const safeSeasonName = escapeHTML(seasonData.name);

    let badge = '';
    if (sprite.unreleased) {
        badge = '<div class="card-badge unreleased-badge">Não lançado</div>';
    } else if (mastered) {
        badge = '<div class="card-badge mastered-badge">Dominado</div>';
    } else if (obtained) {
        badge = '<div class="card-badge collected">Coletado</div>';
    }

    let crownAction = '';
    if (obtained && !mastered && !viewMode) {
        crownAction = `<button class="card-crown" type="button" title="Toggle mastery" aria-label="Mark ${safeName} as mastered">${CROWN_ICON}</button>`;
    }

    let crownDisplay = '';
    if (mastered) {
        crownDisplay = `<div class="card-crown-display">${CROWN_ICON}</div>`;
    }

    return `${badge}${crownAction}
        <div class="card-display">
            ${crownDisplay}
            <img src="${imgPath}" alt="${safeName}" loading="lazy">
            <div class="card-tags">
                <div class="card-rarity">${safeRarity}</div>
                <div class="card-season">${safeSeasonName}</div>
            </div>
        </div>
        <div class="card-name"><span>${safeName}</span></div>`;
}

export function fitCardNames(gridEl) {
    if (!gridEl) return;
    gridEl.querySelectorAll('.card-name').forEach(cardName => {
        const span = cardName.querySelector('span');
        if (!span || cardName.clientWidth === 0) return;
        const maxH = cardName.clientHeight - 4;
        let size = 12;
        span.style.fontSize = size + 'px';
        while ((span.scrollHeight > maxH || span.scrollWidth > cardName.clientWidth - 4) && size > 9) {
            size -= 0.5;
            span.style.fontSize = size + 'px';
        }
    });
}

export function renderGrid(dom, state, sprites = (typeof baseSprites !== 'undefined' ? baseSprites : [])) {
    if (!dom.grid) return;
    let items = filterSprites(sprites, state);
    items = sortSprites(items, state.settings.sortOrder);

    const frag = document.createDocumentFragment();

    for (const sprite of items) {
        const obtained = isObtained(state, sprite.id);
        const mastered = isMastered(state, sprite.id);

        const card = document.createElement('div');
        card.dataset.id = sprite.id;
        card.dataset.name = sprite.name;

        const themeClass = `theme-${sprite.theme.replace(/\s+/g, '-')}`;
        const classes = ['card', `rarity-${sprite.rarity}`, themeClass];
        if (obtained) classes.push('obtained');
        if (mastered) classes.push('mastered');
        card.className = classes.join(' ');
        if (!state.viewMode) {
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-pressed', String(obtained));
            card.setAttribute(
                'aria-label',
                `${obtained ? 'Remove' : 'Mark'} ${sprite.name} ${obtained ? 'from' : 'as part of'} your collection`
            );
        }

        card.innerHTML = buildCardHTML(sprite, obtained, mastered, state.viewMode);
        frag.appendChild(card);
    }

    dom.grid.innerHTML = '';
    dom.grid.appendChild(frag);
    fitCardNames(dom.grid);
    updateProgress(dom, state, sprites);
}

export function updateCardDOM(cardEl, spriteName, isObtainedState, isMasteredState) {
    if (!cardEl) return;
    cardEl.classList.toggle('obtained', isObtainedState);
    cardEl.classList.toggle('mastered', isMasteredState);
    cardEl.setAttribute('aria-pressed', String(isObtainedState));
    const name = spriteName || cardEl.dataset?.name || cardEl.querySelector('.card-name span')?.textContent || '';
    cardEl.setAttribute(
        'aria-label',
        `${isObtainedState ? 'Remove' : 'Mark'} ${name} ${isObtainedState ? 'from' : 'as part of'} your collection`
    );
}

export function handleToggleObtained(id, state, dom, callbacks = {}) {
    const isNowObtained = !isObtained(state, id);
    if (isNowObtained) {
        state.obtained.push(id);
    } else {
        state.obtained = state.obtained.filter(x => x !== id);
        state.mastered = state.mastered.filter(x => x !== id);
    }

    if (callbacks.persist) callbacks.persist();

    // Se o filtro ativo ocultar não-obtidos, precisamos reordenar/filtrar a grade inteira
    const requiresFullRerender = state.filters?.status !== 'all' || state.settings?.hideMastered;

    if (requiresFullRerender && callbacks.renderFullGrid) {
        callbacks.renderFullGrid();
    } else {
        const card = dom?.grid?.querySelector(`[data-id="${CSS.escape(id)}"]`);
        if (card) {
            updateCardDOM(card, card.dataset?.name, isObtained(state, id), isMastered(state, id));
        }
        if (callbacks.updateStats) callbacks.updateStats();
    }
}