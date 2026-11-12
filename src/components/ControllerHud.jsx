import { memo } from 'react';

const HUD_PROFILES = {
    xbox: {
        deviceLabel: 'Xbox',
        collectBadge: 'B',
        masterBadge: 'Y',
        isGamepad: true,
    },
    playstation: {
        deviceLabel: 'PlayStation',
        collectBadge: '○',
        masterBadge: '△',
        isGamepad: true,
    },
    switch: {
        deviceLabel: 'Switch',
        collectBadge: 'A',
        masterBadge: 'X',
        isGamepad: true,
    },
    keyboard: {
        deviceLabel: 'Teclado',
        collectBadge: 'Enter',
        masterBadge: 'D',
        isGamepad: false,
    },
};

function GamepadIcon() {
    return (
        <svg
            className="controller-hud-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <line x1="6" y1="12" x2="10" y2="12" />
            <line x1="8" y1="10" x2="8" y2="14" />
            <line x1="15" y1="13" x2="15.01" y2="13" />
            <line x1="18" y1="11" x2="18.01" y2="11" />
            <rect x="2" y="6" width="20" height="12" rx="5" />
        </svg>
    );
}

function KeyboardIcon() {
    return (
        <svg
            className="controller-hud-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
            <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
        </svg>
    );
}

export const ControllerHud = memo(function ControllerHud({ gamepadInfo, inputMode, viewMode }) {
    if (import.meta.env.MODE === 'test' && typeof window !== 'undefined') {
        window.__recordPerfRender?.('controllerHud');
    }

    if (viewMode) return null;

    const isGamepadActive = Boolean(gamepadInfo?.connected);
    const activeMode = isGamepadActive
        ? gamepadInfo.type || 'xbox'
        : inputMode === 'keyboard'
          ? 'keyboard'
          : null;

    if (!activeMode) return null;

    const profile = HUD_PROFILES[activeMode] || HUD_PROFILES.xbox;

    return (
        <aside
            className={`controller-hud controller-hud-${activeMode}`}
            aria-label={`Comandos de ${profile.deviceLabel}`}
        >
            <div className="controller-hud-device" title={profile.deviceLabel}>
                {profile.isGamepad ? <GamepadIcon /> : <KeyboardIcon />}
                <span className="controller-hud-device-name">{profile.deviceLabel}</span>
            </div>

            <div className="controller-hud-divider" aria-hidden="true" />

            <div className="controller-hud-command">
                <kbd className={`controller-badge badge-${activeMode}-collect`}>
                    {profile.collectBadge}
                </kbd>
                <span className="controller-command-label">Coletar</span>
            </div>

            <div className="controller-hud-command">
                <kbd className={`controller-badge badge-${activeMode}-master`}>
                    {profile.masterBadge}
                </kbd>
                <span className="controller-command-label">Dominar</span>
            </div>
        </aside>
    );
});

