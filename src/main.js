/* ===================================================
   Main Application Entry & Controller
   =================================================== */

import { KEYS, STATUS_FILTERS, SORT_METHODS } from './share-order.js';
import { toast, isIOS, setDropdownOpen, closeDropdowns, copyText } from './dom-utils.js';
import { compressCollection, decompressCollection } from './share-codec.js';
import { getSpriteIdSet, uniqueValidIds, isObtained, isMastered } from './query.js';
import { renderGrid, populateThemeFilter } from './view-grid.js';
import { exportImage, generateTradeText, generateTradeGridText } from './view-export.js';

/* ===================================================
   State
   =================================================== */

export const state = {
    obtained: [],
    mastered: [],
    viewMode: false,
    filters: { search: '', theme: 'all', season: 'all', status: 'all' },
    settings: {
        hideMastered: false,
        sortOrder: 'theme',
        showUnreleased: false,
        lowFidelity: false,
        openExports: false,
    },
};

/* ===================================================
   DOM References
   =================================================== */

export const dom = {
    viewBanner: document.getElementById('viewBanner'),
    grid: document.getElementById('spriteGrid'),
    searchInput: document.getElementById('searchInput'),
    themeFilter: document.getElementById('themeFilter'),
    sortOrder: document.getElementById('sortOrder'),
    statusPills: document.getElementById('statusPills'),
    hideMastered: document.getElementById('hideMastered'),
    showUnreleased: document.getElementById('showUnreleased'),
    lowFidelity: document.getElementById('lowFidelity'),
    seasonFilter: document.getElementById('seasonFilter'),
    openExports: document.getElementById('openExports'),
    exportModeSwitch: document.getElementById('exportModeSwitch'),
    exportDropdown: document.getElementById('exportDropdown'),
    exportToggle: document.getElementById('exportToggle'),
    settingsDropdown: document.getElementById('settingsDropdown'),
    settingsToggle: document.getElementById('settingsToggle'),
    shareBtn: document.getElementById('shareBtn'),
    copyTradeTextBtn: document.getElementById('copyTradeTextBtn'),
    copyTradeGridBtn: document.getElementById('copyTradeGridBtn'),
    collectionRatio: document.getElementById('collectionRatio'),
    collectionFill: document.getElementById('collectionFill'),
    masteryRatio: document.getElementById('masteryRatio'),
    masteryFill: document.getElementById('masteryFill'),
    exportBackupBtn: document.getElementById('exportBackupBtn'),
    importBtn: document.getElementById('importBtn'),
    importInput: document.getElementById('importInput'),
};

/* ===================================================
   Persistence
   =================================================== */

export function persist(key, value) {
    try {
        localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    } catch (err) {
        console.warn('Unable to save tracker state.', err);
    }
}

export function readStoredArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

export function saveCollection() {
    persist(KEYS.obtained, state.obtained);
    persist(KEYS.mastered, state.mastered);
}

export function load(sprites = (typeof baseSprites !== 'undefined' ? baseSprites : [])) {
    const validIds = getSpriteIdSet(sprites);
    state.obtained = uniqueValidIds(readStoredArray(KEYS.obtained), validIds);
    state.mastered = uniqueValidIds(readStoredArray(KEYS.mastered), validIds).filter(id =>
        state.obtained.includes(id)
    );
    state.filters.search = localStorage.getItem(KEYS.search) || '';
    state.filters.theme = localStorage.getItem(KEYS.theme) || 'all';
    state.filters.season = localStorage.getItem(KEYS.season) || 'all';

    let savedStatus = localStorage.getItem(KEYS.status) || 'all';
    if (savedStatus === 'obtained') savedStatus = 'owned';
    state.filters.status = STATUS_FILTERS.includes(savedStatus) ? savedStatus : 'all';

    state.settings.hideMastered = localStorage.getItem(KEYS.hideMastered) === 'true';

    let savedSort = localStorage.getItem(KEYS.sortOrder);
    if (!savedSort) {
        const legacyGroup = localStorage.getItem('fn_state_group_theme');
        savedSort = legacyGroup === 'false' ? 'sprite' : 'theme';
    }
    state.settings.sortOrder = SORT_METHODS.includes(savedSort) ? savedSort : 'theme';

    state.settings.showUnreleased = localStorage.getItem(KEYS.showUnreleased) === 'true';
    state.settings.lowFidelity = localStorage.getItem(KEYS.lowFidelity) === 'true';
    state.settings.openExports = localStorage.getItem(KEYS.openExports) === 'true';
}

