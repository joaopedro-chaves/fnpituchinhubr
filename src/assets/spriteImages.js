/* ===================================================
   Mapeamento de Imagens Estáticas para o Vite
   ===================================================
   Utiliza `import.meta.glob` do Vite para resolver os caminhos
   de todas as imagens `.webp` da pasta `/sprites/` e `/siteimages/`
   tanto em modo de desenvolvimento (`vite`) quanto em produção (`vite build`).
   =================================================== */

const spriteModules = import.meta.glob('/sprites/*.webp', { eager: true, import: 'default' });
const FALLBACK_SPRITE_KEY = '/sprites/sprite_unreal.webp';

/**
 * Retorna a URL processada pelo Vite para o sprite informado.
 * Se a imagem específica ainda não existir no diretório `/sprites/`,
 * retorna automaticamente a imagem padrão `sprite_unreal.webp`.
 * @param {string} spriteId - ID do sprite (ex.: "water_basic")
 * @returns {string} URL da imagem .webp
 */
export function getSpriteImageUrl(spriteId) {
    if (!spriteId) return '';
    const key = `/sprites/${spriteId}.webp`;
    if (spriteModules[key]) {
        return spriteModules[key];
    }
    return spriteModules[FALLBACK_SPRITE_KEY] || 'sprites/sprite_unreal.webp';
}

/**
 * Retorna a URL do ícone principal da marca (favicon.webp).
 * @returns {string} URL da imagem
 */
export function getMascotImageUrl() {
    return 'favicon.webp';
}
