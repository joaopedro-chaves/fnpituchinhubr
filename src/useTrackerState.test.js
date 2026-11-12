// @vitest-environment jsdom
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { KEYS } from './share-order.js';

describe('Fase 5 — useTrackerState (persistência incremental e debounce)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        cleanup();
    });

    it('não grava no localStorage na montagem inicial e grava apenas a chave modificada', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        const { container } = render(createElement(CatalogPage));

        expect(setItemSpy).not.toHaveBeenCalled();

        const firstCard = container.querySelector('.card[data-id]');
        fireEvent.click(firstCard);

        expect(setItemSpy).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(KEYS.obtained, JSON.stringify([firstCard.dataset.id]));

        setItemSpy.mockClear();
        const crownBtn = firstCard.querySelector('.card-crown');
        fireEvent.click(crownBtn);

        expect(setItemSpy).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(KEYS.mastered, JSON.stringify([firstCard.dataset.id]));

        setItemSpy.mockRestore();
    });

    it('faz debounce de ~200ms na busca e faz flush imediato em pagehide sem perder dados', () => {
        vi.useFakeTimers();
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        const { container } = render(createElement(CatalogPage));

        const searchInput = container.querySelector('#searchInput');
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
});