export function applyStateToDOM() {
    if (dom.searchInput) dom.searchInput.value = state.filters.search;
    if (dom.themeFilter) dom.themeFilter.value = state.filters.theme;
    if (dom.seasonFilter) dom.seasonFilter.value = state.filters.season;
    if (dom.sortOrder) dom.sortOrder.value = state.settings.sortOrder;
    if (dom.hideMastered) dom.hideMastered.checked = state.settings.hideMastered;
    if (dom.showUnreleased) dom.showUnreleased.checked = state.settings.showUnreleased;
    if (dom.lowFidelity) dom.lowFidelity.checked = state.settings.lowFidelity;
    document.body.classList.toggle('low-fidelity', state.settings.lowFidelity);

    if (isIOS()) {
        if (dom.exportModeSwitch) dom.exportModeSwitch.hidden = true;
    } else if (dom.openExports) {
        dom.openExports.checked = state.settings.openExports;
    }

    if (dom.statusPills) {
        dom.statusPills.querySelectorAll('.pill').forEach(pill => {
            const match =
                (pill.dataset.status === 'all' && state.filters.status === 'all') ||
                (pill.dataset.status === 'owned' && state.filters.status === 'owned') ||
                (pill.dataset.status === 'missing' && state.filters.status === 'missing');
            pill.classList.toggle('active', match);
            pill.setAttribute('aria-pressed', String(match));
        });
    }
}

/* ===================================================
   Collection Actions
   =================================================== */

export function toggleObtained(id, sprites = (typeof baseSprites !== 'undefined' ? baseSprites : [])) {
    if (isObtained(state, id)) {
        state.obtained = state.obtained.filter(x => x !== id);
        state.mastered = state.mastered.filter(x => x !== id);
    } else {
        state.obtained.push(id);
    }
    saveCollection();
    renderGrid(dom, state, sprites);
}

export function toggleMastery(id, sprites = (typeof baseSprites !== 'undefined' ? baseSprites : [])) {
    if (!isObtained(state, id)) return;
    if (isMastered(state, id)) {
        state.mastered = state.mastered.filter(x => x !== id);
    } else {
        state.mastered.push(id);
    }
    saveCollection();
    renderGrid(dom, state, sprites);
}

/* ===================================================
   Event Binding
   =================================================== */

