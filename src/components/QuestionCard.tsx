import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  Lock,
  Sparkles,
  TriangleAlert,
  Check
} from 'lucide-react';
import { Question, SessionState } from '../types';
import { ensureArray, isQuestionNA, isQuestionHandled } from '../utils/bmsLogic';

interface QuestionCardProps {
  question: Question;
  index: number;
  totalActive: number;
  state: SessionState;
  onSetSingleAnswer: (qId: string, value: string) => void;
  onToggleMultiAnswer: (qId: string, value: string, checked: boolean) => void;
  onSetOpenAnswer: (qId: string, value: string) => void;
  onSetMatrixValue: (qId: string, solution: string, func: string) => void;
  onSetNA: (qId: string, isNA: boolean) => void;
  onUpdateField: (
    field: 'additionalInfo' | 'evidence' | 'observations' | 'privateNotes',
    qId: string,
    value: string
  ) => void;
  onPrevious: () => void;
  onNext: () => void;
  onOpenEvaluation: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  totalActive,
  state,
  onSetSingleAnswer,
  onToggleMultiAnswer,
  onSetOpenAnswer,
  onSetMatrixValue,
  onSetNA,
  onUpdateField,
  onPrevious,
  onNext,
  onOpenEvaluation
}) => {
  const isNA = isQuestionNA(question, state.na);
  const isAnswered = isQuestionHandled(question, state.answers, state.matrix, state.na);
  const isConditional = !!question.trigger;

  const matrixSolutions =
    question.type === 'matrix' && question.dependsOn
      ? ensureArray(state.answers[question.dependsOn])
      : [];
  const matrixValues = state.matrix[question.id] || {};

  return (
    <article
      id={`question-card-${question.id}`}
      className={`bg-white rounded-xl shadow-sm border ${
        isConditional
          ? 'border-amber-300 border-l-[6px] border-l-amber-400'
          : 'border-gray-200'
      } p-6 sm:p-8 mb-6 transition-all`}
    >
      {/* Header del reactivo */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#D7192B] uppercase tracking-wider">
              Pregunta {index + 1} de {totalActive} · {question.id}
            </span>
            {isConditional && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                <TriangleAlert className="w-3 h-3 text-amber-600" />
                Condicional activa
              </span>
            )}
            {isAnswered && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3 text-emerald-600" />
                Respondida
              </span>
            )}
          </div>
          <div className="text-xs font-semibold text-gray-500 mt-1">{question.section}</div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200">
            {question.type === 'single'
              ? 'SELECCIÓN ÚNICA'
              : question.type === 'multi'
              ? 'SELECCIÓN MÚLTIPLE'
              : question.type === 'matrix'
              ? 'MATRIZ DE SOLUCIONES'
              : 'RESPUESTA ABIERTA'}
          </span>
        </div>
      </div>

      {/* Título de la pregunta */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 my-4 leading-snug">
        {question.text}
      </h2>

      {/* Ayuda */}
      {question.help && (
        <div className="mb-4 p-3 bg-gray-50 border-l-2 border-gray-400 rounded text-xs text-gray-600 leading-relaxed flex items-start gap-2">
          <CircleHelp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <span>{question.help}</span>
        </div>
      )}

      {/* Ejemplo */}
      {question.example && (
        <div className="mb-4 text-xs text-gray-500 italic">{question.example}</div>
      )}

      {/* Control de respuesta */}
      <div className="my-5">
        {question.type === 'single' && question.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {question.options.map((opt) => {
              const isSelected = state.answers[question.id] === opt;
              return (
                <label
                  key={opt}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#D7192B] bg-rose-50/70 text-gray-900 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={opt}
                    checked={isSelected}
                    onChange={() => onSetSingleAnswer(question.id, opt)}
                    className="mt-0.5 accent-[#D7192B] cursor-pointer"
                  />
                  <span className="leading-snug">{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {question.type === 'multi' && question.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {question.options.map((opt) => {
              const currentArray = ensureArray(state.answers[question.id]);
              const isChecked = currentArray.includes(opt);
              return (
                <label
                  key={opt}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                    isChecked
                      ? 'border-[#D7192B] bg-rose-50/70 text-gray-900 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 text-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={opt}
                    checked={isChecked}
                    onChange={(e) => onToggleMultiAnswer(question.id, opt, e.target.checked)}
                    className="mt-0.5 accent-[#D7192B] cursor-pointer rounded"
                  />
                  <span className="leading-snug">{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {question.type === 'open' && (
          <div>
            <textarea
              rows={4}
              value={String(state.answers[question.id] || '')}
              onChange={(e) => onSetOpenAnswer(question.id, e.target.value)}
              placeholder={question.placeholder || 'Escribe tu respuesta aquí...'}
              className="w-full text-xs sm:text-sm border border-gray-300 rounded-lg p-3.5 focus:border-[#D7192B] focus:ring-1 focus:ring-[#D7192B] outline-none text-gray-900 placeholder-gray-400 bg-white"
            />
          </div>
        )}

        {question.type === 'matrix' && (
          <div>
            {matrixSolutions.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-xs text-gray-600">
                Selecciona primero las soluciones en{' '}
                <strong className="text-gray-900">{question.dependsOn || 'BMS-005'}</strong> para
                completar esta matriz.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3 border-b border-gray-200">Solución (de BMS-005)</th>
                      <th className="p-3 border-b border-gray-200">
                        Función estratégica en el portafolio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {matrixSolutions.map((sol) => (
                      <tr key={sol} className="hover:bg-gray-50/60">
                        <td className="p-3 font-bold text-gray-900 w-1/3">{sol}</td>
                        <td className="p-3">
                          <select
                            data-matrix-solution={sol}
                            value={matrixValues[sol] || ''}
                            onChange={(e) => onSetMatrixValue(question.id, sol, e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 text-xs text-gray-900 bg-white focus:border-[#D7192B] focus:ring-1 focus:ring-[#D7192B] outline-none"
                          >
                            <option value="">Selecciona función...</option>
                            {question.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checkbox N/A */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200/80 my-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isNA}
            onChange={(e) => onSetNA(question.id, e.target.checked)}
            className="accent-[#D7192B] rounded cursor-pointer"
          />
          <span>Esta pregunta no aplica a este caso.</span>
        </label>
        {isNA && (
          <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
            Marcada como N/A
          </span>
        )}
      </div>

      {/* Campos adicionales de profundización */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          Campos adicionales de profundización estratégica
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="border border-gray-200 rounded-lg p-3 bg-white">
            <label className="block text-[10px] font-black text-gray-600 tracking-wider uppercase mb-1.5">
              INFORMACIÓN ADICIONAL
            </label>
            <textarea
              rows={2}
              value={state.additionalInfo[question.id] || ''}
              onChange={(e) => onUpdateField('additionalInfo', question.id, e.target.value)}
              placeholder="Añade contexto, aclaraciones o información relevante..."
              className="w-full text-xs border border-gray-200 rounded p-2 text-gray-800 placeholder-gray-400 focus:border-[#D7192B] outline-none"
            />
          </div>

          <div className="border border-gray-200 rounded-lg p-3 bg-white">
            <label className="block text-[10px] font-black text-gray-600 tracking-wider uppercase mb-1.5">
              EVIDENCIA / FUENTE
            </label>
            <textarea
              rows={2}
              value={state.evidence[question.id] || ''}
              onChange={(e) => onUpdateField('evidence', question.id, e.target.value)}
              placeholder="Dashboard, CRM, documento, dato histórico, conversación, etc."
              className="w-full text-xs border border-gray-200 rounded p-2 text-gray-800 placeholder-gray-400 focus:border-[#D7192B] outline-none"
            />
          </div>

          <div className="sm:col-span-2 border border-gray-200 rounded-lg p-3 bg-white">
            <label className="block text-[10px] font-black text-gray-600 tracking-wider uppercase mb-1.5">
              OBSERVACIÓN
            </label>
            <textarea
              rows={2}
              value={state.observations[question.id] || ''}
              onChange={(e) => onUpdateField('observations', question.id, e.target.value)}
              placeholder="Observación surgida durante la sesión de diagnóstico..."
              className="w-full text-xs border border-gray-200 rounded p-2 text-gray-800 placeholder-gray-400 focus:border-[#D7192B] outline-none"
            />
          </div>

          <div className="sm:col-span-2 border border-gray-800 rounded-lg p-3 bg-[#171717] text-white">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black text-gray-200 tracking-wider uppercase flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-400" />
                NOTA PRIVADA DEL CONSULTOR (CONFIDENCIAL)
              </label>
              <span className="text-[9px] text-gray-400">Solo en documento interno</span>
            </div>
            <textarea
              rows={2}
              value={state.privateNotes[question.id] || ''}
              onChange={(e) => onUpdateField('privateNotes', question.id, e.target.value)}
              placeholder="Solo aparecerá en el documento interno del consultor..."
              className="w-full text-xs border border-gray-700 bg-[#222222] text-white placeholder-gray-500 rounded p-2 focus:border-[#D7192B] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Botones de navegación inferior */}
      <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onPrevious}
          disabled={index === 0}
          className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEvaluation}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-[#D7192B] text-[#D7192B] hover:bg-rose-50 transition-all flex items-center gap-1.5"
            title="Realizar evaluación del estado de los reactivos"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Evaluar reactivos
          </button>

          <button
            onClick={onNext}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-[#D7192B] hover:bg-[#b91222] text-white shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>{index === totalActive - 1 ? 'Revisar sesión' : 'Siguiente'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
