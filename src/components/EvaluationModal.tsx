import React from 'react';
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  FileCheck2,
  ShieldAlert,
  Sparkles,
  X
} from 'lucide-react';
import { AuditReport } from '../types';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: AuditReport;
  onJumpToQuestion: (qId: string) => void;
  onFinishSession: () => void;
  onFillTestData: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  audit,
  onJumpToQuestion,
  onFinishSession,
  onFillTestData
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-12 sm:pt-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="bg-[#171717] text-white p-5 border-b-4 border-[#D7192B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D7192B] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-widest text-[#f55364]">
                Auditoría de Calidad Diagnóstica
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                Evaluación del Estado de Reactivos
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Modal */}
        <div className="p-6 overflow-y-auto space-y-6 text-gray-800">
          {/* Banner de Estado */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              audit.isReady
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
            }`}
          >
            {audit.isReady ? (
              <CircleCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <CircleAlert className="w-6 h-6 text-[#D7192B] shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-extrabold text-sm sm:text-base">
                {audit.isReady
                  ? '✓ Todos los reactivos pertinentes han sido completados'
                  : `⚠ Se detectaron ${audit.pendingCount} reactivos pendientes de respuesta`}
              </div>
              <p className="text-xs mt-1 text-gray-700 leading-relaxed">
                {audit.isReady
                  ? 'La sesión cumple los estándares de pertinencia metodológica BMS. Puedes finalizar la evaluación para generar el análisis estratégico y los reportes.'
                  : 'Para garantizar la solidez de las hipótesis y correlaciones estratégicas, responde o marca como N/A las preguntas indicadas a continuación.'}
              </p>
            </div>
          </div>

          {/* Métricas Principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center">
              <div className="text-2xl font-black text-gray-900">{audit.totalActive}</div>
              <div className="text-[10px] uppercase font-bold text-gray-500 mt-1">
                Reactivos Activos
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center">
              <div className="text-2xl font-black text-emerald-700">{audit.answeredCount}</div>
              <div className="text-[10px] uppercase font-bold text-gray-500 mt-1">Respondidos</div>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center">
              <div className="text-2xl font-black text-gray-600">{audit.naCount}</div>
              <div className="text-[10px] uppercase font-bold text-gray-500 mt-1">No Aplica (N/A)</div>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center">
              <div
                className={`text-2xl font-black ${
                  audit.pendingCount > 0 ? 'text-[#D7192B]' : 'text-emerald-700'
                }`}
              >
                {audit.pendingCount}
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-500 mt-1">Pendientes</div>
            </div>
          </div>

          {/* Consistencia y antisesgo */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldAlert
                  className={`w-5 h-5 ${
                    audit.consistencyScore >= 80
                      ? 'text-emerald-600'
                      : audit.consistencyScore >= 50
                      ? 'text-amber-600'
                      : 'text-[#D7192B]'
                  }`}
                />
                <div>
                  <div className="text-[10px] font-black tracking-wider uppercase text-gray-500">
                    Filtro Antisesgo Metodológico
                  </div>
                  <div className="text-sm font-black text-gray-900">
                    Consistencia Declarativa: {audit.consistencyScore}%
                  </div>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-[11px] font-black ${
                  audit.contradictionCount === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {audit.contradictionCount === 0
                  ? '✓ Respuestas Coherentes'
                  : `⚠ ${audit.contradictionCount} Contradicciones Detectadas`}
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {audit.contradictionCount === 0
                ? 'No se identificaron inconsistencias directas entre las declaraciones y la estructura operativa.'
                : 'El sistema detectó discrepancias entre lo que el cliente declara desear/tener y la evidencia operativa reportada. La consultoría debe enfocarse en la evidencia real.'}
            </p>
          </div>

          {/* Desglose */}
          <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4">
            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-gray-500" />
              Desglose de Arquitectura de Preguntas
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg">
                <span className="font-semibold text-gray-700">Preguntas Núcleo:</span>
                <span className="font-bold text-gray-900">
                  {audit.coreCompleted} de {audit.coreTotal} (
                  {Math.round((audit.coreCompleted / audit.coreTotal) * 100)}%)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg">
                <span className="font-semibold text-gray-700">Condicionales activadas:</span>
                <span className="font-bold text-amber-800">
                  {audit.conditionalCompleted} de {audit.conditionalActiveCount}
                </span>
              </div>
            </div>
          </div>

          {/* Lista de preguntas pendientes */}
          {audit.pendingQuestions.length > 0 && (
            <div>
              <div className="text-xs font-bold text-[#D7192B] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Reactivos que requieren atención ({audit.pendingQuestions.length}):</span>
                <span className="text-[10px] text-gray-500 font-normal">Haz clic para responder</span>
              </div>
              <div className="divide-y divide-gray-100 border border-rose-200 rounded-xl bg-rose-50/20 max-h-56 overflow-y-auto">
                {audit.pendingQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-rose-50/70 transition-all"
                  >
                    <div className="text-xs">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-[#D7192B] font-mono text-[10px]">
                          {q.id}
                        </span>
                        <span>{q.section}</span>
                      </div>
                      <div className="text-gray-600 line-clamp-1 mt-0.5">{q.text}</div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onJumpToQuestion(q.id);
                      }}
                      className="px-3 py-1.5 rounded-md bg-[#D7192B] text-white text-xs font-bold hover:bg-[#b91222] transition-all flex items-center gap-1 shrink-0"
                    >
                      Ir
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Señales estratégicas y contradicciones detectadas */}
          {audit.signals.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Auditoría Estratégica: Lo que el cliente declara vs. Evidencia real ({audit.signals.length})
              </div>
              <div className="space-y-3">
                {audit.signals.map((sig, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      sig.type === 'red'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-black text-sm text-gray-900">{sig.title}</span>
                      {sig.area && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/80 border border-gray-300 text-gray-700">
                          {sig.area}
                        </span>
                      )}
                    </div>

                    {sig.clientClaim && sig.evidenceFound ? (
                      <div className="space-y-2 mt-2 pt-2 border-t border-gray-200/60">
                        <div className="p-2 bg-white/90 rounded-lg border border-gray-200">
                          <span className="font-bold text-gray-700 mr-1.5">🗣️ Declaración:</span>
                          <span className="text-gray-800">{sig.clientClaim}</span>
                        </div>
                        <div className="p-2 bg-white/90 rounded-lg border border-amber-200">
                          <span className="font-bold text-amber-900 mr-1.5">🔍 Evidencia real:</span>
                          <span className="text-gray-800">{sig.evidenceFound}</span>
                        </div>
                        {sig.trueNeed && (
                          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                            <span className="font-bold text-emerald-900 mr-1.5">💡 Lo que realmente necesita:</span>
                            <span className="text-emerald-950 font-medium">{sig.trueNeed}</span>
                          </div>
                        )}
                        {sig.recommendedExercises && sig.recommendedExercises.length > 0 && (
                          <div className="text-[10px] text-gray-600 flex items-center gap-1.5 pt-0.5">
                            <span className="font-bold text-gray-700">🎯 Ejercicios BMS prioritarios:</span>
                            <span className="font-mono font-bold text-[#D7192B]">
                              {sig.recommendedExercises.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-700 text-[11px] mt-0.5">{sig.text}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onFillTestData}
            className="px-3.5 py-2 rounded-lg border border-amber-400 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5"
            title="Llenar automáticamente datos de prueba para verificar la evaluación y el reporte"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Llenar datos de prueba
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-bold bg-white hover:bg-gray-100 transition-all"
            >
              Continuar respondiendo
            </button>

            <button
              onClick={() => {
                onClose();
                onFinishSession();
              }}
              disabled={!audit.isReady}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                audit.isReady
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CircleCheck className="w-4 h-4" />
              Finalizar evaluación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