export function bindEvents(sprites = (typeof baseSprites !== 'undefined' ? baseSprites : [])) {
    if (!dom.grid) return;

    /* Image error delegation (using capture phase since error does not bubble) */
    dom.grid.addEventListener(
        'error',
        e => {
            if (e.target.tagName === 'IMG') {
                e.target.style.opacity = '0.2';
            }
        },
        true
    );

    /* Grid - event delegation */
    dom.grid.addEventListener('click', e => {
        if (state.viewMode) return;
        const crown = e.target.closest('.card-crown');
        const card = e.target.closest('.card');
        if (!card) return;

        const id = card.dataset.id;
        if (crown) {
            e.stopPropagation();
            toggleMastery(id, sprites);
        } else {
            toggleObtained(id, sprites);
        }
    });

    dom.grid.addEventListener('keydown', e => {
        if (state.viewMode || e.target.closest('.card-crown')) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;

        const card = e.target.closest('.card');
        if (!card) return;

        e.preventDefault();
        toggleObtained(card.dataset.id, sprites);
    });

    /* Search */
    if (dom.searchInput) {
        dom.searchInput.addEventListener('input', () => {
            state.filters.search = dom.searchInput.value;
            persist(KEYS.search, state.filters.search);
            renderGrid(dom, state, sprites);
        });
    }

    /* Theme filter */
    if (dom.themeFilter) {
        dom.themeFilter.addEventListener('change', () => {
            state.filters.theme = dom.themeFilter.value;
            persist(KEYS.theme, state.filters.theme);
            renderGrid(dom, state, sprites);
        });
    }

    /* Season filter */
    if (dom.seasonFilter) {
        dom.seasonFilter.addEventListener('change', () => {
            state.filters.season = dom.seasonFilter.value;
            persist(KEYS.season, state.filters.season);
            renderGrid(dom, state, sprites);
        });
    }

    /* Sort order dropdown */
    if (dom.sortOrder) {
        dom.sortOrder.addEventListener('change', () => {
            state.settings.sortOrder = dom.sortOrder.value;
            persist(KEYS.sortOrder, state.settings.sortOrder);
            renderGrid(dom, state, sprites);
        });
    }

    /* Status pills */
    if (dom.statusPills) {
        dom.statusPills.addEventListener('click', e => {
            const pill = e.target.closest('.pill');
            if (!pill || state.viewMode) return;
            state.filters.status = pill.dataset.status;
            persist(KEYS.status, state.filters.status);
            applyStateToDOM();
            renderGrid(dom, state, sprites);
        });
    }

    /* Toggle switches */
    const switchKeys = ['hideMastered', 'showUnreleased', 'lowFidelity', 'openExports'];
    switchKeys.forEach(key => {
        if (!dom[key]) return;
        dom[key].addEventListener('change', () => {
            state.settings[key] = dom[key].checked;
            persist(KEYS[key], state.settings[key]);
            if (key === 'lowFidelity') {
                document.body.classList.toggle('low-fidelity', dom[key].checked);
            }
            if (key !== 'openExports') {
                renderGrid(dom, state, sprites);
            }
        });
    });

    /* Export dropdown (handles images, copy trades, backup, import) */
    if (dom.exportToggle && dom.exportDropdown) {
        dom.exportToggle.addEventListener('click', e => {
            e.stopPropagation();
            setDropdownOpen(dom.settingsDropdown, dom.settingsToggle, false);
            setDropdownOpen(dom.exportDropdown, dom.exportToggle, !dom.exportDropdown.classList.contains('open'));
        });

        dom.exportDropdown.querySelectorAll('[data-export]').forEach(btn => {
            btn.addEventListener('click', () => {
                exportImage(btn.dataset.export, state, sprites);
                setDropdownOpen(dom.exportDropdown, dom.exportToggle, false);
            });
        });
    }

    /* Settings dropdown */
    if (dom.settingsToggle && dom.settingsDropdown) {
        dom.settingsToggle.addEventListener('click', e => {
            e.stopPropagation();
            setDropdownOpen(dom.exportDropdown, dom.exportToggle, false);
            setDropdownOpen(
                dom.settingsDropdown,
                dom.settingsToggle,
                !dom.settingsDropdown.classList.contains('open')
            );
        });

        const menu = dom.settingsDropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.addEventListener('click', e => {
                e.stopPropagation();
            });
        }
    }

    document.addEventListener('click', e => {
        if (dom.exportDropdown && !dom.exportDropdown.contains(e.target)) {
            setDropdownOpen(dom.exportDropdown, dom.exportToggle, false);
        }
        if (dom.settingsDropdown && !dom.settingsDropdown.contains(e.target)) {
            setDropdownOpen(dom.settingsDropdown, dom.settingsToggle, false);
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeDropdowns(dom);
    });

    /* Backup Export */
    if (dom.exportBackupBtn) {
        dom.exportBackupBtn.addEventListener('click', () => {
            const data = {
                obtained: state.obtained,
                mastered: state.mastered,
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'fnsprites-backup.json';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            toast('Backup exportado com sucesso!', 'success');
            setDropdownOpen(dom.exportDropdown, dom.exportToggle, false);
        });
    }

    /* Backup Import */
    if (dom.importBtn && dom.importInput) {
        dom.importBtn.addEventListener('click', () => {
            if (state.viewMode) {
                toast('Não é possível importar no modo somente leitura!', 'error');
                return;
            }
            dom.importInput.click();
            setDropdownOpen(dom.exportDropdown, dom.exportToggle, false);
        });

        dom.importInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data || !Array.isArray(data.obtained) || !Array.isArray(data.mastered)) {
                        throw new Error('Invalid backup file format');
                    }

                    const validIds = getSpriteIdSet(sprites);
                    const obtained = uniqueValidIds(data.obtained, validIds);
                    const obtainedIds = new Set(obtained);
                    const mastered = uniqueValidIds(data.mastered, validIds).filter(id =>
                        obtainedIds.has(id)
                    );

                    state.obtained = obtained;
                    state.mastered = mastered;

                    saveCollection();
                    renderGrid(dom, state, sprites);
                    toast('Coleção importada com sucesso!', 'success');
                } catch (err) {
                    toast('Falha ao importar: formato JSON inválido', 'error');
                    console.error(err);
                }
                dom.importInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    /* Copy trade list */
    if (dom.copyTradeTextBtn) {
        dom.copyTradeTextBtn.addEventListener('click', () => {
            copyText(
                generateTradeText(state, sprites),
                'Lista de trocas copiada para a área de transferência!',
                'Falha ao copiar lista de trocas'
            );
            setDropdownOpen(dom.exportDropdown, dom.exportToggle, false);
        });
    }

    /* Copy trade grid */
    if (dom.copyTradeGridBtn) {
        dom.copyTradeGridBtn.addEventListener('click', () => {
            copyText(
                generateTradeGridText(state, sprites),
                'Grelha de trocas copiada para a área de transferência!',
                'Falha ao copiar grelha de trocas'
            );
            setDropdownOpen(dom.exportDropdown, dom.exportToggle, false);
        });
    }

    /* Share */
    if (dom.shareBtn) {
        dom.shareBtn.addEventListener('click', () => {
            const code = compressCollection(sprites, state.obtained, state.mastered);
            const url = `${location.origin}${location.pathname}?c=${code}`;
            copyText(url, 'Link compartilhado!', 'Falha ao compartilhar');
        });
    }
}

