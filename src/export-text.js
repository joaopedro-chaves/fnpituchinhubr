import { TRACKER_URL } from './share-order.js';
import {
    getReleasedSprites,
    getCollectionCounts,
    getFamilyKeys,
    getFamilyThemeMap,
    getActiveThemes,
    getExportThemeLabel,
    getTradeThemeLabel,
    getCharNameMap,
    resolveCharName,
} from './query.js';

/**
 * Gera lista textual de trocas agrupada por seção (LOOKING FOR / HAVE / STILL NEED TO MASTER).
 * @param {any} state
 * @param {Array} [sprites]
 * @returns {string}
 */
export function generateTradeText(state, sprites = []) {
    const releasedSprites = getReleasedSprites(sprites, state.filters.season);
    const charKeys = getFamilyKeys(releasedSprites);
    const charNameMap = getCharNameMap(sprites);
    const familyThemeMap = getFamilyThemeMap(releasedSprites);
    const { total, collected, mastered } = getCollectionCounts(releasedSprites, state);
    const obtainedSet = new Set(state?.obtained || []);
    const masteredSet = new Set(state?.mastered || []);

    const buildSection = (title, selectSprites) => {
        const lines = [];

        charKeys.forEach(charKey => {
            const name = resolveCharName(charNameMap, charKey);
            const themeSprites = [...(familyThemeMap.get(charKey)?.values() || [])];
            const selected = selectSprites(themeSprites);
            if (selected.length === 0) return;

            const list = selected.map(sprite => getTradeThemeLabel(sprite.theme)).join(', ');
            lines.push(`  ▸ ${name} ➔ ${list}`);
        });

        return lines.length > 0 ? `【 ${title} 】\n${lines.join('\n')}` : '';
    };

    const sections = [
        buildSection('LOOKING FOR', items => items.filter(sprite => !obtainedSet.has(sprite.id))),
        buildSection('HAVE', items => items.filter(sprite => obtainedSet.has(sprite.id))),
        buildSection('STILL NEED TO MASTER', items =>
            items.filter(sprite => obtainedSet.has(sprite.id) && !masteredSet.has(sprite.id))
        ),
        [
            `Colecionados: ${collected}/${total}`,
            `Dominados: ${mastered}/${total}`,
            `Link do rastreador: ${TRACKER_URL}`,
        ].join('\n'),
    ].filter(Boolean);

    return sections.join('\n\n');
}

/**
 * Gera grade Markdown tabular com o estado de coleção/dominação por família e tema.
 * @param {any} state
 * @param {Array} [sprites]
 * @returns {string}
 */
export function generateTradeGridText(state, sprites = []) {
    const releasedSprites = getReleasedSprites(sprites, state.filters.season);
    const activeThemes = getActiveThemes(releasedSprites);
    const charKeys = getFamilyKeys(releasedSprites);
    const charNameMap = getCharNameMap(sprites);
    const familyThemeMap = getFamilyThemeMap(releasedSprites);
    const { total, collected, mastered } = getCollectionCounts(releasedSprites, state);
    const obtainedSet = new Set(state?.obtained || []);
    const masteredSet = new Set(state?.mastered || []);

    const lines = [
        '```',
        '✅ Tenho  👑 Dominado  ❌ Não tenho',
        '',
        `| ${activeThemes.map(getExportThemeLabel).join(' | ')} | Sprite`,
        '-----------------------',
    ];

    charKeys.forEach(charKey => {
        const familyThemes = familyThemeMap.get(charKey);
        const rowStates = activeThemes.map(theme => {
            const s = familyThemes?.get(theme);
            if (!s) return '⬛';
            if (masteredSet.has(s.id)) return '👑';
            return obtainedSet.has(s.id) ? '✅' : '❌';
        });

        lines.push(`| ${rowStates.join(' | ')} | ${resolveCharName(charNameMap, charKey)}`);
    });

    lines.push(
        '',
        `Colecionados: ${collected}/${total}`,
        `Dominados: ${mastered}/${total}`,
        `Link: ${TRACKER_URL}`,
        '```'
    );

    return lines.join('\n');
}
