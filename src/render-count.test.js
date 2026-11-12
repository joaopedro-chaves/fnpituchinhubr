// @vitest-environment jsdom
import { createElement } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup, act, waitFor } from '@testing-library/react';
import { CatalogPage, INITIAL_BATCH_SIZE, PRIORITY_CARDS } from './pages/CatalogPage.jsx';

function setupRenderCounter() {
    const counts = {
        spriteCard: 0,
        header: 0,
        filterBar: 0,
        controllerHud: 0,
    };
    window.__recordPerfRender = key => {
        counts[key] += 1;
    };
    return {
        counts,
        reset() {
            counts.spriteCard = 0;
            counts.header = 0;
            counts.filterBar = 0;
            counts.controllerHud = 0;
        },
    };
}

describe('Otimizações de renderização, carregamento e acessibilidade', () => {
    let tracker;
    const originalIntersectionObserver = globalThis.IntersectionObserver;

    beforeEach(() => {
        localStorage.clear();
        tracker = setupRenderCounter();
    });

    afterEach(() => {
        delete window.__recordPerfRender;
        globalThis.IntersectionObserver = originalIntersectionObserver;
        cleanup();
    });

    it('renderiza apenas o lote inicial e preserva memoização ao mover foco entre cards', () => {
        const { container } = render(createElement(CatalogPage));
        const cards = container.querySelectorAll('.card[data-id]');
        expect(cards.length).toBe(INITIAL_BATCH_SIZE);
        expect(tracker.counts).toEqual({
            spriteCard: INITIAL_BATCH_SIZE,
            header: 1,
            filterBar: 1,
            controllerHud: 1,
        });

        tracker.reset();
        fireEvent.focus(cards[1].querySelector('.card-primary'));

        expect(tracker.counts.spriteCard).toBe(2);
        expect(tracker.counts.header).toBe(0);
        expect(tracker.counts.filterBar).toBe(0);
        expect(tracker.counts.controllerHud).toBe(0);
    });

    it('carrega lotes adicionais via IntersectionObserver conforme rolagem', () => {
        let observerCallback = null;
        globalThis.IntersectionObserver = class MockIntersectionObserver {
            constructor(cb) {
                observerCallback = cb;
            }
            observe() {}
            disconnect() {}
        };

        const { container } = render(createElement(CatalogPage));
        expect(container.querySelectorAll('.card[data-id]').length).toBe(INITIAL_BATCH_SIZE);
        expect(typeof observerCallback).toBe('function');

        tracker.reset();
        act(() => {
            observerCallback([{ isIntersecting: true }]);
        });

        const updatedCards = container.querySelectorAll('.card[data-id]');
        expect(updatedCards.length).toBe(INITIAL_BATCH_SIZE * 2);
        // Apenas os novos 48 cards são montados
        expect(tracker.counts.spriteCard).toBe(INITIAL_BATCH_SIZE);
    });

    it('preserva lotes já carregados ao marcar pituchinho sob filtro Faltando', () => {
        let observerCallback = null;
        globalThis.IntersectionObserver = class MockIntersectionObserver {
            constructor(cb) {
                observerCallback = cb;
            }
            observe() {}
            disconnect() {}
        };

        const { container } = render(createElement(CatalogPage));
        fireEvent.click(container.querySelector('[data-status="missing"]'));

        act(() => {
            observerCallback([{ isIntersecting: true }]);
        });

        const expandedCards = container.querySelectorAll('.card[data-id]');
        expect(expandedCards.length).toBe(INITIAL_BATCH_SIZE * 2);

        const card49 = expandedCards[INITIAL_BATCH_SIZE];
        const card49Id = card49.dataset.id;
        fireEvent.click(card49.querySelector('.card-primary'));

        const remainingCards = container.querySelectorAll('.card[data-id]');
        expect(remainingCards.length).toBe(INITIAL_BATCH_SIZE * 2);
        expect(container.querySelector(`.card[data-id="${card49Id}"]`)).toBeNull();
    });

    it('clicar para coletar, dominar e desmarcar domínio re-renderiza apenas 1 card e atualiza aria-label em PT-BR', () => {
        const { container } = render(createElement(CatalogPage));
        const cards = container.querySelectorAll('.card[data-id]');
        const targetCard = cards[0];
        const targetBtn = targetCard.querySelector('.card-primary');
        const cardTitle = targetCard.querySelector('.card-title').textContent;

        expect(targetBtn).not.toBeNull();
        expect(targetCard.querySelector('.card-primary button, .card-primary a, .card-primary [role="button"]')).toBeNull();
        expect(targetBtn.getAttribute('aria-label')).toContain(cardTitle);
        expect(targetBtn.getAttribute('aria-label')).toContain('Não coletado');

        // 1. Marcar como coletado
        tracker.reset();
        fireEvent.click(targetBtn);
        expect(tracker.counts.spriteCard).toBe(1);
        expect(tracker.counts.header).toBe(1);
        expect(tracker.counts.filterBar).toBe(0);
        expect(tracker.counts.controllerHud).toBe(0);
        expect(targetCard.classList.contains('obtained')).toBe(true);
        expect(targetCard.classList.contains('mastered')).toBe(false);
        expect(targetBtn.getAttribute('aria-label')).toMatch(new RegExp(`^${cardTitle}.*Coletado`));

        // 2. Marcar como dominado pela coroa (irmã de .card-primary, sem aninhamento interativo)
        const crownBtn = targetCard.querySelector('.card-crown');
        expect(crownBtn).not.toBeNull();
        expect(targetBtn.contains(crownBtn)).toBe(false);
        tracker.reset();
        fireEvent.click(crownBtn);
        expect(tracker.counts.spriteCard).toBe(1);
        expect(tracker.counts.header).toBe(1);
        expect(tracker.counts.filterBar).toBe(0);
        expect(tracker.counts.controllerHud).toBe(0);
        expect(targetCard.classList.contains('mastered')).toBe(true);
        expect(targetBtn.getAttribute('aria-label')).toMatch(new RegExp(`^${cardTitle}.*Dominado`));

        // 3. Clicar no card dominado volta para apenas coletado
        tracker.reset();
        fireEvent.click(targetBtn);
        expect(tracker.counts.spriteCard).toBe(1);
        expect(tracker.counts.header).toBe(1);
        expect(tracker.counts.filterBar).toBe(0);
        expect(tracker.counts.controllerHud).toBe(0);
        expect(targetCard.classList.contains('obtained')).toBe(true);
        expect(targetCard.classList.contains('mastered')).toBe(false);
    });

    it('configura prioridade de imagens e semântica ARIA acessível no grid e cards', () => {
        const { container } = render(createElement(CatalogPage));
        const grid = container.querySelector('#spriteGrid');
        expect(grid.getAttribute('role')).toBeNull();

        const imgs = container.querySelectorAll('.card-display img');
        expect(imgs.length).toBe(INITIAL_BATCH_SIZE);

        imgs.forEach((img, index) => {
            expect(img.getAttribute('decoding')).toBe('async');
            expect(img.getAttribute('width')).toBe('80');
            expect(img.getAttribute('height')).toBe('80');
            if (index < PRIORITY_CARDS) {
                expect(img.getAttribute('loading')).toBe('eager');
                expect(img.getAttribute('fetchpriority')).toBe('high');
            } else {
                expect(img.getAttribute('loading')).toBe('lazy');
            }
        });
    });

    it('carrega os modais de Exportar e Configurações sob demanda via React.lazy', async () => {
        const { container } = render(createElement(CatalogPage));
        expect(container.querySelector('#exportPopupTitle')).toBeNull();
        expect(container.querySelector('#settingsPopupTitle')).toBeNull();

        fireEvent.click(container.querySelector('#exportToggle'));
        await waitFor(() => {
            expect(container.querySelector('#exportPopupTitle')).not.toBeNull();
        });

        fireEvent.click(container.querySelector('.modal-close-btn'));
        expect(container.querySelector('#exportPopupTitle')).toBeNull();

        fireEvent.click(container.querySelector('#settingsToggle'));
        await waitFor(() => {
            expect(container.querySelector('#settingsPopupTitle')).not.toBeNull();
        });
    });
});
