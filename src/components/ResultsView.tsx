import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CircleAlert,
  CircleCheck,
  Copy,
  Download,
  FileDown,
  FileText,
  Lock,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { SessionState } from '../types';
import {
  calculateProgress,
  downloadFile,
  evaluateSignals,
  formatAnswer,
  generateClientOrConsultantHtml,
  generateExportJson,
  getActiveQuestions,
  isQuestionAnswered,
  isQuestionNA,
  printOrDownloadPdf,
  safeFileName
} from '../utils/bmsLogic';
import { CORE_TOTAL, REFERENCE_LIBRARY_COUNT } from '../data/questions';

interface ResultsViewProps {
  state: SessionState;
  onReturnToSurvey: () => void;
  onResetSession: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  state,
  onReturnToSurvey,
  onResetSession
}) => {
  const progress = calculateProgress(state.answers, state.matrix, state.na);
  const activeQuestions = getActiveQuestions(state.answers);
  const signals = evaluateSignals(state);
  const [copied, setCopied] = useState(false);

  const handleDownloadJson = () => {
    const doc = generateExportJson(state);
    const jsonStr = JSON.stringify(doc, null, 2);
    downloadFile(jsonStr, `${safeFileName(state.clientName)}.json`, 'application/json;charset=utf-8');
  };

  const handleCopyJson = async () => {
    const doc = generateExportJson(state);
    const jsonStr = JSON.stringify(doc, null, 2);
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = jsonStr;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportClientPdf = () => {
    printOrDownloadPdf(state, false);
  };

  const handleExportConsultantPdf = () => {
    printOrDownloadPdf(state, true);
  };

  const handleDownloadClientHtml = () => {
    const html = generateClientOrConsultantHtml(state, false);
    downloadFile(html, `${safeFileName(state.clientName)}_Cliente.html`, 'text/html;charset=utf-8');
  };

  const handleDownloadConsultantHtml = () => {
    const html = generateClientOrConsultantHtml(state, true);
    downloadFile(
      html,
      `${safeFileName(state.clientName)}_Consultor.html`,
      'text/html;charset=utf-8'
    );
  };

  return (
    <section
      id="results-view"
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-10 mb-8 max-w-5xl mx-auto"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="text-xs font-black tracking-widest text-[#D7192B] uppercase">
            RESUMEN ESTRATÉGICO
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            Resultados de la Profundización BMS
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onReturnToSurvey}
            className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la encuesta
          </button>
          <button
            onClick={onResetSession}
            className="px-3.5 py-2 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-black transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar prueba manual
          </button>
        </div>
      </div>

      {/* Barra de Descargas y Exportación Estratégica */}
      <div className="my-5 p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs">
          <div className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">
            Exportar Resultados & Análisis
          </div>
          <div className="text-gray-500 text-[11px] mt-0.5">
            Genera los entregables en formato PDF de alta fidelidad o exporta en JSON para análisis computacional.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportClientPdf}
            className="px-3.5 py-2 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-900 text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Exportar documento en PDF para el cliente"
          >
            <FileDown className="w-4 h-4 text-[#D7192B]" />
            <span>Descargar PDF Cliente</span>
          </button>

          <button
            onClick={handleExportConsultantPdf}
            className="px-3.5 py-2 rounded-lg bg-[#171717] hover:bg-black text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm border border-gray-800 cursor-pointer"
            title="Exportar documento confidencial en PDF con auditoría antisesgo y notas privadas"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Descargar PDF Consultor</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Descargar datos en formato JSON para análisis"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Descargar JSON</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Copiar JSON de la sesión al portapapeles"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
            <span>{copied ? '¡Copiado!' : 'Copiar JSON'}</span>
          </button>

          <button
            onClick={handleDownloadClientHtml}
            className="px-2.5 py-2 text-gray-500 hover:text-gray-800 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
            title="Descarga alternativa en formato .html"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span>Versión HTML</span>
          </button>
        </div>
      </div>

      {/* Banner de estado de la sesión */}
      <div
        className={`my-5 p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
          progress.pending === 0
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}
      >
        <div className="font-black flex items-center gap-2 mb-1">
          {progress.pending === 0 ? (
            <CircleCheck className="w-4 h-4 text-emerald-600" />
          ) : (
            <CircleAlert className="w-4 h-4 text-amber-600" />
          )}
          {progress.pending === 0
            ? 'Sesión de profundización completada con éxito'
            : 'Sesión con preguntas pendientes'}
        </div>
        <div>
          <strong>{progress.answered}</strong> de <strong>{progress.active}</strong> preguntas
          pertinentes respondidas · <strong>{progress.na}</strong> no aplicables ·{' '}
          <strong>{progress.pending}</strong> pendientes.
        </div>
      </div>

      {/* Bloque antisesgo y señales */}
      <div className="my-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b-2 border-[#D7192B]">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            Auditoría Antisesgo: Lo que el cliente declara vs. Evidencia real
          </h3>
          <span className="text-xs text-gray-500 font-bold">
            {signals.length} {signals.length === 1 ? 'señal detectada' : 'señales detectadas'}
          </span>
        </div>

        {signals.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Sin inconsistencias automáticas detectadas.</strong>
              <div className="text-gray-600 mt-0.5">
                Las respuestas muestran alta coherencia interna inicial. Esto no sustituye el
                análisis cualitativo holístico del consultor.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {signals.map((sig, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-l-4 text-xs leading-relaxed shadow-xs ${
                  sig.type === 'red'
                    ? 'border-l-[#D7192B] bg-rose-50/50 border-gray-200'
                    : 'border-l-amber-500 bg-amber-50/50 border-gray-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-black text-sm text-gray-900">{sig.title}</span>
                  {sig.area && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-gray-300 text-gray-700">
                      {sig.area}
                    </span>
                  )}
                </div>

                {sig.clientClaim && sig.evidenceFound ? (
                  <div className="space-y-2 mt-2">
                    <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-700 mr-1.5">🗣️ Declaración del cliente:</span>
                      <span className="text-gray-800">{sig.clientClaim}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                      <span className="font-bold text-amber-900 mr-1.5">🔍 Evidencia operativa detectada:</span>
                      <span className="text-gray-800">{sig.evidenceFound}</span>
                    </div>
                    {sig.trueNeed && (
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="font-bold text-emerald-900 mr-1.5">💡 Lo que REALMENTE necesita:</span>
                        <span className="text-emerald-950 font-medium">{sig.trueNeed}</span>
                      </div>
                    )}
                    {sig.recommendedExercises && sig.recommendedExercises.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                        <span className="font-bold text-gray-700">🎯 Ejercicios BMS prioritarios:</span>
                        <span className="font-mono font-bold text-[#D7192B] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {sig.recommendedExercises.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-800">{sig.text}</div>
                )}

                {sig.source && sig.source.length > 0 && (
                  <div className="mt-2 text-[10px] text-gray-500">
                    Fuentes evaluadas: {sig.source.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Métricas de la sesión */}
      <div className="my-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b-2 border-[#D7192B]">
          Métricas de la Sesión
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="p-3 font-medium text-gray-600">Preguntas núcleo</td>
                <td className="p-3 font-bold text-gray-900">{CORE_TOTAL}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-gray-600">Condicionales activas</td>
                <td className="p-3 font-bold text-gray-900">{progress.active - CORE_TOTAL}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-gray-600">Total preguntas activas evaluadas</td>
                <td className="p-3 font-bold text-gray-900">{progress.active}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-gray-600">Respondidas</td>
                <td className="p-3 font-bold text-emerald-700">{progress.answered}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-gray-600">Marcadas como No Aplica</td>
                <td className="p-3 font-bold text-gray-600">{progress.na}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-gray-600">Pendientes</td>
                <td className="p-3 font-bold text-rose-600">{progress.pending}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-gray-600">Biblioteca de referencia BMS</td>
                <td className="p-3 font-bold text-gray-900">{REFERENCE_LIBRARY_COUNT}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla detallada de preguntas y respuestas */}
      <div className="my-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b-2 border-[#D7192B]">
          Preguntas Trabajadas y Respuestas
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-2.5 border-b">#</th>
                <th className="p-2.5 border-b">ID</th>
                <th className="p-2.5 border-b">Pregunta</th>
                <th className="p-2.5 border-b">Estado</th>
                <th className="p-2.5 border-b">Respuesta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {activeQuestions.map((q, idx) => {
                const isNA = isQuestionNA(q, state.na);
                const isAnswered = isQuestionAnswered(q, state.answers, state.matrix, state.na);
                return (
                  <tr key={q.id} className="hover:bg-gray-50/70">
                    <td className="p-2.5 text-gray-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold font-mono text-[#D7192B] whitespace-nowrap">
                      {q.id}
                    </td>
                    <td className="p-2.5 font-medium text-gray-800 max-w-xs">{q.text}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isNA
                            ? 'bg-gray-100 text-gray-600'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isNA ? 'No aplica' : isAnswered ? 'Respondida' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-700 max-w-sm">{formatAnswer(q, state)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
