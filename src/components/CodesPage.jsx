import { useState, useMemo, useEffect } from 'react';
import { baseCodes, codeCategories, CATEGORY_ORDER } from '../data/codes-data.js';
import { getSpriteImageUrl } from '../assets/spriteImages.js';

const REDEEMED_KEY = 'fn_redeemed_codes';
const HIDE_REDEEMED_KEY = 'fn_hide_redeemed_codes';

function readRedeemedCodes() {
    try {
        return JSON.parse(localStorage.getItem(REDEEMED_KEY)) || [];
    } catch {
        return [];
    }
}

function readHideRedeemed() {
    try {
        const stored = localStorage.getItem(HIDE_REDEEMED_KEY);
        return stored !== null ? JSON.parse(stored) : true;
    } catch {
        return true;
    }
}

function showFloatingCopyText(anchorElement) {
    if (!anchorElement) return;
    const textEl = document.createElement('div');
    textEl.className = 'floating-copy-text';
    textEl.textContent = 'Código copiado!';

    const rect = anchorElement.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top;

    const randomAngleX = (Math.random() - 0.5) * 40;
    const endY = -45;

    textEl.style.setProperty('--target-x', `${randomAngleX}px`);
    textEl.style.setProperty('--target-y', `${endY}px`);
    textEl.style.left = `${startX}px`;
    textEl.style.top = `${startY}px`;

    document.body.appendChild(textEl);

    const cleanup = () => {
        if (textEl.parentNode) {
            textEl.remove();
        }
    };

    textEl.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 900);
}

function copyCodeToClipboard(text, anchorElement) {
    showFloatingCopyText(anchorElement);
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
    }
}

export function CodesPage({ onBack }) {
    const [redeemed, setRedeemed] = useState(readRedeemedCodes);
    const [hideRedeemed, setHideRedeemed] = useState(readHideRedeemed);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        localStorage.setItem(REDEEMED_KEY, JSON.stringify(redeemed));
    }, [redeemed]);

    useEffect(() => {
        localStorage.setItem(HIDE_REDEEMED_KEY, JSON.stringify(hideRedeemed));
    }, [hideRedeemed]);

    const activeCodes = useMemo(
        () => baseCodes.filter(c => c.active !== false),
        []
    );

    const redeemedActiveCount = useMemo(
        () => activeCodes.filter(c => redeemed.includes(c.code)).length,
        [activeCodes, redeemed]
    );

    const groupedCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        const filtered = activeCodes.filter(item => {
            if (hideRedeemed && redeemed.includes(item.code)) {
                return false;
            }
            if (query) {
                const matchesCode = item.code.toLowerCase().includes(query);
                const matchesReward = item.reward.toLowerCase().includes(query);
                const catName = (codeCategories[item.category] || '').toLowerCase();
                const matchesCat = catName.includes(query);
                if (!matchesCode && !matchesReward && !matchesCat) {
                    return false;
                }
            }
            return true;
        });

        const grouped = {};
        filtered.forEach(item => {
            const catKey = item.category || 'cat5';
            if (!grouped[catKey]) grouped[catKey] = [];
            grouped[catKey].push(item);
        });

        return CATEGORY_ORDER.filter(catKey => grouped[catKey]?.length > 0).map(catKey => ({
            key: catKey,
            title: codeCategories[catKey] || 'Diversos',
            items: grouped[catKey],
        }));
    }, [activeCodes, hideRedeemed, redeemed, searchQuery]);

    const toggleRedeem = code => {
        setRedeemed(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    return (
        <div className="app">
            <header className="header">
                <div className="brand">
                    <h1>Códigos e Trapaças</h1>
                </div>
                <div className="actions" style={{ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' }}>
                    <button type="button" className="btn btn-accent" onClick={onBack}>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                            style={{ marginRight: '6px' }}
                        >
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                        Voltar
                    </button>
                    <div className="codes-progress-badge" id="codesProgressBadge">
                        {redeemedActiveCount} / {activeCodes.length} resgatados
                    </div>
                </div>
            </header>

            <nav className="toolbar codes-toolbar">
                <div className="toolbar-row">
                    <label className="sr-only" htmlFor="codeSearchInput">
                        Buscar código ou recompensa
                    </label>
                    <input
                        type="search"
                        id="codeSearchInput"
                        className="input codes-search-input"
                        placeholder="Buscar código ou recompensa…"
                        autoComplete="off"
                        spellCheck="false"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <div className="switches">
                        <label className="switch">
                            <input
                                type="checkbox"
                                id="hideRedeemedToggle"
                                checked={hideRedeemed}
                                onChange={e => setHideRedeemed(e.target.checked)}
                            />
                            <span>Ocultar resgatados</span>
                        </label>
                    </div>
                </div>
            </nav>

            <main className="codes-main-container">
                <div className="codes-info-banner">
                    <svg
                        className="codes-info-icon"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                    <span>
                        Clique em um código ou no botão <strong>Copiar</strong> para copiá-lo para a
                        área de transferência.
                    </span>
                </div>

                <div className="codes-list" id="codesList">
                    {groupedCategories.length === 0 ? (
                        <div className="codes-empty">Nenhum código encontrado</div>
                    ) : (
                        groupedCategories.map(group => (
                            <section
                                key={group.key}
                                className="code-category-group"
                                aria-label={group.title}
                            >
                                <div className="code-category-header">
                                    <span>{group.title}</span>
                                    <span className="code-category-count">{group.items.length}</span>
                                </div>
                                <div className="code-category-items">
                                    {group.items.map(item => {
                                        const isRedeemed = redeemed.includes(item.code);
                                        return (
                                            <div
                                                key={item.code}
                                                className={`code-row${isRedeemed ? ' redeemed' : ''}`}
                                            >
                                                <button
                                                    type="button"
                                                    className="code-value"
                                                    title="Clique para copiar"
                                                    onClick={e =>
                                                        copyCodeToClipboard(item.code, e.currentTarget)
                                                    }
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                                    </svg>
                                                    <span>{item.code}</span>
                                                </button>

                                                <div className="code-reward">
                                                    {item.internalreward && (
                                                        <img
                                                            src={getSpriteImageUrl(item.internalreward)}
                                                            className="code-reward-icon"
                                                            alt=""
                                                            width="32"
                                                            height="32"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <span className="code-reward-text">
                                                        {item.reward}
                                                    </span>
                                                </div>

                                                <div className="code-card-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-copy"
                                                        title="Copiar código"
                                                        onClick={e =>
                                                            copyCodeToClipboard(
                                                                item.code,
                                                                e.currentTarget
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                                        </svg>
                                                        <span>Copiar</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm btn-redeem ${
                                                            isRedeemed ? 'btn-redeemed' : 'btn-accent'
                                                        }`}
                                                        title={
                                                            isRedeemed
                                                                ? 'Marcar como não usado'
                                                                : 'Marcar como usado'
                                                        }
                                                        onClick={() => toggleRedeem(item.code)}
                                                    >
                                                        {isRedeemed ? (
                                                            <>
                                                                <svg
                                                                    width="14"
                                                                    height="14"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                                </svg>
                                                                <span>Usado</span>
                                                            </>
                                                        ) : (
                                                            <span>Marcar usado</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))
                    )}
                </div>
            </main>

            <footer className="footer">
                <p>
                    Fortnite and its materials (Sprites and Data) are trademarks and copyrights of
                    Epic Games, Inc. This website is not endorsed or affiliated with Epic Games, Inc..
                </p>
            </footer>
        </div>
    );
}
