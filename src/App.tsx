import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Map as MapIcon, Waves, Mountain, MapPin, RefreshCw, ChevronLeft, Info } from 'lucide-react';
import { SpainMap } from './components/SpainMap';
import { EducationalResources } from './components/EducationalResources';
import { GameMode, GameState, GeoElement } from './types';
import { COMMUNITIES, PROVINCES } from './data';

const MODES: { id: GameMode; label: string; icon: any; color: string }[] = [
  { id: 'communities', label: 'Comunidades Autónomas', icon: MapIcon, color: 'bg-orange-500' },
  { id: 'provinces', label: 'Provincias de España', icon: MapPin, color: 'bg-blue-500' },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    mode: null,
    score: 0,
    total: 0,
    currentTarget: null,
    remainingTargets: [],
    feedback: null,
    isGameOver: false,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  const startGame = (mode: GameMode) => {
    let targets: GeoElement[] = [];
    switch (mode) {
      case 'communities': targets = [...COMMUNITIES]; break;
      case 'provinces': targets = [...PROVINCES]; break;
      default: targets = [];
    }

    // Shuffle targets
    const shuffled = [...targets].sort(() => Math.random() - 0.5);
    
    setGameState({
      mode,
      score: 0,
      total: shuffled.length,
      currentTarget: shuffled[0],
      remainingTargets: shuffled.slice(1),
      failedTargets: [],
      feedback: null,
      isGameOver: false,
    });
    setSelectedId(null);
  };

  const handleSelect = (id: string) => {
    if (gameState.feedback || gameState.isGameOver || !gameState.currentTarget) return;

    setSelectedId(id);
    
    const targetName = gameState.currentTarget.name.toLowerCase();
    const selectedName = id.toLowerCase();
    
    // Normalize names for better matching (remove accents, common prefixes, hyphens, and conjunctions)
    const normalize = (str: string) => str
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/comunidad autonoma de /g, "")
      .replace(/comunidad de /g, "")
      .replace(/principado de /g, "")
      .replace(/region de /g, "")
      .replace(/islas /g, "")
      .replace(/\by\b/g, " ") // Remove "y" as a standalone word
      .replace(/\be\b/g, " ") // Remove "e" as a standalone word
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const normTarget = normalize(targetName);
    const normSelected = normalize(selectedName);

    const isCorrect = normSelected.includes(normTarget) || 
                      normTarget.includes(normSelected) ||
                      id === gameState.currentTarget.id;

    if (isCorrect) {
      setGameState(prev => ({ ...prev, feedback: 'correct', score: prev.score + 1 }));
      setTimeout(nextTurn, 1000);
    } else {
      setGameState(prev => ({ 
        ...prev, 
        feedback: 'wrong', 
        failedTargets: [...prev.failedTargets, prev.currentTarget!] 
      }));
      setTimeout(nextTurn, 1500);
    }
  };

  const nextTurn = () => {
    setGameState(prev => {
      if (prev.remainingTargets.length === 0) {
        return { ...prev, isGameOver: true, feedback: null };
      }
      return {
        ...prev,
        currentTarget: prev.remainingTargets[0],
        remainingTargets: prev.remainingTargets.slice(1),
        feedback: null,
      };
    });
    setSelectedId(null);
  };

  const resetGame = () => {
    setGameState({
      mode: null,
      score: 0,
      total: 0,
      currentTarget: null,
      remainingTargets: [],
      failedTargets: [],
      feedback: null,
      isGameOver: false,
    });
    setSelectedId(null);
    setShowDocs(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={resetGame}
            className="bg-orange-500 p-2 rounded-lg text-white hover:bg-orange-600 transition-colors"
          >
            <MapIcon size={24} />
          </button>
          <h1 className={`text-xl font-display font-bold text-slate-800 transition-opacity duration-500 ${gameState.mode || showDocs ? 'opacity-100' : 'opacity-0'}`}>
            Explora España
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {gameState.mode && !gameState.isGameOver && (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Puntuación</span>
                <span className="text-2xl font-display font-black text-orange-500">{gameState.score} / {gameState.total}</span>
              </div>
              <button 
                onClick={resetGame}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                title="Reiniciar juego"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          )}
          
          {!gameState.mode && !showDocs && (
            <button 
              onClick={() => setShowDocs(true)}
              className="p-2 hover:bg-indigo-50 rounded-full transition-colors text-indigo-500 flex items-center gap-2 font-bold"
              title="Información educativa"
            >
              <Info size={24} />
              <span className="hidden sm:inline">Info</span>
            </button>
          )}
        </div>
      </header>

      <main className={`flex-1 flex flex-col items-center relative max-w-7xl mx-auto w-full ${gameState.mode && !gameState.isGameOver ? 'min-h-[calc(100vh-80px)]' : 'p-6 justify-center'}`}>
        <AnimatePresence mode="wait">
          {showDocs ? (
            <motion.div
              key="docs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-full max-w-4xl flex justify-start mb-4">
                <button 
                  onClick={() => setShowDocs(false)}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors"
                >
                  <ChevronLeft size={20} />
                  Volver al inicio
                </button>
              </div>
              <EducationalResources />
            </motion.div>
          ) : !gameState.mode ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-12 w-full max-w-4xl"
            >
              <div className="text-center max-w-2xl">
                <motion.h2 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-7xl md:text-8xl font-display font-black text-slate-800 mb-6 tracking-tight"
                >
                  Explora <span className="text-orange-500">España</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-500 text-xl md:text-2xl font-medium"
                >
                  Un viaje interactivo para descubrir las comunidades y provincias de nuestro país.
                </motion.p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => startGame(mode.id)}
                    className="group relative bg-white p-12 rounded-[2.5rem] shadow-sm border-2 border-transparent hover:border-orange-500 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center gap-6"
                  >
                    <div className={`${mode.color} p-6 rounded-3xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <mode.icon size={48} />
                    </div>
                    <span className="text-2xl font-display font-bold text-slate-700">{mode.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : gameState.isGameOver ? (
            <motion.div 
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-orange-100 flex flex-col items-center text-center gap-6 max-w-2xl w-full"
            >
              <div className="bg-yellow-400 p-6 rounded-full text-white shadow-lg">
                <Trophy size={64} />
              </div>
              <div>
                <h2 className="text-4xl font-display font-black text-slate-800">¡Buen trabajo!</h2>
                <p className="text-slate-500 mt-2 text-lg">Has completado el mapa de {MODES.find(m => m.id === gameState.mode)?.label}</p>
              </div>
              
              <div className="flex items-center gap-8 w-full justify-center">
                <div className="text-6xl font-display font-black text-orange-500">
                  {Math.round((gameState.score / gameState.total) * 100)}%
                </div>
                <div className="h-12 w-px bg-slate-200"></div>
                <div className="text-left">
                  <div className="text-slate-400 text-sm font-bold uppercase tracking-widest">Aciertos</div>
                  <div className="text-2xl font-display font-black text-slate-700">{gameState.score} / {gameState.total}</div>
                </div>
              </div>

              {gameState.failedTargets.length > 0 && (
                <div className="w-full mt-4 text-left">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Repasa estas zonas:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {gameState.failedTargets.map((target, idx) => (
                      <span 
                        key={idx} 
                        className="bg-red-50 px-4 py-2 rounded-xl text-red-600 font-bold text-sm border border-red-100"
                      >
                        {target.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={resetGame}
                className="mt-6 bg-orange-500 text-white px-12 py-5 rounded-2xl font-display font-bold text-2xl hover:bg-orange-600 hover:scale-105 transition-all shadow-xl shadow-orange-200"
              >
                Volver al menú
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex-1 flex flex-col gap-4 p-4 min-h-[600px]"
            >
              <div className="flex items-center justify-between w-full shrink-0">
                <button 
                  onClick={resetGame}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors"
                >
                  <ChevronLeft size={20} />
                  Atrás
                </button>
                
                <div className="flex-1 flex justify-center">
                  <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Busca en el mapa:</span>
                    <span className="text-2xl md:text-3xl font-display font-black text-slate-800 leading-none">
                      {gameState.currentTarget?.name === 'País Vasco' ? 'País Vasco / Euskadi' : 
                       gameState.currentTarget?.name === 'Cataluña' ? 'Cataluña / Catalunya' : 
                       gameState.currentTarget?.name}
                    </span>
                  </div>
                </div>
                
                <div className="w-24"></div> {/* Spacer */}
              </div>

              <div className="flex-1 relative w-full h-full overflow-hidden rounded-3xl bg-white/50 border border-slate-100">
                <SpainMap 
                  mode={gameState.mode} 
                  currentTarget={gameState.currentTarget}
                  onSelect={handleSelect}
                  feedback={gameState.feedback}
                  selectedId={selectedId}
                />

                <AnimatePresence>
                  {gameState.feedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 px-8 py-4 rounded-2xl font-display font-black text-4xl shadow-2xl ${
                        gameState.feedback === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {gameState.feedback === 'correct' ? '¡GENIAL!' : '¡OH NO!'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Tips */}
      {!gameState.mode && !showDocs && (
        <footer className="p-8 text-center text-slate-400 text-sm w-full border-t border-slate-100 shrink-0">
          Desarrollado para mentes curiosas • Geografía de España 2024 • Recursos Educativos para Primaria
        </footer>
      )}
    </div>
  );
}
