import React from 'react';
import {
  ArrowLeft,
  CircleCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface TopbarProps {
  currentIndex: number;
  totalActive: number;
  answeredCount: number;
  pendingCount: number;
  percentage: number;
  coreAnswered: number;
  coreTotal: number;
  conditionalActiveCount: number;
  onOpenEvaluation: () => void;
  activeView?: 'survey' | 'completion' | 'results';
  onReturnToSurvey?: () => void;
  onStartManualTest?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentIndex,
  totalActive,
  answeredCount,
  pendingCount,
  percentage,
  coreAnswered,
  coreTotal,
  conditionalActiveCount,
  onOpenEvaluation,
  activeView = 'survey',
  onReturnToSurvey,
  onStartManualTest
}) => {
  return (
    <header
      id="topbar-main"
      className="sticky top-0 z-40 bg-[#111111] text-white border-b-4 border-[#D7192B] shadow-md"
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D7192B] animate-pulse" />
            <div>
              <span className="font-extrabold text-sm tracking-wide text-white">
                Profundización BMS
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-gray-400 font-medium">
                · CREA Y MONETIZA™
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {activeView !== 'survey' && onReturnToSurvey && (
              <button
                onClick={onReturnToSurvey}
                className="text-xs font-bold px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 border border-white/20"
                title="Volver a ver y editar las preguntas del cuestionario"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ver Cuestionario</span>
              </button>
            )}

            {onStartManualTest && (
              <button
                onClick={onStartManualTest}
                className="text-xs font-bold px-3 py-1.5 rounded-md bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 transition-all flex items-center gap-1.5"
                title="Iniciar prueba manual desde cero (vaciar respuestas)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prueba Manual</span>
              </button>
            )}

            <button
              id="btn-top-evaluation"
              onClick={onOpenEvaluation}
              className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                pendingCount === 0
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                  : 'bg-[#D7192B] hover:bg-[#b91222] text-white shadow-sm'
              }`}
              title="Verificar estado de los reactivos antes de finalizar"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Realizar evaluación</span>
              <span className="sm:hidden">Evaluar</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-black/30">
                {pendingCount === 0 ? '✓ Listo' : `${pendingCount} pend.`}
              </span>
            </button>

            <div className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              {pendingCount === 0 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CircleCheck className="w-3.5 h-3.5" /> 100% Completo
                </span>
              ) : (
                <span>
                  <strong className="text-white">{answeredCount}</strong> respondidas ·{' '}
                  <strong className="text-rose-400">{pendingCount}</strong> pendientes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden mt-2.5">
          <div
            id="top-progress-bar-fill"
            className="h-full bg-gradient-to-r from-[#D7192B] to-[#f23d4f] transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>

        <div className="grid grid-cols-3 text-[10px] text-gray-400 mt-1.5 font-medium">
          <div>
            Pregunta {Math.min(currentIndex + 1, totalActive)} de {totalActive} ·{' '}
            <span className="text-gray-200 font-bold">{percentage}%</span> completado
          </div>
          <div className="text-center">
            Núcleo: <span className="text-gray-200 font-bold">{coreAnswered}</span> / {coreTotal}
          </div>
          <div className="text-right">
            Condicionales activas:{' '}
            <span className="text-amber-400 font-bold">{conditionalActiveCount}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
