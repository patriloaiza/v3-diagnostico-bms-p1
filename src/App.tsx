import { useState, useEffect, useCallback, useRef } from 'react';
import { SessionState } from './types';
import { DEFAULT_CONSULTANT, STORAGE_KEY } from './data/questions';
import {
  calculateProgress,
  cleanInactiveConditionals,
  clone,
  createInitialState,
  fillTestData,
  findQuestionById,
  getActiveQuestions,
  getAuditReport,
  isQuestionHandled
} from './utils/bmsLogic';
import { Topbar } from './components/Topbar';
import { CoverHeader } from './components/CoverHeader';
import { QuestionCard } from './components/QuestionCard';
import { BottomBar } from './components/BottomBar';
import { EvaluationModal } from './components/EvaluationModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { TestModePanel } from './components/TestModePanel';
import { CompletionView } from './components/CompletionView';
import { ResultsView } from './components/ResultsView';
import { PendingQuestionsBanner } from './components/PendingQuestionsBanner';

export default function App() {
  const [session, setSession] = useState<SessionState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...createInitialState(), ...parsed };
      }
    } catch (e) {
      console.warn('Error al cargar datos previos de localStorage', e);
    }
    return createInitialState();
  });

  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isTestModeOpen, setIsTestModeOpen] = useState(false);
  const [activeView, setActiveView] = useState<'survey' | 'completion' | 'results'>(() =>
    session.finished ? 'completion' : 'survey'
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // PostMessage para comunicación con iframe en GoHighLevel (GHL)
  useEffect(() => {
    const notifyParentOfHeight = () => {
      if (window.parent && window.parent !== window) {
        const height = document.documentElement.scrollHeight || document.body.scrollHeight;
        window.parent.postMessage(
          {
            type: 'bms-resize',
            height,
            percentage: progress.percentage,
            isReady: audit.isReady
          },
          '*'
        );
      }
    };

    notifyParentOfHeight();
    const interval = setInterval(notifyParentOfHeight, 1000);
    window.addEventListener('resize', notifyParentOfHeight);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', notifyParentOfHeight);
    };
  });

  // Temporizador de sesión
  useEffect(() => {
    if (session.finished) return;
    const interval = setInterval(() => {
      setSession((prev) => ({
        ...prev,
        elapsedSeconds: Math.floor((Date.now() - (prev.startedAt || Date.now())) / 1000)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.finished]);

  // Guardado automático en localStorage
  const persistState = useCallback((stateToSave: SessionState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e);
    }
  }, []);

  const activeQuestions = getActiveQuestions(session.answers);
  const currentIdx = Math.max(
    0,
    activeQuestions.findIndex((q) => q.id === session.currentId)
  );
  const currentQuestion = activeQuestions[currentIdx] || activeQuestions[0];
  const progress = calculateProgress(session.answers, session.matrix, session.na);
  const audit = getAuditReport(session);

  // Handlers para respuestas
  const handleSetSingleAnswer = (qId: string, val: string) => {
    setSession((prev) => {
      const next = clone(prev);
      next.answers[qId] = val;
      next.na[qId] = false;
      cleanInactiveConditionals(next);
      persistState(next);
      return next;
    });
  };

  const handleToggleMultiAnswer = (qId: string, val: string, checked: boolean) => {
    setSession((prev) => {
      const next = clone(prev);
      let arr = Array.isArray(next.answers[qId]) ? [...(next.answers[qId] as string[])] : [];
      if (checked) {
        if (!arr.includes(val)) arr.push(val);
      } else {
        arr = arr.filter((x) => x !== val);
      }
      next.answers[qId] = arr;
      next.na[qId] = false;
      cleanInactiveConditionals(next);
      persistState(next);
      return next;
    });
  };

  const handleSetOpenAnswer = (qId: string, val: string) => {
    setSession((prev) => {
      const next = clone(prev);
      next.answers[qId] = val;
      next.na[qId] = false;
      persistState(next);
      return next;
    });
  };

  const handleSetMatrixValue = (qId: string, sol: string, func: string) => {
    setSession((prev) => {
      const next = clone(prev);
      if (!next.matrix[qId]) next.matrix[qId] = {};
      next.matrix[qId][sol] = func;
      persistState(next);
      return next;
    });
  };

  const handleSetNA = (qId: string, isNA: boolean) => {
    setSession((prev) => {
      const next = clone(prev);
      next.na[qId] = isNA;
      if (isNA) {
        delete next.answers[qId];
      }
      cleanInactiveConditionals(next);
      persistState(next);
      return next;
    });
  };

  const handleUpdateField = (
    field: 'additionalInfo' | 'evidence' | 'observations' | 'privateNotes',
    qId: string,
    val: string
  ) => {
    setSession((prev) => {
      const next = clone(prev);
      next[field][qId] = val;
      persistState(next);
      return next;
    });
  };

  // Navegación
  const handlePrevious = () => {
    if (currentIdx > 0) {
      const prevId = activeQuestions[currentIdx - 1].id;
      setSession((prev) => ({ ...prev, currentId: prevId }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (!isQuestionHandled(currentQuestion, session.answers, session.matrix, session.na)) {
      showToast(
        `El reactivo ${currentQuestion.id} necesita respuesta o marcarse como N/A antes de avanzar.`
      );
      return;
    }
    if (currentIdx < activeQuestions.length - 1) {
      const nextId = activeQuestions[currentIdx + 1].id;
      setSession((prev) => ({ ...prev, currentId: nextId }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si es la última pregunta del diagnóstico, verificar si está lista para finalizar
      const report = getAuditReport(session);
      if (report.isReady) {
        // Finalizar y pasar directamente a la vista de resultados
        setSession((prev) => {
          const next = { ...prev, finished: true };
          persistState(next);
          return next;
        });
        setActiveView('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        try {
          window.parent.postMessage({ type: 'bms-scroll-top' }, '*');
        } catch (_) {}
        showToast('✓ ¡Diagnóstico completado con éxito!');
      } else {
        // Si aún faltan reactivos, abrir el modal de evaluación y hacer scroll hacia arriba
        setIsEvaluationOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        try {
          window.parent.postMessage({ type: 'bms-scroll-top' }, '*');
        } catch (_) {}
      }
    }
  };

  const handleJumpToQuestion = (qId: string) => {
    const exists = findQuestionById(qId);
    if (exists) {
      setSession((prev) => ({ ...prev, currentId: qId }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Metadatos
  const handleClientNameChange = (name: string) => {
    setSession((prev) => {
      const next = { ...prev, clientName: name };
      persistState(next);
      return next;
    });
  };

  const handleClientEmailChange = (email: string) => {
    setSession((prev) => {
      const next = { ...prev, clientEmail: email };
      persistState(next);
      return next;
    });
  };

  const handleConsultantChange = (consultant: string) => {
    setSession((prev) => {
      const next = { ...prev, consultant };
      persistState(next);
      return next;
    });
  };

  // Persistencia y reinicio
  const handleSave = () => {
    persistState(session);
    showToast('✓ Sesión guardada correctamente en el almacenamiento local.');
  };

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        showToast('No se encontró ninguna sesión guardada previamente.');
        return;
      }
      const parsed = JSON.parse(saved);
      setSession({ ...createInitialState(), ...parsed });
      showToast('✓ Sesión cargada exitosamente.');
      if (parsed.finished) {
        setActiveView('completion');
      } else {
        setActiveView('survey');
      }
    } catch {
      showToast('Error al cargar la sesión guardada.');
    }
  };

  const handleOpenResetConfirm = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = createInitialState();
    fresh.finished = false;
    fresh.currentId = 'BMS-001';
    setSession(fresh);
    setActiveView('survey');
    setIsEvaluationOpen(false);
    setIsResetConfirmOpen(false);
    setIsTestModeOpen(false);
    showToast('✓ Formulario reiniciado. Ahora puedes contestar las preguntas manualmente.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToSurvey = () => {
    setSession((prev) => {
      const next = { ...prev, finished: false };
      persistState(next);
      return next;
    });
    setActiveView('survey');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = () => {
    const report = getAuditReport(session);
    if (!report.isReady) {
      setIsEvaluationOpen(true);
      showToast(`Quedan ${report.pendingCount} reactivos pendientes. Por favor revísalos.`);
      return;
    }
    setSession((prev) => {
      const next = { ...prev, finished: true };
      persistState(next);
      return next;
    });
    setActiveView('completion');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('✓ Sesión completada con éxito.');
  };

  const handleFillTestData = () => {
    const dummy = fillTestData(session);
    setSession(dummy);
    persistState(dummy);
    showToast('✓ Se completó la sesión con respuestas de prueba realistas.');
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#111111] pb-24 font-sans">
      {/* Toast flotante */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#171717] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold border-l-4 border-[#D7192B] animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Barra superior de progreso y estado */}
      <Topbar
        currentIndex={currentIdx}
        totalActive={activeQuestions.length}
        answeredCount={progress.answered}
        pendingCount={progress.pending}
        percentage={progress.percentage}
        coreAnswered={audit.coreCompleted}
        coreTotal={audit.coreTotal}
        conditionalActiveCount={audit.conditionalActiveCount}
        onOpenEvaluation={() => setIsEvaluationOpen(true)}
        activeView={activeView}
        onReturnToSurvey={handleReturnToSurvey}
        onStartManualTest={handleOpenResetConfirm}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Portada e identificación del cliente */}
        <CoverHeader
          clientName={session.clientName}
          clientEmail={session.clientEmail}
          consultant={session.consultant || DEFAULT_CONSULTANT}
          onChangeClientName={handleClientNameChange}
          onChangeClientEmail={handleClientEmailChange}
          onChangeConsultant={handleConsultantChange}
        />

        {/* Panel técnico de prueba (ocultable) */}
        <TestModePanel
          isOpen={isTestModeOpen}
          onClose={() => setIsTestModeOpen(false)}
          currentState={session}
          onFillTestData={handleFillTestData}
          onResetSession={handleOpenResetConfirm}
        />

        {/* VISTA 1: CUESTIONARIO */}
        {activeView === 'survey' && (
          <div>
            <PendingQuestionsBanner
              pendingQuestions={audit.pendingQuestions}
              onJumpToQuestion={handleJumpToQuestion}
            />

            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                index={currentIdx}
                totalActive={activeQuestions.length}
                state={session}
                onSetSingleAnswer={handleSetSingleAnswer}
                onToggleMultiAnswer={handleToggleMultiAnswer}
                onSetOpenAnswer={handleSetOpenAnswer}
                onSetMatrixValue={handleSetMatrixValue}
                onSetNA={handleSetNA}
                onUpdateField={handleUpdateField}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onOpenEvaluation={() => setIsEvaluationOpen(true)}
              />
            )}
          </div>
        )}

        {/* VISTA 2: SESIÓN COMPLETADA */}
        {activeView === 'completion' && (
          <CompletionView
            state={session}
            onShowResults={() => setActiveView('results')}
            onReturnToSurvey={handleReturnToSurvey}
            onResetSession={handleOpenResetConfirm}
          />
        )}

        {/* VISTA 3: RESULTADOS ESTRATÉGICOS */}
        {activeView === 'results' && (
          <ResultsView
            state={session}
            onReturnToSurvey={handleReturnToSurvey}
            onResetSession={handleOpenResetConfirm}
          />
        )}
      </main>

      {/* Barra de acción inferior */}
      <BottomBar
        onPrevious={handlePrevious}
        onNext={handleNext}
        canPrevious={currentIdx > 0}
        canNext={true}
        isLastQuestion={currentIdx === activeQuestions.length - 1}
        onSave={handleSave}
        onLoad={handleLoad}
        onOpenEvaluation={() => setIsEvaluationOpen(true)}
        onFinish={handleFinish}
        onReset={handleOpenResetConfirm}
        onToggleTestMode={() => setIsTestModeOpen((prev) => !prev)}
        isTestModeOpen={isTestModeOpen}
        pendingCount={progress.pending}
        activeView={activeView}
        onReturnToSurvey={handleReturnToSurvey}
      />

      {/* Modal de Auditoría y Evaluación */}
      <EvaluationModal
        isOpen={isEvaluationOpen}
        onClose={() => setIsEvaluationOpen(false)}
        audit={audit}
        onJumpToQuestion={handleJumpToQuestion}
        onFinishSession={handleFinish}
        onFillTestData={handleFillTestData}
      />

      {/* Modal de confirmación para reiniciar prueba manual */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirmReset={handleConfirmReset}
      />
    </div>
  );
}
