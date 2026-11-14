/**
 * @typedef {{
 *   isLight: boolean,
 *   bg: string,
 *   bgGlow: string,
 *   surfaceContainerLow: string,
 *   surfaceContainer: string,
 *   surfaceContainerHigh: string,
 *   surfaceContainerHighest: string,
 *   outlineVariant: string,
 *   border: string,
 *   text: string,
 *   textSoft: string,
 *   textMuted: string,
 *   primary: string,
 *   secondaryContainer: string,
 *   onSecondaryContainer: string,
 *   uiMastered: string,
 *   cardSurface: string,
 *   cardTitleColor: string,
 *   cardSeasonBg: string,
 *   cardSeasonColor: string,
 *   cardBorder: string,
 *   emptyCardBorder: string,
 *   cardShadow: string,
 * }} ExportPalette
 */

/** @type {Readonly<ExportPalette>} */
export const DARK_EXPORT_PALETTE = Object.freeze({
    isLight: false,
    bg: '#141218',
    bgGlow: '#271e3a',
    surfaceContainerLow: '#1d1b20',
    surfaceContainer: '#211f26',
    surfaceContainerHigh: '#2b2930',
    surfaceContainerHighest: '#36343b',
    outlineVariant: '#49454f',
    border: 'rgba(230, 224, 233, 0.12)',
    text: '#e6e0e9',
    textSoft: '#cac4d0',
    textMuted: '#a29cae',
    primary: '#d0bcff',
    secondaryContainer: '#4a4458',
    onSecondaryContainer: '#e8def8',
    uiMastered: '#facc15',
    cardSurface: '#232938',
    cardTitleColor: '#e2e8f0',
    cardSeasonBg: '#9ca3af',
    cardSeasonColor: '#1e2430',
    cardBorder: 'rgba(230, 224, 233, 0.14)',
    emptyCardBorder: 'rgba(230, 224, 233, 0.2)',
    cardShadow: 'rgba(0, 0, 0, 0.35)',
});

/** @type {Readonly<ExportPalette>} */
export const LIGHT_EXPORT_PALETTE = Object.freeze({
    isLight: true,
    bg: '#fef7ff',
    bgGlow: '#efe5ff',
    surfaceContainerLow: '#f7f2fa',
    surfaceContainer: '#f3edf7',
    surfaceContainerHigh: '#ece6f0',
    surfaceContainerHighest: '#e6e0e9',
    outlineVariant: '#cac4d0',
    border: 'rgba(29, 27, 32, 0.12)',
    text: '#1d1b20',
    textSoft: '#49454f',
    textMuted: '#5d5766',
    primary: '#6750a4',
    secondaryContainer: '#e8def8',
    onSecondaryContainer: '#1d192b',
    uiMastered: '#9a5b00',
    cardSurface: '#ffffff',
    cardTitleColor: '#1d1b20',
    cardSeasonBg: '#e8def8',
    cardSeasonColor: '#1d192b',
    cardBorder: '#cac4d0',
    emptyCardBorder: 'rgba(29, 27, 32, 0.24)',
    cardShadow: 'rgba(29, 27, 32, 0.16)',
});

const CSS_TOKEN_MAP = {
    bg: '--bg',
    bgGlow: '--bg-glow',
    surfaceContainerLow: '--surface-container-low',
    surfaceContainer: '--surface-container',
    surfaceContainerHigh: '--surface-container-high',
    surfaceContainerHighest: '--surface-container-highest',
    outlineVariant: '--outline-variant',
    border: '--border',
    text: '--text',
    textSoft: '--text-soft',
    textMuted: '--text-muted',
    primary: '--primary',
    secondaryContainer: '--secondary-container',
    onSecondaryContainer: '--on-secondary-container',
    uiMastered: '--ui-mastered',
    cardSurface: '--card-surface',
    cardTitleColor: '--card-title-color',
    cardSeasonBg: '--card-season-bg',
    cardSeasonColor: '--card-season-color',
};

/**
 * Retorna a paleta MD3 usada na exportação em Canvas.
 * Quando o DOM ativo coincide com `lightTheme`, lê tokens computados do `:root`
 * mantendo fallback estático para ambientes sem folha de estilos carregada.
 * @param {boolean} [lightTheme]
 * @returns {Readonly<ExportPalette>}
 */
export function getExportThemePalette(lightTheme = false) {
    const fallback = lightTheme ? LIGHT_EXPORT_PALETTE : DARK_EXPORT_PALETTE;
    if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') {
        return fallback;
    }

    const root = document.documentElement;
    const isDomLight = root.dataset?.theme === 'light';
    if (Boolean(lightTheme) !== isDomLight) {
        return fallback;
    }

    const styles = getComputedStyle(root);
    /** @type {Record<string, any>} */
    const resolved = { ...fallback };
    for (const [paletteKey, cssVar] of Object.entries(CSS_TOKEN_MAP)) {
        const value = styles.getPropertyValue(cssVar).trim();
        if (value) {
            resolved[paletteKey] = value;
        }
    }
    return /** @type {Readonly<ExportPalette>} */ (resolved);
}
