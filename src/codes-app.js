const REDEEMED_KEY = 'fn_redeemed_codes';
const HIDE_REDEEMED_KEY = 'fn_hide_redeemed_codes';

let currentSearchQuery = '';

function getRedeemedCodes() {
    try {
        return JSON.parse(localStorage.getItem(REDEEMED_KEY)) || [];
    } catch {
        return [];
    }
}

function saveRedeemedCodes(codes) {
    localStorage.setItem(REDEEMED_KEY, JSON.stringify(codes));
}

function toggleRedeem(code) {
    let redeemed = getRedeemedCodes();
    if (redeemed.includes(code)) {
        redeemed = redeemed.filter(c => c !== code);
    } else {
        redeemed.push(code);
    }
    saveRedeemedCodes(redeemed);
    renderCodes();
}

function redeemAll() {
    const allCodes = (typeof baseCodes !== 'undefined' ? baseCodes : [])
        .filter(c => c.active !== false)
        .map(c => c.code);
    saveRedeemedCodes(allCodes);
    renderCodes();
}

function unredeemAll() {
    saveRedeemedCodes([]);
    renderCodes();
}

// Floating copy notification & clipboard helper
function showFloatingCopyText(anchorElement) {
    const textEl = document.createElement('div');
    textEl.className = 'floating-copy-text';
    textEl.textContent = 'Código copiado!';

    // Calculate absolute position on the viewport
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

function copyToClipboard(text, anchorElement) {
    if (anchorElement) {
        showFloatingCopyText(anchorElement);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Erro ao copiar:', err);
    }

    document.body.removeChild(textArea);
}

function updateProgressBadge(redeemedCount, totalCount) {
    const badge = document.getElementById('codesProgressBadge');
    if (badge) {
        badge.textContent = `${redeemedCount} / ${totalCount} resgatados`;
    }
}

function renderCodes() {
    const list = document.getElementById('codesList');
    const hideRedeemedToggle = document.getElementById('hideRedeemedToggle');
    if (!list) return;

    const allCodes = typeof baseCodes !== 'undefined' ? baseCodes : [];
    const categories = typeof codeCategories !== 'undefined' ? codeCategories : {};
    const categoryOrder = typeof CATEGORY_ORDER !== 'undefined' ? CATEGORY_ORDER : Object.keys(categories);

    const redeemed = getRedeemedCodes();
    const hideRedeemed = hideRedeemedToggle ? hideRedeemedToggle.checked : true;
    const query = currentSearchQuery.trim().toLowerCase();

    const activeCodes = allCodes.filter(c => c.active !== false);
    const redeemedActiveCount = activeCodes.filter(c => redeemed.includes(c.code)).length;
    updateProgressBadge(redeemedActiveCount, activeCodes.length);

    list.innerHTML = '';

    const filteredCodes = activeCodes.filter(item => {
        if (hideRedeemed && redeemed.includes(item.code)) {
            return false;
        }
        if (query) {
            const matchesCode = item.code.toLowerCase().includes(query);
            const matchesReward = item.reward.toLowerCase().includes(query);
            const catName = (categories[item.category] || '').toLowerCase();
            const matchesCat = catName.includes(query);
            if (!matchesCode && !matchesReward && !matchesCat) {
                return false;
            }
        }
        return true;
    });

    if (filteredCodes.length === 0) {
        list.innerHTML = '<div class="codes-empty">Nenhum código encontrado</div>';
        return;
    }

    // Group items by category key (e.g., "cat1")
    const grouped = {};
    filteredCodes.forEach(item => {
        const catKey = item.category || 'cat5';
        if (!grouped[catKey]) grouped[catKey] = [];
        grouped[catKey].push(item);
    });

    // Render categories in order
    categoryOrder.forEach(catKey => {
        if (!grouped[catKey] || grouped[catKey].length === 0) return;

        const categoryTitle = categories[catKey] || "Diversos";
        const categoryItems = grouped[catKey];

        const sectionGroup = document.createElement('section');
        sectionGroup.className = 'code-category-group';
        sectionGroup.setAttribute('aria-label', categoryTitle);

        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'code-category-header';
        sectionHeader.innerHTML = `
            <span>${categoryTitle}</span>
            <span class="code-category-count">${categoryItems.length}</span>
        `;
        sectionGroup.appendChild(sectionHeader);

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'code-category-items';

        categoryItems.forEach(item => {
            const isRedeemed = redeemed.includes(item.code);
            const row = document.createElement('div');
            row.className = `code-row ${isRedeemed ? 'redeemed' : ''}`;

            const thumbnailHtml = item.internalreward
                ? `<img src="sprites/${encodeURIComponent(item.internalreward)}.png" class="code-reward-icon" alt="" width="32" height="32" loading="lazy">`
                : '';

            row.innerHTML = `
                <button type="button" class="code-value" title="Clique para copiar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    <span>${item.code}</span>
                </button>
                <div class="code-reward">
                    ${thumbnailHtml}
                    <span class="code-reward-text">${item.reward}</span>
                </div>
                <div class="code-card-actions">
                    <button type="button" class="btn btn-sm btn-copy" title="Copiar código">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                        <span>Copiar</span>
                    </button>
                    <button type="button" class="btn btn-sm btn-redeem ${isRedeemed ? 'btn-redeemed' : 'btn-accent'}" title="${isRedeemed ? 'Marcar como não usado' : 'Marcar como usado'}">
                        ${isRedeemed ? `
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            <span>Usado</span>
                        ` : `
                            <span>Marcar usado</span>
                        `}
                    </button>
                </div>
            `;

            const codeValueEl = row.querySelector('.code-value');
            codeValueEl.addEventListener('click', () => copyToClipboard(item.code, codeValueEl));

            const copyBtn = row.querySelector('.btn-copy');
            copyBtn.addEventListener('click', () => copyToClipboard(item.code, copyBtn));

            const redeemBtn = row.querySelector('.btn-redeem');
            redeemBtn.addEventListener('click', () => toggleRedeem(item.code));

            itemsContainer.appendChild(row);
        });

        sectionGroup.appendChild(itemsContainer);
        list.appendChild(sectionGroup);
    });
}

function initToolbar() {
    const redeemAllBtn = document.getElementById('redeemAllBtn');
    const unredeemAllBtn = document.getElementById('unredeemAllBtn');
    const hideRedeemedToggle = document.getElementById('hideRedeemedToggle');
    const searchInput = document.getElementById('codeSearchInput');

    if (redeemAllBtn) redeemAllBtn.addEventListener('click', redeemAll);
    if (unredeemAllBtn) unredeemAllBtn.addEventListener('click', unredeemAll);

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            renderCodes();
        });
    }

    if (hideRedeemedToggle) {
        const storedSetting = localStorage.getItem(HIDE_REDEEMED_KEY);
        hideRedeemedToggle.checked = storedSetting !== null ? JSON.parse(storedSetting) : true;

        hideRedeemedToggle.addEventListener('change', (e) => {
            localStorage.setItem(HIDE_REDEEMED_KEY, JSON.stringify(e.target.checked));
            renderCodes();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initToolbar();
    renderCodes();
});

