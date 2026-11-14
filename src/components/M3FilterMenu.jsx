import { memo, useRef } from 'react';

/** @param {{ open: boolean }} props */
function DropdownArrowIcon({ open }) {
    return (
        <svg
            className={`m3-chip-arrow${open ? ' open' : ''}`}
            width="10"
            height="6"
            viewBox="0 0 10 6"
            aria-hidden="true"
        >
            <path fill="currentColor" d="M0 0l5 6 5-6z" />
        </svg>
    );
}

/**
 * Menu dropdown estilo Material Design 3 para filtros da barra desktop.
 */
export const M3FilterMenu = memo(
    /**
     * @param {{
     *   id: string,
     *   label: string,
     *   value: string,
     *   defaultValue: string,
     *   options: Array<{ value: string, label: string }>,
     *   isOpen: boolean,
     *   onToggle: () => void,
     *   onClose: () => void,
     *   onSelect: (value: string) => void,
     * }} props
     */
    function M3FilterMenu({
        id,
        label,
        value,
        defaultValue,
        options,
        isOpen,
        onToggle,
        onClose,
        onSelect,
    }) {
        const containerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
        const triggerRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
        const menuRef = useRef(/** @type {HTMLDivElement | null} */ (null));

        const selectedOption = options.find(opt => opt.value === value) || options[0];
        const isFiltered = value !== defaultValue;

        const handleTriggerKeyDown = e => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (!isOpen) {
                    onToggle();
                }
                requestAnimationFrame(() => {
                    const items = menuRef.current?.querySelectorAll('button.m3-menu-item');
                    if (items?.length) {
                        const selectedIdx = options.findIndex(opt => opt.value === value);
                        const targetIdx = selectedIdx >= 0 ? selectedIdx : 0;
                        /** @type {HTMLElement | undefined} */ (items[targetIdx])?.focus({
                            preventScroll: true,
                        });
                    }
                });
            } else if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                onClose();
            }
        };

        const handleMenuKeyDown = e => {
            const items = /** @type {HTMLButtonElement[]} */ (
                Array.from(menuRef.current?.querySelectorAll('button.m3-menu-item') || [])
            );
            if (!items.length) return;
            const currentIndex =
                document.activeElement instanceof HTMLButtonElement
                    ? items.indexOf(document.activeElement)
                    : -1;

            if (
                e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'Home' ||
                e.key === 'End'
            ) {
                e.preventDefault();
                e.stopPropagation();
                let nextIndex = 0;
                if (e.key === 'Home') {
                    nextIndex = 0;
                } else if (e.key === 'End') {
                    nextIndex = items.length - 1;
                } else if (currentIndex < 0) {
                    nextIndex = 0;
                } else {
                    const delta = e.key === 'ArrowUp' ? -1 : 1;
                    nextIndex = (currentIndex + delta + items.length) % items.length;
                }
                items[nextIndex]?.focus({ preventScroll: true });
            } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
                triggerRef.current?.focus();
            } else if (e.key === 'Tab') {
                onClose();
            }
        };

        return (
            <div className={`m3-filter-dropdown${isOpen ? ' open' : ''}`} ref={containerRef}>
                <button
                    ref={triggerRef}
                    type="button"
                    id={`${id}MenuTrigger`}
                    className={`select filter-chip m3-menu-trigger${isFiltered ? ' is-filtered' : ''}${isOpen ? ' open' : ''}`}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-label={`${label}: ${selectedOption?.label || label}`}
                    onClick={onToggle}
                    onKeyDown={handleTriggerKeyDown}
                >
                    <span className="m3-chip-label">{selectedOption?.label || label}</span>
                    <DropdownArrowIcon open={isOpen} />
                </button>

                {isOpen && (
                    <div
                        ref={menuRef}
                        className="m3-menu"
                        role="menu"
                        aria-labelledby={`${id}MenuTrigger`}
                        onKeyDown={handleMenuKeyDown}
                    >
                        <div role="group" aria-label={label}>
                            {options.map(option => {
                                const isSelected = option.value === value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="menuitemradio"
                                        aria-checked={isSelected}
                                        className={`m3-menu-item${isSelected ? ' selected' : ''}`}
                                        onClick={() => {
                                            onSelect(option.value);
                                            onClose();
                                            triggerRef.current?.focus({ preventScroll: true });
                                        }}
                                    >
                                        <span className="m3-menu-item-text">{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }
);
