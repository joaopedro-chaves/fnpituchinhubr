/* ===================================================
   Mapeamento de Imagens Estáticas para o Vite
   ===================================================
   Utiliza `import.meta.glob` do Vite para resolver os caminhos
   de todas as imagens `.webp` da pasta `/sprites/` e `/siteimages/`
   tanto em modo de desenvolvimento (`vite`) quanto em produção (`vite build`).
   =================================================== */

const spriteModules =
    typeof import.meta.glob === 'function'
        ? import.meta.glob('/sprites/*.webp', { eager: true, import: 'default' })
        : {};

const siteImageModules =
    typeof import.meta.glob === 'function'
        ? import.meta.glob('/siteimages/*.webp', { eager: true, import: 'default' })
        : {};

/**
 * Retorna a URL processada pelo Vite para o sprite informado.
 * @param {string} spriteId - ID do sprite (ex.: "water_basic")
 * @returns {string} URL da imagem .webp
 */
export function getSpriteImageUrl(spriteId) {
    if (!spriteId) return '';
    const key = `/sprites/${spriteId}.webp`;
    if (spriteModules[key]) {
        return spriteModules[key];
    }
    return `sprites/${encodeURIComponent(spriteId)}.webp`;
}

/**
 * Retorna a URL do ícone principal da marca (staticsprite.webp).
 * @returns {string} URL da imagem
 */
export function getMascotImageUrl() {
    const key = '/siteimages/staticsprite.webp';
    return siteImageModules[key] || 'siteimages/staticsprite.webp';
}
