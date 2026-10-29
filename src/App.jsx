import { useState, useMemo, useEffect, useCallback } from 'react';
import { baseSprites } from './data/sprites-data.js';
import { useTrackerState } from './hooks/useTrackerState.js';
import { Header } from './components/Header.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { SpriteCard } from './components/SpriteCard.jsx';
import { CodesPage } from './components/CodesPage.jsx';
import { exportImage, generateTradeText, generateTradeGridText } from './view-export.js';
import { compressCollection } from './share-codec.js';
import { toast, copyText } from './dom-utils.js';

function getInitialPage() {
    if (
        window.location.pathname.endsWith('/codes.html') ||
        window.location.hash === '#codes' ||
        new URLSearchParams(window.location.search).get('page') === 'codes'
    ) {
        return 'codes';
    }
    return 'catalog';
}

export default function App() {
    const [currentPage, setCurrentPage] = useState(getInitialPage);

    const {
        obtained,
        mastered,
        viewMode,
        filters,
        settings,
        trackerState,
        activeThemes,
        visibleSprites,
        progressStats,
        toggleObtained,
        toggleMastery,
        updateFilter,
        updateSetting,
        importCollection,
        exitViewMode,
    } = useTrackerState(baseSprites);

    // Conjuntos O(1) para verificar rapidamente se cada card foi coletado/dominado
    const obtainedSet = useMemo(() => new Set(obtained), [obtained]);
    const masteredSet = useMemo(() => new Set(mastered), [mastered]);

    // Sincroniza navegação pelo botão Voltar/Avançar do navegador
    useEffect(() => {
        const handlePopState = () => {
            setCurrentPage(getInitialPage());
        };
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('hashchange', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('hashchange', handlePopState);
        };
    }, []);

    const navigateToCodes = useCallback(() => {
        window.history.pushState({}, '', '#codes');
        setCurrentPage('codes');
    }, []);

    const navigateToCatalog = useCallback(() => {
        if (window.location.pathname.endsWith('/codes.html')) {
            window.location.href = './index.html';
            return;
        }
        window.history.pushState({}, '', window.location.pathname + window.location.search);
        setCurrentPage('catalog');
    }, []);

    const handleExportImage = useCallback(
        mode => {
            exportImage(mode, trackerState, baseSprites);
        },
        [trackerState]
    );

    const handleCopyTradeText = useCallback(() => {
        copyText(
            generateTradeText(trackerState, baseSprites),
            'Lista de trocas copiada para a área de transferência!',
            'Falha ao copiar lista de trocas'
        );
    }, [trackerState]);

    const handleCopyTradeGrid = useCallback(() => {
        copyText(
            generateTradeGridText(trackerState, baseSprites),
            'Grelha de trocas copiada para a área de transferência!',
            'Falha ao copiar grelha de trocas'
        );
    }, [trackerState]);

    const handleExportBackup = useCallback(() => {
        const data = { obtained, mastered };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'fnsprites-backup.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast('Backup exportado com sucesso!', 'success');
    }, [obtained, mastered]);

    const handleImportBackupFile = useCallback(
        file => {
            if (viewMode) {
                toast('Não é possível importar no modo somente leitura!', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data || !Array.isArray(data.obtained) || !Array.isArray(data.mastered)) {
                        throw new Error('Invalid backup file format');
                    }
                    importCollection(data.obtained, data.mastered);
                    toast('Coleção importada com sucesso!', 'success');
                } catch (err) {
                    toast('Falha ao importar: formato JSON inválido', 'error');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        },
        [viewMode, importCollection]
    );

    const handleShare = useCallback(async () => {
        const code = await compressCollection(obtained, mastered);
        const url = `${window.location.origin}${window.location.pathname}?c=${code}`;
        copyText(url, 'Link compartilhado!', 'Falha ao compartilhar');
    }, [obtained, mastered]);

    if (currentPage === 'codes') {
        return <CodesPage onBack={navigateToCatalog} />;
    }

    return (
        <>
            {viewMode && (
                <div className="banner" id="viewBanner">
                    <span>
                        Visualizando uma coleção compartilhada - exibindo apenas pituchinhos
                        coletados.
                    </span>
                    <a
                        href="index.html"
                        onClick={e => {
                            e.preventDefault();
                            exitViewMode();
                        }}
                    >
                        Ir para meu rastreador
                    </a>
                </div>
            )}

            <div className="app">
                <Header progressStats={progressStats} />

                <FilterBar
                    filters={filters}
                    settings={settings}
                    activeThemes={activeThemes}
                    viewMode={viewMode}
                    onFilterChange={updateFilter}
                    onSettingChange={updateSetting}
                    onExportImage={handleExportImage}
                    onCopyTradeText={handleCopyTradeText}
                    onCopyTradeGrid={handleCopyTradeGrid}
                    onExportBackup={handleExportBackup}
                    onImportBackupFile={handleImportBackupFile}
                    onShare={handleShare}
                    onOpenCodes={navigateToCodes}
                />

                <main className="grid" id="spriteGrid" aria-label="Coleção de pituchinhos">
                    {visibleSprites.map(sprite => (
                        <SpriteCard
                            key={sprite.id}
                            sprite={sprite}
                            obtained={obtainedSet.has(sprite.id)}
                            mastered={masteredSet.has(sprite.id)}
                            viewMode={viewMode}
                            onToggleObtained={toggleObtained}
                            onToggleMastery={toggleMastery}
                        />
                    ))}
                </main>
            </div>

            <footer className="footer">
                <p>
                    Fortnite and its materials (Sprites and Data) are trademarks and copyrights of
                    Epic Games, Inc. This website is not endorsed or affilliated with Epic Games,
                    Inc..
                </p>
            </footer>
        </>
    );
}
