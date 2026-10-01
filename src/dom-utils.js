/* ===================================================
   DOM & UI Utility Functions
   =================================================== */

export function toast(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('visible'));
    setTimeout(() => {
        el.classList.remove('visible');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
        setTimeout(() => el.remove(), 500);
    }, 2500);
}

export function isIOS() {
    return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
}

export function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
    }[char]));
}

export function copyText(text, successMsg, errorMsg) {
    if (!navigator.clipboard?.writeText) {
        toast(errorMsg, 'error');
        return;
    }

    navigator.clipboard
        .writeText(text)
        .then(() => {
            toast(successMsg, 'success');
        })
        .catch(() => {
            toast(errorMsg, 'error');
        });
}

export function setDropdownOpen(dropdown, toggle, open) {
    if (!dropdown || !toggle) return;
    dropdown.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
}

export function closeDropdowns(dom) {
    if (!dom) return;
    setDropdownOpen(dom.exportDropdown, dom.exportToggle, false);
    setDropdownOpen(dom.settingsDropdown, dom.settingsToggle, false);
}

export function drawRoundRect(ctx, x, y, width, height, radius = 8) {
    if (ctx.roundRect) {
        ctx.roundRect(x, y, width, height, radius);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}