/* ===================================================
   Initialization
   =================================================== */

export function updateCodesNotification() {
    const dot = document.getElementById('codesNotification');
    if (!dot) return;
    if (typeof baseCodes === 'undefined') {
        dot.hidden = true;
        return;
    }
    try {
        const redeemed = JSON.parse(localStorage.getItem('fn_redeemed_codes')) || [];
        const hasUnredeemed = baseCodes.some(c => c.active !== false && !redeemed.includes(c.code));
        dot.hidden = !hasUnredeemed;
    } catch {
        dot.hidden = true;
    }
}

export function init() {
    const sprites = typeof baseSprites !== 'undefined' ? baseSprites : [];
    if (!sprites || sprites.length === 0) {
        console.error('baseSprites is not defined.');
        return;
    }

    const params = new URLSearchParams(location.search);
    const shareCode = params.get('c');

    if (shareCode) {
        state.viewMode = true;
        const decoded = decompressCollection(sprites, shareCode);
        state.obtained = decoded.obtained;
        state.mastered = decoded.mastered;
        if (dom.viewBanner) dom.viewBanner.hidden = false;
    } else {
        load(sprites);
    }

    populateThemeFilter(dom, state, sprites);
    applyStateToDOM();
    renderGrid(dom, state, sprites);
    bindEvents(sprites);
    updateCodesNotification();

    window.addEventListener('storage', updateCodesNotification);
    window.addEventListener('focus', updateCodesNotification);
}
