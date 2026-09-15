import React, { useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Check,
  Copy,
  Download,
  FileDown,
  FileText,
  Lock,
  RotateCcw
} from 'lucide-react';
import { SessionState } from '../types';
import {
  calculateProgress,
  downloadFile,
  formatTime,
  generateClientOrConsultantHtml,
  generateExportJson,
  printOrDownloadPdf,
  safeFileName
} from '../utils/bmsLogic';

interface CompletionViewProps {
  state: SessionState;
  onShowResults: () => void;
  onReturnToSurvey: () => void;
  onResetSession: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  state,
  onShowResults,
  onReturnToSurvey,
  onResetSession
}) => {
  const progress = calculateProgress(state.answers, state.matrix, state.na);
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
      id="completion-view"
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 mb-8 text-center max-w-3xl mx-auto"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-sm text-3xl font-black">
        ✓
      </div>

      <div className="text-xs font-black tracking-widest text-emerald-700 uppercase mb-2">
        SESIÓN COMPLETADA
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
        ¡Has terminado la sesión de diagnóstico!
      </h2>

      <p className="text-sm text-gray-600 max-w-xl mx-auto mb-6">
        Has respondido todas las preguntas pertinentes para esta sesión de Profundización BMS.
      </p>

      {/* Tarjeta de resumen de progreso */}
      <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-5 max-w-md mx-auto mb-6">
        <div className="text-3xl sm:text-4xl font-black text-emerald-700">
          {progress.answered} / {progress.active}
        </div>
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 mt-1">
          PREGUNTAS PERTINENTES RESPONDIDAS
        </div>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto mb-6">
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="text-xl font-black text-gray-900">{progress.answered}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Respondidas</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="text-xl font-black text-gray-700">{progress.na}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">No aplica</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="text-xl font-black text-emerald-700">{progress.pending}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Pendientes</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="text-xl font-black text-gray-900">{formatTime(state.elapsedSeconds)}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Tiempo</div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
        La sesión seleccionó dinámicamente las preguntas pertinentes según las características de tu
        negocio.
        <br />
        Biblioteca BMS: <strong>100 preguntas</strong> · Núcleo: <strong>29 preguntas</strong>.
      </div>

      {/* Acciones principales */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={onShowResults}
          className="px-5 py-2.5 rounded-lg bg-[#D7192B] hover:bg-[#b91222] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <BarChart3 className="w-4 h-4" />
          Ver resultados estratégicos
        </button>

        <button
          onClick={handleDownloadJson}
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          Descargar JSON
        </button>

        <button
          onClick={handleCopyJson}
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          {copied ? '¡Copiado!' : 'Copiar JSON'}
        </button>

        <button
          onClick={handleExportClientPdf}
          className="px-4 py-2.5 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-900 text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          title="Descargar documento en PDF para el cliente"
        >
          <FileDown className="w-4 h-4 text-[#D7192B]" />
          Descargar PDF Cliente
        </button>

        <button
          onClick={handleExportConsultantPdf}
          className="px-4 py-2.5 rounded-lg border border-gray-800 text-white bg-[#171717] hover:bg-black text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          title="Descargar documento confidencial en PDF con auditoría antisesgo y notas privadas"
        >
          <Lock className="w-4 h-4 text-amber-400" />
          Descargar PDF Consultor
        </button>

        <button
          onClick={handleDownloadClientHtml}
          className="px-3 py-2 rounded-lg text-gray-500 hover:text-gray-800 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
          title="Descarga alternativa en archivo .html"
        >
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          <span>Versión HTML</span>
        </button>

        <button
          onClick={onReturnToSurvey}
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Modificar / Revisar respuestas
        </button>

        <button
          onClick={onResetSession}
          className="px-4 py-2.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-black transition-all flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          Iniciar prueba manual desde cero
        </button>
      </div>
    </section>
  );
};
