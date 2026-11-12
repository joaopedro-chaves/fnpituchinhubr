/* ===================================================
   Constantes de Persistência, Layout e Ordenação
   ===================================================
   Temas e raridades (ordem, rótulos, cores) vivem em taxonomy.js.
   =================================================== */

export { THEME_ORDER, RARITY_ORDER } from './taxonomy.js';

export const KEYS = {
    obtained: 'fn_obtained_sprites',
    mastered: 'fn_mastered_sprites',
    search: 'fn_state_search',
    theme: 'fn_state_theme',
    status: 'fn_state_status_filter',
    hideMastered: 'fn_state_hide_mastered',
    sortOrder: 'fn_state_sort_order',
    showUnreleased: 'fn_state_unreleased',
    lowFidelity: 'fn_state_low_fidelity',
    openExports: 'fn_state_open_exports',
    season: 'fn_state_season',
    lightTheme: 'fn_state_light_theme',
};

export const STATUS_FILTERS = ['all', 'owned', 'missing'];

export const SORT_METHODS = ['theme', 'sprite', 'name', 'rarity'];

export const TRACKER_URL = 'https://joaopedro-chaves.github.io/fnpituchinhubr/';

export const EXPORT_LAYOUT = {
    border: 0,
    sidePad: 24,
    minCanvasW: 420,
    compactHeaderW: 820,
    headerH: 96,
    compactHeaderH: 148,
    colHeaderH: 36,
    cardW: 88,
    cardH: 114,
    rowGap: 12,
    cardGap: 10,
    labelW: 124,
    colGap: 48,
    footerH: 52,
    maxSingleColumnRows: 6,
};

export function getOrderedIndex(order, value) {
    const index = order.indexOf(value);
    return index === -1 ? Infinity : index;
}
