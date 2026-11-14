// @vitest-environment jsdom
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { useTrackerState } from './hooks/useTrackerState.js';
import { baseSprites } from './data/sprites-data.js';
import { KEYS } from './share-order.js';
import { toast, copyText } from './dom-utils.js';

/** @param {ParentNode} root @param {string} selector */
function mustQuery(root, selector) {
    const el = root.querySelector(selector);
    if (!el) throw new Error(`Elemento esperado não encontrado: ${selector}`);
    return /** @type {HTMLElement} */ (el);
}

/** @param {string} key */
function readJsonStorage(key) {
    const raw = localStorage.getItem(key);
    if (raw === null) throw new Error(`Chave ausente no localStorage: ${key}`);
    return JSON.parse(raw);
}

describe('useTrackerState (persistência incremental, debounce e tema claro/escuro)', () => {
    beforeEach(() => {
        localStorage.clear();
        window.history.replaceState({}, '', '/');
        delete document.documentElement.dataset.theme;
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        window.history.replaceState({}, '', '/');
        document.getElementById('toastContainer')?.remove();
        delete document.documentElement.dataset.theme;
        cleanup();
    });

    it('não grava no localStorage na montagem inicial e grava apenas a chave modificada', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        const { container } = render(createElement(CatalogPage));

        expect(setItemSpy).not.toHaveBeenCalled();

        const firstCard = mustQuery(container, '.card[data-id]');
        fireEvent.click(mustQuery(firstCard, '.card-primary'));

        expect(setItemSpy).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(KEYS.obtained, JSON.stringify([firstCard.dataset.id]));

        setItemSpy.mockClear();
        const crownBtn = mustQuery(firstCard, '.card-crown');
        fireEvent.click(crownBtn);

        expect(setItemSpy).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(KEYS.mastered, JSON.stringify([firstCard.dataset.id]));

        setItemSpy.mockRestore();
    });

    it('faz debounce de ~200ms na busca e faz flush imediato em pagehide sem perder dados', () => {
        vi.useFakeTimers();
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        const { container } = render(createElement(CatalogPage));

        const searchInput = mustQuery(container, '#searchInput');
        fireEvent.change(searchInput, { target: { value: 'fogo' } });

        // Antes dos 200ms ainda não persistiu
        expect(setItemSpy).not.toHaveBeenCalledWith(KEYS.search, 'fogo');

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(setItemSpy).toHaveBeenCalledWith(KEYS.search, 'fogo');

        // Digitação seguida de pagehide imediato (<200ms) deve persistir na hora
        setItemSpy.mockClear();
        fireEvent.change(searchInput, { target: { value: 'agua' } });
        expect(setItemSpy).not.toHaveBeenCalled();

        act(() => {
            window.dispatchEvent(new Event('pagehide'));
        });
        expect(setItemSpy).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(KEYS.search, 'agua');

        setItemSpy.mockRestore();
    });

    it('usa tema escuro por padrão e alterna para tema claro pelo switch nas configurações', async () => {
        const { container } = render(createElement(CatalogPage));
        expect(document.documentElement.dataset.theme).toBeUndefined();

        fireEvent.click(mustQuery(container, '#settingsToggle'));
        const themeSwitch = /** @type {HTMLInputElement} */ (
            await waitFor(() => {
                const el = container.querySelector('#lightTheme');
                expect(el).not.toBeNull();
                return el;
            })
        );

        expect(themeSwitch.checked).toBe(false);

        fireEvent.click(themeSwitch);
        expect(themeSwitch.checked).toBe(true);
        expect(document.documentElement.dataset.theme).toBe('light');
        expect(localStorage.getItem(KEYS.lightTheme)).toBe('true');

        fireEvent.click(themeSwitch);
        expect(themeSwitch.checked).toBe(false);
        expect(document.documentElement.dataset.theme).toBeUndefined();
        expect(localStorage.getItem(KEYS.lightTheme)).toBe('false');
    });

    it('sinaliza erro amigável em ?c= vazio sem sobrescrever coleção local', () => {
        const saved = JSON.stringify(['water_basic']);
        localStorage.setItem(KEYS.obtained, saved);
        window.history.replaceState({}, '', '/?c=');

        const { container } = render(createElement(CatalogPage));
        const banner = mustQuery(container, '#viewBanner');
        expect(banner.textContent).toContain('Link de compartilhamento inválido ou vazio');
        expect(container.querySelectorAll('.card[data-id]').length).toBe(0);
        expect(localStorage.getItem(KEYS.obtained)).toBe(saved);

        fireEvent.click(mustQuery(banner, 'a'));
        expect(container.querySelector('#viewBanner')).toBeNull();
        expect(window.location.search).toBe('');
        expect(localStorage.getItem(KEYS.obtained)).toBe(saved);
    });

    it('sinaliza erro amigável em ?c=2.invalido e ?c=!!! sem quebrar o app ou perder dados locais', async () => {
        const saved = JSON.stringify(['water_basic']);
        localStorage.setItem(KEYS.obtained, saved);
        window.history.replaceState({}, '', '/?c=2.invalido');

        const { container } = render(createElement(CatalogPage));
        await waitFor(() => {
            const banner = mustQuery(container, '#viewBanner');
            expect(banner.textContent).toContain('Link de compartilhamento inválido ou vazio');
        });
        expect(localStorage.getItem(KEYS.obtained)).toBe(saved);
        cleanup();

        window.history.replaceState({}, '', '/?c=!!!');
        const secondRender = render(createElement(CatalogPage));
        await waitFor(() => {
            const banner = mustQuery(secondRender.container, '#viewBanner');
            expect(banner.textContent).toContain('Link de compartilhamento inválido ou vazio');
        });
        expect(localStorage.getItem(KEYS.obtained)).toBe(saved);
    });

    it('valida backup JSON sem perder dados quando 0 IDs são reconhecidos e permite Desfazer após importação válida', async () => {
        localStorage.setItem(KEYS.obtained, JSON.stringify(['water_basic']));
        const { container } = render(createElement(CatalogPage));

        const importInput = mustQuery(container, '#importInput');

        // 1. JSON só com IDs desconhecidos não sobrescreve coleção atual
        const invalidIdsFile = new File(
            [JSON.stringify({ obtained: ['id_nao_existe'], mastered: [] })],
            'invalid.json',
            { type: 'application/json' }
        );
        fireEvent.change(importInput, { target: { files: [invalidIdsFile] } });

        await waitFor(() => {
            const errToast = mustQuery(document, '#toastContainer .toast-error');
            expect(errToast.textContent).toContain('Nenhum pituchinhu válido encontrado');
        });
        expect(readJsonStorage(KEYS.obtained)).toEqual(['water_basic']);

        // 2. Importação parcial oferece botão Desfazer e restaura estado anterior ao clicar
        const validBackupFile = new File(
            [
                JSON.stringify({
                    obtained: ['water_gold', 'water_holofoil', 'id_desconhecido'],
                    mastered: ['water_gold'],
                }),
            ],
            'valid.json',
            { type: 'application/json' }
        );
        fireEvent.change(importInput, { target: { files: [validBackupFile] } });

        await waitFor(() => {
            expect(readJsonStorage(KEYS.obtained)).toEqual([
                'water_gold',
                'water_holofoil',
            ]);
        });

        const undoBtn = await waitFor(() => {
            const toastEl = mustQuery(document, '#toastContainer .toast-success');
            expect(toastEl.textContent).toContain('2 pituchinhu(s) importado(s)');
            expect(toastEl.textContent).toContain('1 item(ns) desconhecido(s) ignorado(s)');
            const btn = mustQuery(toastEl, '.toast-action');
            expect(btn.textContent).toBe('Desfazer');
            return btn;
        });

        fireEvent.click(undoBtn);
        await waitFor(() => {
            expect(readJsonStorage(KEYS.obtained)).toEqual(['water_basic']);
        });
    });

    it('empilha notificações em #toastContainer e usa fallback de cópia quando navigator.clipboard não está disponível', () => {
        toast('Primeiro aviso', 'info');
        toast('Segundo aviso', 'success');

        const region = document.getElementById('toastContainer');
        expect(region).not.toBeNull();
        if (!region) throw new Error('Container de toast não encontrado');
        expect(region.getAttribute('role')).toBe('region');
        expect(region.querySelectorAll('.toast').length).toBe(2);

        // Fallback legado para contextos HTTP / sem navigator.clipboard
        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: undefined,
        });
        const hadOwnExecCommand = Object.prototype.hasOwnProperty.call(document, 'execCommand');
        const originalExecCommand = document.execCommand;
        document.execCommand = vi.fn(() => true);

        copyText('texto teste', 'Copiado no HTTP!', 'Erro ao copiar');
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(region.textContent).toContain('Copiado no HTTP!');

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: originalClipboard,
        });
        if (hadOwnExecCommand) {
            document.execCommand = originalExecCommand;
        } else {
            Reflect.deleteProperty(document, 'execCommand');
        }
    });

    it('preserva referência de visibleSprites ao marcar cards na visão padrão e recalcula sob status/hideMastered', () => {
        /** @type {ReturnType<typeof useTrackerState> | null} */
        let latest = null;
        function Probe() {
            latest = useTrackerState(baseSprites);
            return null;
        }
        const readState = () => {
            if (!latest) throw new Error('Expected tracker state snapshot');
            return latest;
        };

        render(createElement(Probe));
        const initialVisible = readState().visibleSprites;
        const firstId = initialVisible[0].id;

        act(() => {
            readState().toggleObtained(firstId);
            readState().toggleMastery(firstId);
            readState().updateSetting('lightTheme', true);
            readState().updateSetting('lowFidelity', true);
        });
        expect(readState().visibleSprites).toBe(initialVisible);

        act(() => {
            readState().updateFilter('status', 'owned');
        });
        const ownedVisible = readState().visibleSprites;
        expect(ownedVisible).not.toBe(initialVisible);
        expect(ownedVisible.map(s => s.id)).toEqual([firstId]);

        act(() => {
            readState().updateFilter('status', 'all');
            readState().updateSetting('hideMastered', true);
        });
        expect(readState().visibleSprites.some(s => s.id === firstId)).toBe(false);
    });
});

