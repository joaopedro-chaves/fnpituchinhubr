// @vitest-environment jsdom
import { createElement, useEffect, useLayoutEffect, useRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import {
    detectControllerType,
    getControllerLabel,
    findSpatialCandidate,
    useGamepadAndSpatialNav,
} from './hooks/useGamepadAndSpatialNav.js';

/** @typedef {ReturnType<typeof useGamepadAndSpatialNav>} SpatialNavSnapshot */

/**
 * Ensures a captured navigation snapshot is non-null before assertions read its fields.
 * @param {SpatialNavSnapshot | null} snapshot
 * @returns {SpatialNavSnapshot}
 */
function requireSnapshot(snapshot) {
    if (!snapshot) {
        throw new Error('Expected navigation snapshot');
    }
    return snapshot;
}

/**
 * Builds a mock DOMRect for card geometry assertions.
 * @param {number} left
 * @param {number} top
 * @param {number} [width]
 * @param {number} [height]
 * @returns {DOMRect}
 */
function rect(left, top, width = 100, height = 100) {
    return /** @type {DOMRect} */ ({
        left,
        top,
        right: left + width,
        bottom: top + height,
        width,
        height,
        x: left,
        y: top,
        toJSON: () => ({}),
    });
}

function makeButton(pressed = false) {
    return { pressed, touched: pressed, value: pressed ? 1 : 0 };
}

function makePad(id = 'DualSense Wireless Controller (Vendor: 054c Product: 0ce6)') {
    return {
        id,
        index: 0,
        connected: true,
        timestamp: 0,
        mapping: 'standard',
        axes: [0, 0, 0, 0],
        buttons: Array.from({ length: 16 }, () => makeButton(false)),
    };
}

/**
 * Assigns visibility and mock bounding rects to cards inside a grid element.
 * @param {HTMLElement} gridEl
 * @param {Record<string, [number, number, number?, number?]>} coords
 */
function mockCardGeometry(gridEl, coords) {
    /** @type {any} */ (gridEl).checkVisibility = () => true;
    Object.entries(coords).forEach(([id, bounds]) => {
        const card = gridEl.querySelector(`.card[data-id="${id}"]`);
        if (card) {
            card.getBoundingClientRect = () => rect(bounds[0], bounds[1], bounds[2], bounds[3]);
        }
    });
}

/**
 * @param {{
 *   sprites: Array<{ id: string, name: string }>,
 *   viewMode?: boolean,
 *   onToggleObtained?: (id: string) => void,
 *   onToggleMastery?: (id: string) => void,
 *   onStateSnapshot?: (nav: SpatialNavSnapshot) => void,
 * }} props
 */
function SpatialNavHarness({
    sprites,
    viewMode = false,
    onToggleObtained,
    onToggleMastery,
    onStateSnapshot,
}) {
    const gridRef = useRef(/** @type {HTMLElement | null} */ (null));
    useLayoutEffect(() => {
        gridRef.current = document.getElementById('grid');
        return () => {
            gridRef.current = null;
        };
    }, []);

    const nav = useGamepadAndSpatialNav({
        gridRef,
        visibleSprites: sprites,
        viewMode,
        onToggleObtained,
        onToggleMastery,
    });

    useEffect(() => {
        onStateSnapshot?.(nav);
    });

    return createElement(
        'div',
        {
            id: 'grid',
            onKeyDown: nav.handleGridKeyDown,
        },
        sprites.map(sprite =>
            createElement(
                'div',
                { key: sprite.id, className: 'card', 'data-id': sprite.id },
                createElement(
                    'button',
                    {
                        type: 'button',
                        className: 'card-primary',
                        onFocus: () => nav.handleCardFocus(sprite.id),
                    },
                    sprite.name
                )
            )
        ),
        createElement('input', { id: 'gridFilterInput', type: 'text' })
    );
}

describe('detectControllerType & getControllerLabel', () => {
    it('identifica Switch, PlayStation e fallback Xbox corretamente', () => {
        expect(detectControllerType('Nintendo Switch Pro Controller (057e)')).toBe('switch');
        expect(detectControllerType('Joy-Con (L+R)')).toBe('switch');
        expect(detectControllerType('Sony DualSense PS5 Controller (054c)')).toBe('playstation');
        expect(detectControllerType('Xbox Wireless Controller')).toBe('xbox');
        expect(detectControllerType('')).toBe('xbox');

        expect(getControllerLabel('switch')).toBe('Switch');
        expect(getControllerLabel('playstation')).toBe('PlayStation');
        expect(getControllerLabel('xbox')).toBe('Xbox');
    });
});

describe('findSpatialCandidate', () => {
    afterEach(() => {
        cleanup();
    });

    it('navega nas 4 direções priorizando alinhamento perpendicular', () => {
        const grid = document.createElement('div');
        /** @type {any} */ (grid).checkVisibility = () => true;

        const a = document.createElement('div');
        a.className = 'card';
        a.dataset.id = 'a';
        a.getBoundingClientRect = () => rect(0, 0);

        const b = document.createElement('div');
        b.className = 'card';
        b.dataset.id = 'b';
        b.getBoundingClientRect = () => rect(120, 0);

        const c = document.createElement('div');
        c.className = 'card';
        c.dataset.id = 'c';
        c.getBoundingClientRect = () => rect(0, 130);

        const d = document.createElement('div');
        d.className = 'card';
        d.dataset.id = 'd';
        d.getBoundingClientRect = () => rect(120, 130);

        // Candidato desalinhado horizontalmente, mas um pouco próximo horizontalmente
        const unaligned = document.createElement('div');
        unaligned.className = 'card';
        unaligned.dataset.id = 'unaligned';
        unaligned.getBoundingClientRect = () => rect(110, 130);

        grid.append(a, unaligned, b, c, d);
        document.body.appendChild(grid);

        expect(findSpatialCandidate(grid, a, 'right')).toBe(b);
        expect(findSpatialCandidate(grid, b, 'left')).toBe(a);
        expect(findSpatialCandidate(grid, a, 'down')).toBe(c);
        expect(findSpatialCandidate(grid, c, 'up')).toBe(a);
        expect(findSpatialCandidate(grid, a, 'left')).toBeNull();
    });

    it('usa pontuação ponderada quando não há sobreposição perpendicular e respeita visibilidade', () => {
        const grid = document.createElement('div');
        /** @type {any} */ (grid).checkVisibility = () => true;

        const origin = document.createElement('div');
        origin.className = 'card';
        origin.dataset.id = 'origin';
        origin.getBoundingClientRect = () => rect(0, 0, 80, 80);

        const nearerPerp = document.createElement('div');
        nearerPerp.className = 'card';
        nearerPerp.dataset.id = 'nearerPerp';
        nearerPerp.getBoundingClientRect = () => rect(120, 100, 80, 80);

        const farPerp = document.createElement('div');
        farPerp.className = 'card';
        farPerp.dataset.id = 'farPerp';
        farPerp.getBoundingClientRect = () => rect(100, 300, 80, 80);

        grid.append(origin, nearerPerp, farPerp);
        document.body.appendChild(grid);

        expect(findSpatialCandidate(grid, origin, 'right')).toBe(nearerPerp);

        /** @type {any} */ (grid).checkVisibility = () => false;
        expect(findSpatialCandidate(grid, origin, 'right')).toBeNull();
    });
});

describe('useGamepadAndSpatialNav', () => {
    const originalGetGamepads = navigator.getGamepads;
    const originalRAF = globalThis.requestAnimationFrame;
    const originalCAF = globalThis.cancelAnimationFrame;
    const hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');

    /** @type {Map<number, FrameRequestCallback>} */
    let rafCallbacks;
    let nextRafId = 1;
    let hiddenFlag = false;
    let activePads = /** @type {any[]} */ ([]);
    /** @type {ReturnType<typeof vi.fn>} */
    let getGamepadsSpy;

    const sampleSprites = [
        { id: 'c1', name: 'C1' },
        { id: 'c2', name: 'C2' },
        { id: 'c3', name: 'C3' },
    ];

    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '';
        rafCallbacks = new Map();
        nextRafId = 1;
        hiddenFlag = false;
        activePads = [];
        getGamepadsSpy = vi.fn(() => activePads);

        Object.defineProperty(navigator, 'getGamepads', {
            configurable: true,
            value: getGamepadsSpy,
        });
        Object.defineProperty(document, 'hidden', {
            configurable: true,
            get: () => hiddenFlag,
        });

        globalThis.requestAnimationFrame = cb => {
            const id = nextRafId++;
            rafCallbacks.set(id, cb);
            return id;
        };
        globalThis.cancelAnimationFrame = id => {
            rafCallbacks.delete(id);
        };
    });

    afterEach(() => {
        document.getElementById('toastContainer')?.remove();
        cleanup();
        vi.restoreAllMocks();
        if (originalGetGamepads) {
            Object.defineProperty(navigator, 'getGamepads', {
                configurable: true,
                value: originalGetGamepads,
            });
        } else {
            delete (/** @type {any} */ (navigator)).getGamepads;
        }
        if (hiddenDescriptor) {
            Object.defineProperty(document, 'hidden', hiddenDescriptor);
        } else {
            delete (/** @type {any} */ (document)).hidden;
        }
        globalThis.requestAnimationFrame = originalRAF;
        globalThis.cancelAnimationFrame = originalCAF;
    });

    /**
     * Flushes queued requestAnimationFrame callbacks at the given timestamp.
     * @param {number} timestamp
     */
    function stepRaf(timestamp) {
        const entries = Array.from(rafCallbacks.entries());
        rafCallbacks.clear();
        entries.forEach(([, cb]) => cb(timestamp));
    }

    it('navega com setas do teclado, preserva rolagem nas bordas e ignora inputs editáveis', () => {
        /** @type {SpatialNavSnapshot | null} */
        let latest = null;
        const { container } = render(
            createElement(SpatialNavHarness, {
                sprites: sampleSprites,
                onStateSnapshot: nav => {
                    latest = nav;
                },
            })
        );

        const grid = /** @type {HTMLElement} */ (container.querySelector('#grid'));
        mockCardGeometry(grid, {
            c1: [0, 0, 100, 100],
            c2: [120, 0, 100, 100],
            c3: [240, 0, 100, 100],
        });

        const c1Btn = /** @type {HTMLElement} */ (
            grid.querySelector('.card[data-id="c1"] .card-primary')
        );
        const c2Btn = /** @type {HTMLElement} */ (
            grid.querySelector('.card[data-id="c2"] .card-primary')
        );
        const c3Btn = /** @type {HTMLElement} */ (
            grid.querySelector('.card[data-id="c3"] .card-primary')
        );

        c1Btn.focus();
        fireEvent.focus(c1Btn);

        const rightEv = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true,
            cancelable: true,
        });
        act(() => {
            c1Btn.dispatchEvent(rightEv);
        });
        expect(rightEv.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(c2Btn);
        expect(requireSnapshot(latest).inputMode).toBe('keyboard');

        // Atalho com Ctrl é ignorado
        fireEvent.keyDown(c2Btn, { key: 'ArrowRight', ctrlKey: true });
        expect(document.activeElement).toBe(c2Btn);

        // Seta para a direita até c3 e depois na borda direita não deve prevenir default
        fireEvent.keyDown(c2Btn, { key: 'ArrowRight' });
        expect(document.activeElement).toBe(c3Btn);
        const boundaryEv = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true,
            cancelable: true,
        });
        act(() => {
            c3Btn.dispatchEvent(boundaryEv);
        });
        expect(boundaryEv.defaultPrevented).toBe(false);

        // Input editável dentro do container não dispara navegação espacial
        const inputEl = /** @type {HTMLElement} */ (grid.querySelector('#gridFilterInput'));
        inputEl.focus();
        const inputEv = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
            bubbles: true,
            cancelable: true,
        });
        act(() => {
            inputEl.dispatchEvent(inputEv);
        });
        expect(inputEv.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(inputEl);
    });

    it('gerencia conexão, polling D-Pad/Stick, coleta/domínio em borda e visibilitychange', () => {
        const onToggleObtained = vi.fn();
        const onToggleMastery = vi.fn();
        /** @type {SpatialNavSnapshot | null} */
        let latest = null;

        const { container } = render(
            createElement(SpatialNavHarness, {
                sprites: sampleSprites,
                onToggleObtained,
                onToggleMastery,
                onStateSnapshot: nav => {
                    latest = nav;
                },
            })
        );

        const grid = /** @type {HTMLElement} */ (container.querySelector('#grid'));
        mockCardGeometry(grid, {
            c1: [0, 0, 100, 100],
            c2: [120, 0, 100, 100],
            c3: [240, 0, 100, 100],
        });

        const pad = makePad('DualSense Wireless Controller (054c)');
        activePads = [pad];

        act(() => {
            window.dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: pad }));
        });

        const connectedState = requireSnapshot(latest);
        expect(connectedState.gamepadInfo).toEqual({ connected: true, type: 'playstation' });
        expect(connectedState.inputMode).toBe('gamepad');
        expect(document.body.textContent).toContain('Controle PlayStation reconhecido');

        expect(connectedState.activeCardId).toBe('c1');

        // Frame 1: D-Pad direita move de c1 (inicial) para c2; segurar repete após ~260ms para c3
        pad.buttons[15] = makeButton(true);
        act(() => {
            stepRaf(100);
        });
        expect(requireSnapshot(latest).activeCardId).toBe('c2');
        act(() => {
            stepRaf(370);
        });
        expect(requireSnapshot(latest).activeCardId).toBe('c3');

        // Solta D-Pad e volta pelo analógico esquerdo para c2
        pad.buttons[15] = makeButton(false);
        act(() => {
            stepRaf(390);
        });
        pad.axes[0] = -0.85;
        act(() => {
            stepRaf(410);
        });
        expect(requireSnapshot(latest).activeCardId).toBe('c2');
        pad.axes[0] = 0;

        // Botões A/B (buttons[1]) e X/Y (buttons[3]) são disparados por borda (1x enquanto pressionados)
        pad.buttons[1] = makeButton(true);
        pad.buttons[3] = makeButton(true);
        act(() => {
            stepRaf(430);
            stepRaf(450);
        });
        expect(onToggleObtained).toHaveBeenCalledTimes(1);
        expect(onToggleObtained).toHaveBeenCalledWith('c2');
        expect(onToggleMastery).toHaveBeenCalledTimes(1);
        expect(onToggleMastery).toHaveBeenCalledWith('c2');

        // visibilitychange para oculto cancela RAF de polling e visível retoma
        getGamepadsSpy.mockClear();
        hiddenFlag = true;
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
            stepRaf(470);
        });
        expect(getGamepadsSpy).not.toHaveBeenCalled();

        hiddenFlag = false;
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
            stepRaf(490);
        });
        expect(getGamepadsSpy).toHaveBeenCalled();

        // Desconexão limpa estado e para polling
        activePads = [];
        getGamepadsSpy.mockClear();
        act(() => {
            window.dispatchEvent(Object.assign(new Event('gamepaddisconnected'), { gamepad: pad }));
        });
        const disconnectedState = requireSnapshot(latest);
        expect(disconnectedState.gamepadInfo.connected).toBe(false);
        expect(disconnectedState.inputMode).toBeNull();
        expect(document.body.textContent).toContain('Controle PlayStation desconectado');

        getGamepadsSpy.mockClear();
        act(() => {
            stepRaf(520);
        });
        expect(getGamepadsSpy).not.toHaveBeenCalled();
    });

    it('bloqueia mutações via botões do controle quando está em viewMode', () => {
        const onToggleObtained = vi.fn();
        const onToggleMastery = vi.fn();
        const pad = makePad('Xbox Wireless Controller');
        pad.buttons[1] = makeButton(true);
        pad.buttons[3] = makeButton(true);
        activePads = [pad];

        const { container } = render(
            createElement(SpatialNavHarness, {
                sprites: sampleSprites,
                viewMode: true,
                onToggleObtained,
                onToggleMastery,
            })
        );

        const c1Btn = /** @type {HTMLElement} */ (
            container.querySelector('.card[data-id="c1"] .card-primary')
        );
        c1Btn.focus();
        fireEvent.focus(c1Btn);

        act(() => {
            stepRaf(50);
        });

        expect(onToggleObtained).not.toHaveBeenCalled();
        expect(onToggleMastery).not.toHaveBeenCalled();
    });
});
