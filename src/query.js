/* ===================================================
   Sprite Querying, Filtering & Sorting
   =================================================== */

import { THEME_ORDER, RARITY_ORDER, getOrderedIndex } from './share-order.js';
import { THEME, RARITIES } from './taxonomy.js';

const defaultCollator = new Intl.Collator();

export function getFamilyKey(sprite) {
    return sprite.id.split('_')[0];
}

export function getSpriteIdSet(sprites = []) {
    return new Set(sprites.map(sprite => sprite.id));
}

const SEASON_CODE_RE = /^C\d+T\d+$/i;

export function isKnownSeason(season) {
    return typeof season === 'string' && SEASON_CODE_RE.test(season.trim());
}

export function getSeasonData(season) {
    const normalized = typeof season === 'string' ? season.trim() : '';
    if (SEASON_CODE_RE.test(normalized)) {
        return { name: normalized.toUpperCase() };
    }
    return { name: 'none' };
}

/**
 * Retorna temporadas distintas presentes nos dados em ordem cronológica.
 * @param {Array} sprites
 * @returns {string[]}
 */
export function getActiveSeasons(sprites = []) {
    const seen = new Set();
    for (const s of sprites) {
        if (isKnownSeason(s?.season)) {
            seen.add(s.season.trim().toUpperCase());
        }
    }
    return Array.from(seen).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
}

export function getReleasedSprites(
    sprites = [],
    seasonFilter = 'all'
) {
    return sprites.filter(sprite => {
        if (sprite.unreleased) return false;
        if (seasonFilter !== 'all' && (sprite.season || 'none') !== seasonFilter) return false;
        return true;
    });
}

export function getFamilyKeys(sprites) {
    const seen = new Set();
    const keys = [];
    for (const sprite of sprites) {
        const key = getFamilyKey(sprite);
        if (!seen.has(key)) {
            seen.add(key);
            keys.push(key);
        }
    }
    return keys;
}

export function getActiveThemes(sprites) {
    const seen = new Set();
    for (const sprite of sprites) {
        seen.add(sprite.theme);
    }
    return [...seen].sort(
        (a, b) => getOrderedIndex(THEME_ORDER, a) - getOrderedIndex(THEME_ORDER, b)
    );
}

export function getCharName(charKey, sprites = []) {
    const basicSprite = sprites.find(sprite => sprite.id === `${charKey}_basic`);
    return basicSprite ? basicSprite.name : charKey.charAt(0).toUpperCase() + charKey.slice(1);
}

export function getDisplayName(name) {
    return name === 'Burnt Peanut' ? name : `${name} Sprite`;
}

export function getUiThemeLabel(theme) {
    return theme;
}

export function getExportThemeLabel(theme) {
    return THEME[theme]?.exportLabel || theme.toUpperCase();
}

export function getTradeThemeLabel(theme) {
    return THEME[theme]?.tradeLabel || theme;
}

/**
 * Valida os dados de sprites e devolve uma lista de problemas legíveis.
 * Sprites lançados precisam de nome, tema e raridade conhecidos
 * (sprites `unreleased` podem ser placeholders incompletos).
 */
export function getSpriteDataIssues(sprites) {
    const issues = [];
    const seen = new Set();

    sprites.forEach(sprite => {
        if (!sprite.id) {
            issues.push('Sprite sem id');
            return;
        }
        if (seen.has(sprite.id)) {
            issues.push(`${sprite.id}: id duplicado`);
        }
        seen.add(sprite.id);

        if (sprite.unreleased) return;
        if (!sprite.name) issues.push(`${sprite.id}: nome vazio`);
        if (!THEME[sprite.theme]) issues.push(`${sprite.id}: tema desconhecido "${sprite.theme}"`);
        if (!RARITIES[sprite.rarity]) issues.push(`${sprite.id}: raridade desconhecida "${sprite.rarity}"`);
    });

    return issues;
}

export function isObtained(state, id) {
    return (state?.obtained || []).includes(id);
}

export function isMastered(state, id) {
    return (state?.mastered || []).includes(id);
}

export function getCollectionCounts(sprites, state) {
    const obtainedSet = new Set(state?.obtained || []);
    const masteredSet = new Set(state?.mastered || []);
    let collected = 0;
    let mastered = 0;

    for (const sprite of sprites) {
        if (obtainedSet.has(sprite.id)) collected += 1;
        if (masteredSet.has(sprite.id)) mastered += 1;
    }

    return {
        total: sprites.length,
        collected,
        mastered,
    };
}

export function getFamilyThemeMap(sprites) {
    return sprites.reduce((map, sprite) => {
        const familyKey = getFamilyKey(sprite);
        if (!map.has(familyKey)) map.set(familyKey, new Map());
        map.get(familyKey).set(sprite.theme, sprite);
        return map;
    }, new Map());
}

export function uniqueValidIds(ids, validIds) {
    return [...new Set(ids)].filter(id => validIds.has(id));
}

export function filterSprites(sprites, state) {
    const search = state.filters.search.trim().toLowerCase();
    const obtainedSet = new Set(state?.obtained || []);
    const masteredSet = new Set(state?.mastered || []);

    return sprites.filter(sprite => {
        if (state.settings.hideMastered && masteredSet.has(sprite.id)) return false;
        if (!state.settings.showUnreleased && sprite.unreleased) return false;
        if (state.viewMode && (!obtainedSet.has(sprite.id) || sprite.unreleased)) return false;

        const matchesSearch = !search || sprite.name.toLowerCase().includes(search);
        const matchesTheme = state.filters.theme === 'all' || sprite.theme === state.filters.theme;
        const matchesSeason = state.filters.season === 'all' || (sprite.season || 'none') === state.filters.season;

        let matchesStatus = true;
        if (!state.viewMode) {
            const isOwned = obtainedSet.has(sprite.id);
            if (state.filters.status === 'owned') matchesStatus = isOwned;
            if (state.filters.status === 'missing') matchesStatus = !isOwned;
        }

        return matchesSearch && matchesTheme && matchesSeason && matchesStatus;
    });
}

export function sortSprites(items, method) {
    const sorted = [...items];
    if (method === 'theme') {
        return sorted.sort((a, b) => {
            const idxA = getOrderedIndex(THEME_ORDER, a.theme);
            const idxB = getOrderedIndex(THEME_ORDER, b.theme);
            if (idxA !== idxB) return idxA - idxB;
            return 0;
        });
    }
    if (method === 'sprite') {
        return sorted.sort((a, b) => {
            const familyA = getFamilyKey(a);
            const familyB = getFamilyKey(b);
            if (familyA !== familyB) return defaultCollator.compare(familyA, familyB);
            return getOrderedIndex(THEME_ORDER, a.theme) - getOrderedIndex(THEME_ORDER, b.theme);
        });
    }
    if (method === 'name') {
        return sorted.sort((a, b) => defaultCollator.compare(a.name, b.name));
    }
    if (method === 'rarity') {
        return sorted.sort((a, b) => {
            const idxA = getOrderedIndex(RARITY_ORDER, a.rarity);
            const idxB = getOrderedIndex(RARITY_ORDER, b.rarity);
            if (idxA !== idxB) return idxA - idxB;
            return defaultCollator.compare(a.name, b.name);
        });
    }
    return sorted;
}
