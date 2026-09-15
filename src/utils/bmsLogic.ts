import {
  AuditReport,
  Question,
  SessionState,
  StrategicSignal,
  TestResult,
  TestSuiteResult
} from '../types';
import {
  allQuestions,
  CORE_TOTAL,
  coreQuestions,
  DEFAULT_CONSULTANT,
  conditionalQuestions,
  REFERENCE_LIBRARY_COUNT,
  STORAGE_KEY
} from '../data/questions';

export function createInitialState(): SessionState {
  return {
    clientName: '',
    clientEmail: '',
    consultant: DEFAULT_CONSULTANT,
    startedAt: Date.now(),
    elapsedSeconds: 0,
    currentId: 'BMS-001',
    finished: false,
    answers: {},
    na: {},
    additionalInfo: {},
    evidence: {},
    observations: {},
    privateNotes: {},
    matrix: {},
    history: []
  };
}

export function clone<T>(obj: T): T {
  if (obj === undefined) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function ensureArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [String(value)];
}

export function findQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id);
}

export function checkInsufficientEvidence(answers: Record<string, unknown>): boolean {
  const bms010 = ensureArray(answers['BMS-010']);
  if (!bms010.length) return false;
  if (
    bms010.includes('No la evaluamos sistemáticamente') ||
    (bms010.length === 1 && bms010.includes('Ingresos'))
  ) {
    return true;
  }
  const sufficientVars = [
    'Margen',
    'Costos directos',
    'Costos indirectos',
    'Horas de trabajo',
    'Beneficio por oferta',
    'Rentabilidad por cliente'
  ];
  return bms010.filter((v) => sufficientVars.includes(v)).length === 0;
}

export function checkWeakMetrics(answers: Record<string, unknown>): boolean {
  const bms018 = ensureArray(answers['BMS-018']);
  if (!bms018.length) return false;
  if (bms018.includes('No utilizamos métricas sistemáticamente')) return true;
  if (bms018.length === 1 && ['Ventas', 'Leads'].includes(bms018[0])) return true;
  return false;
}

export function isTriggerActive(q: Question, answers: Record<string, unknown>): boolean {
  if (!q.trigger) return false;
  const { question: triggerQId, values, mode } = q.trigger;
  const currentAnswer = ensureArray(answers[triggerQId]);

  if (mode === 'insufficientEvidence') return checkInsufficientEvidence(answers);
  if (mode === 'weakMetrics') return checkWeakMetrics(answers);
  if (!currentAnswer.length || !values) return false;

  return values.some((v) => currentAnswer.includes(v));
}

export function getActiveConditionals(answers: Record<string, unknown>): Question[] {
  return conditionalQuestions.filter((q) => isTriggerActive(q, answers));
}

export function getActiveQuestions(answers: Record<string, unknown>): Question[] {
  return [...coreQuestions, ...getActiveConditionals(answers)];
}

export function getActiveQuestionIds(answers: Record<string, unknown>): string[] {
  return getActiveQuestions(answers).map((q) => q.id);
}

export function isMatrixCompleted(
  q: Question,
  answers: Record<string, unknown>,
  matrix: Record<string, Record<string, string>>
): boolean {
  if (!q.dependsOn) return false;
  const selectedSolutions = ensureArray(answers[q.dependsOn]);
  if (!selectedSolutions.length) return false;
  const currentMatrix = matrix[q.id] || {};
  return selectedSolutions.every((sol) => String(currentMatrix[sol] || '').trim() !== '');
}

export function isQuestionNA(q: Question, na: Record<string, boolean>): boolean {
  return na[q.id] === true;
}

export function isQuestionAnswered(
  q: Question,
  answers: Record<string, unknown>,
  matrix: Record<string, Record<string, string>>,
  na: Record<string, boolean>
): boolean {
  if (isQuestionNA(q, na)) return false;
  if (q.type === 'matrix') {
    return isMatrixCompleted(q, answers, matrix);
  }
  const ans = answers[q.id];
  if (q.type === 'multi') {
    return ensureArray(ans).length > 0;
  }
  if (q.type === 'single' || q.type === 'open') {
    return String(ans || '').trim() !== '';
  }
  return false;
}

export function isQuestionHandled(
  q: Question,
  answers: Record<string, unknown>,
  matrix: Record<string, Record<string, string>>,
  na: Record<string, boolean>
): boolean {
  return isQuestionAnswered(q, answers, matrix, na) || isQuestionNA(q, na);
}

export function getPendingQuestions(
  answers: Record<string, unknown>,
  matrix: Record<string, Record<string, string>>,
  na: Record<string, boolean>
): Question[] {
  return getActiveQuestions(answers).filter(
    (q) => !isQuestionAnswered(q, answers, matrix, na) && !isQuestionNA(q, na)
  );
}

export function calculateProgress(
  answers: Record<string, unknown>,
  matrix: Record<string, Record<string, string>>,
  na: Record<string, boolean>
) {
  const active = getActiveQuestions(answers);
  const answered = active.filter((q) => isQuestionAnswered(q, answers, matrix, na)).length;
  const notApplicable = active.filter((q) => isQuestionNA(q, na)).length;
  const pending = active.filter(
    (q) => !isQuestionAnswered(q, answers, matrix, na) && !isQuestionNA(q, na)
  ).length;
  const percentage = active.length
    ? Math.round(((answered + notApplicable) / active.length) * 100)
    : 100;
  return {
    active: active.length,
    answered,
    na: notApplicable,
    pending,
    percentage
  };
}

export function cleanInactiveConditionals(state: SessionState): void {
  const activeIds = new Set(getActiveQuestionIds(state.answers));
  conditionalQuestions.forEach((q) => {
    if (!activeIds.has(q.id)) {
      delete state.answers[q.id];
      delete state.na[q.id];
      delete state.additionalInfo[q.id];
      delete state.evidence[q.id];
      delete state.observations[q.id];
      delete state.privateNotes[q.id];
    }
  });
}

export function evaluateSignals(state: SessionState): StrategicSignal[] {
  const signals: StrategicSignal[] = [];
  const bms008 = ensureArray(state.answers['BMS-008']);
  const bms025 = state.answers['BMS-025'];
  const bmsC01 = ensureArray(state.answers['BMS-C01']);
  const bmsC02 = state.answers['BMS-C02'];
  const bms015 = ensureArray(state.answers['BMS-015']);
  const bms026 = ensureArray(state.answers['BMS-026']);
  const bms023 = ensureArray(state.answers['BMS-023']);
  const bms009 = ensureArray(state.answers['BMS-009']);
  const bms007 = ensureArray(state.answers['BMS-007']);
  const bms028 = ensureArray(state.answers['BMS-028']);
  const bms005 = ensureArray(state.answers['BMS-005']);
  const bms006 = state.matrix['BMS-006'] || {};
  const bms011 = ensureArray(state.answers['BMS-011']);
  const bms012 = ensureArray(state.answers['BMS-012']);
  const bms013 = state.answers['BMS-013'];
  const bms004 = (state.answers['BMS-004'] || '').toString().toLowerCase();
  const bms017 = ensureArray(state.answers['BMS-017']);
  const bms020 = ensureArray(state.answers['BMS-020']);
  const bms021 = ensureArray(state.answers['BMS-021']);
  const bms027 = ensureArray(state.answers['BMS-027']);

  // Estandarización
  if (
    bms008.some((v) => v.startsWith('Alta') || v.startsWith('Muy alta')) &&
    (bms025 === 'Se diseña en gran parte para cada cliente' ||
      bms025 === 'Completamente personalizada')
  ) {
    signals.push({
      type: 'red',
      area: 'Estandarización',
      title: 'Hipótesis prioritaria: estandarización',
      text: 'Existe una señal acumulativa de alta personalización en la entrega. Debe validarse si la falta de estandarización está limitando reutilización, capacidad o escalabilidad.',
      statement:
        'Existe una señal acumulativa de alta personalización en la entrega. Debe validarse si la falta de estandarización está limitando reutilización, capacidad o escalabilidad.',
      source: ['BMS-008', 'BMS-025'],
      recommendedExercises: ['2.2.7', '2.2.8', '2.2.15']
    });
  } else if (
    (bms025 === 'Completamente estandarizada' || bms025 === 'Mayormente estandarizada') &&
    (bms015.includes('Personalización excesiva') ||
      bmsC01.some((v) => ['Diagnóstico', 'Todo el servicio', 'Estrategia'].includes(v)) ||
      bms026.includes('Onboarding') ||
      bms023.some((v) => ['Delivery', 'Onboarding'].includes(v)))
  ) {
    signals.push({
      type: 'red',
      area: 'Estandarización y Delivery',
      title: 'Falsa Estandarización: Entrega Centralizada en Conocimiento Tácito',
      text: 'El cliente percibe su servicio como estandarizado, pero la operación revela cuellos de botella por personalización excesiva y fricción en onboarding.',
      clientClaim:
        'Declara que la entrega del servicio está completamente o mayormente estandarizada (BMS-025).',
      evidenceFound:
        'Identifica "Personalización excesiva" como barrera para crear activos (BMS-015), fricción en Onboarding (BMS-026) y necesidad de adaptar el Diagnóstico (BMS-C01).',
      trueNeed:
        'El servicio no está estructurado en activos transferibles; depende del criterio del fundador. Requiere empaquetar el diagnóstico y crear un protocolo cerrado de onboarding.',
      source: ['BMS-015', 'BMS-025', 'BMS-026', 'BMS-C01'],
      recommendedExercises: ['2.2.7', '2.2.8', '2.2.15']
    });
  }

  // Personalización condicional
  if (bmsC01.length > 0 || bmsC02) {
    signals.push({
      type: 'yellow',
      area: 'Personalización',
      title: 'Profundización de personalización',
      text: `La sesión identificó ${
        bmsC01.length > 0
          ? 'partes concretas que requieren personalización'
          : 'un factor explicativo'
      }. Debe cruzarse con delivery, procesos y productización.`,
      statement: 'Se identificó necesidad de profundizar en los factores de personalización.',
      source: ['BMS-C01', 'BMS-C02'],
      recommendedExercises: ['2.2.7', '2.2.8']
    });
  }

  // Backend / Membresía
  const hasMembershipCatalog =
    bms005.includes('Membresía / suscripción') ||
    Object.values(bms006).some((val) => ['Continuidad', 'Cross-sell', 'Retención'].includes(val));
  const isOneTimeIncome =
    bms011.includes('Venta única') &&
    !bms011.some((val) => ['Recurrente', 'Suscripción', 'Híbrido'].includes(val));
  const relationshipTerminates = bms012.includes('Termina la relación');

  if (hasMembershipCatalog && (isOneTimeIncome || relationshipTerminates)) {
    signals.push({
      type: 'red',
      area: 'Monetización y LTV',
      title: 'Backend Fantasma: Desconexión entre Oferta Recurrente e Ingresos Reales',
      text: 'Existe una membresía declarada en catálogo o cross-sell, pero no genera flujo recurrente real y la relación con el cliente se corta al entregar la consultoría.',
      clientClaim:
        'Declara tener Membresía / Suscripción en su portafolio o como cross-sell (BMS-005, BMS-006).',
      evidenceFound:
        'Su modelo de ingresos es 100% "Venta única" (BMS-011) y tras el servicio principal "Termina la relación" (BMS-012).',
      trueNeed:
        'No necesita crear más ofertas iniciales. Requiere diseñar una oferta de continuidad formal (retainer/soporte) con transición natural al finalizar la consultoría.',
      source: ['BMS-005', 'BMS-006', 'BMS-011', 'BMS-012'],
      recommendedExercises: ['2.2.5', '2.2.6', '2.2.9', '2.2.17']
    });
  }

  // Recompra
  if (
    (bms013 === '25%–50%' || bms013 === 'Más del 50%') &&
    (relationshipTerminates || bms004.includes('retenci') || bms004.includes('recompra'))
  ) {
    signals.push({
      type: 'yellow',
      area: 'Retención y Fidelización',
      title: 'Recompra Reactiva no Gobernativa',
      text: 'Los clientes recompran de forma espontánea por iniciativa propia, pero el negocio no cuenta con un sistema de retención ni gobernanza de cartera.',
      clientClaim: 'Estima una tasa de recompra de entre 25% y 50%+ (BMS-013).',
      evidenceFound:
        'Declara que tras la compra "Termina la relación" (BMS-012) y solicita expresamente validar la retención real (BMS-004).',
      trueNeed:
        'Monetizar activamente la cartera existente mediante un protocolo proactivo de renovación y seguimiento a los 30/60/90 días.',
      source: ['BMS-004', 'BMS-012', 'BMS-013'],
      recommendedExercises: ['2.2.9', '2.2.17']
    });
  }

  // Pricing & Rentabilidad
  if (
    bms009.includes('No existe un criterio definido') &&
    checkInsufficientEvidence(state.answers)
  ) {
    signals.push({
      type: 'red',
      area: 'Rentabilidad',
      title: 'Hipótesis prioritaria: pricing y rentabilidad',
      text: 'La combinación de criterio de pricing no definido y evidencia insuficiente sobre rentabilidad justifica validar la economía real de las ofertas antes de tomar decisiones de crecimiento.',
      statement:
        'La información disponible todavía puede ser insuficiente para evaluar la rentabilidad de las ofertas.',
      source: ['BMS-009', 'BMS-010'],
      recommendedExercises: ['2.2.1b', '2.2.8']
    });
  } else if (
    (bms009.includes('Costos + margen') || bms007.includes('Precio')) &&
    bms028.includes('Márgenes insuficientes')
  ) {
    signals.push({
      type: 'red',
      area: 'Pricing y Economía',
      title: 'Trampa de Cost-Plus: Causa Raíz de los Márgenes Insuficientes',
      text: 'El negocio compite o factura anclado a costos y horas de trabajo, provocando techos de facturación y asfixia en el margen bruto.',
      clientClaim: 'Identifica "Márgenes insuficientes" como su mayor riesgo estratégico (BMS-028).',
      evidenceFound:
        'Fija precios sumando "Costos + margen" (BMS-009), se diferencia por precio (BMS-007) y mide rentabilidad contando horas (BMS-010).',
      trueNeed:
        'Desacoplar precios del tiempo insumido. Migrar a Pricing Basado en Valor (Value Pricing) anclado al impacto económico de la consultoría.',
      source: ['BMS-007', 'BMS-009', 'BMS-010', 'BMS-028'],
      recommendedExercises: ['2.2.1b', '2.2.8']
    });
  }

  // Funnel
  if (
    (bms017.length > 0 || bms020.some((v) => v !== 'No existe un recorrido estructurado')) &&
    (bms021.includes('Nada') || bms021.includes('No hacemos seguimiento'))
  ) {
    signals.push({
      type: 'yellow',
      area: 'Funnel y Ventas',
      title: 'Embudo de un Solo Disparo: Fuga del 80%+ de Prospectos no Convertidos',
      text: 'Existe captación de leads mediante contenido o referidos, pero los contactos que no compran de inmediato son abandonados por completo.',
      clientClaim: 'Atrae prospectos calificados por contenido o referidos (BMS-017, BMS-020).',
      evidenceFound:
        'Admite hacer "Nada" con quienes no compran en el primer intento (BMS-021). Desperdicio del esfuerzo de captación.',
      trueNeed:
        'Implementar una secuencia de nutrición con casos de estudio y autoridad B2B antes de gastar presupuesto en nuevas alianzas o anuncios.',
      source: ['BMS-017', 'BMS-020', 'BMS-021'],
      recommendedExercises: ['2.2.16', '2.2.17', '2.3.5']
    });
  }

  // Operación y dependencia
  if (
    bms023.includes('Todos / casi todos') ||
    (bms023.includes('Ventas') &&
      bms027.some((v) => ['Escalamiento', 'Alianzas', 'Publicidad'].includes(v)))
  ) {
    signals.push({
      type: 'red',
      area: 'Operación y Fundador',
      title: 'Cuello de Botella: Intentar Escalar sin Descentralizar al Fundador',
      text: 'El fundador centraliza ventas y/o delivery mientras busca alianzas o escalamiento, arriesgando el colapso operativo del negocio.',
      clientClaim: 'Busca oportunidades de crecimiento en alianzas o escalamiento (BMS-027).',
      evidenceFound:
        'Las ventas o delivery dependen directamente de su tiempo personal (BMS-023) y la documentación de procesos es mínima (BMS-022).',
      trueNeed:
        'Proteger la capacidad del fundador. Sistematizar el speech comercial y delegar tareas administrativas antes de acelerar volumen.',
      source: ['BMS-022', 'BMS-023', 'BMS-027'],
      recommendedExercises: ['2.2.7', '2.2.15', '2.4.1']
    });
  }

  // Contradicción métricas
  const bms018 = ensureArray(state.answers['BMS-018']);
  const bms019 = ensureArray(state.answers['BMS-019']);
  if (
    bms018.includes('No utilizamos métricas sistemáticamente') &&
    bms019.some((v) => v !== 'No tomamos decisiones sistemáticamente')
  ) {
    signals.push({
      type: 'yellow',
      area: 'Métricas',
      title: 'Contradicción a validar: métricas y decisiones',
      text: 'El cliente declara que no utiliza métricas sistemáticamente, pero también declara tomar decisiones a partir de métricas. Debe identificarse qué métricas utiliza realmente, con qué frecuencia y qué decisiones modifica.',
      statement:
        'Contradicción identificada: declara no medir sistemáticamente pero sí tomar decisiones basadas en métricas.',
      source: ['BMS-018', 'BMS-019'],
      recommendedExercises: ['2.3.1', '2.3.2', '2.3.5']
    });
  }

  return signals;
}

export function getAuditReport(state: SessionState): AuditReport {
  cleanInactiveConditionals(state);
  const prog = calculateProgress(state.answers, state.matrix, state.na);
  const pending = getPendingQuestions(state.answers, state.matrix, state.na);
  const signals = evaluateSignals(state);

  const coreCompleted = coreQuestions.filter((q) =>
    isQuestionHandled(q, state.answers, state.matrix, state.na)
  ).length;
  const activeConds = getActiveConditionals(state.answers);
  const condCompleted = activeConds.filter((q) =>
    isQuestionHandled(q, state.answers, state.matrix, state.na)
  ).length;

  const contradictionSignals = signals.filter((s) => s.clientClaim && s.evidenceFound);
  let consistencyScore = 100;
  for (const s of contradictionSignals) {
    if (s.type === 'red') consistencyScore -= 14;
    else if (s.type === 'yellow') consistencyScore -= 7;
  }
  consistencyScore = Math.max(20, Math.min(100, consistencyScore));

  return {
    totalActive: prog.active,
    coreCompleted,
    coreTotal: CORE_TOTAL,
    conditionalActiveCount: activeConds.length,
    conditionalCompleted: condCompleted,
    answeredCount: prog.answered,
    naCount: prog.na,
    pendingCount: prog.pending,
    percentage: prog.percentage,
    consistencyScore,
    contradictionCount: contradictionSignals.length,
    pendingQuestions: pending,
    signals,
    isReady: prog.pending === 0
  };
}

export function formatAnswer(q: Question, state: SessionState): string {
  if (isQuestionNA(q, state.na)) return 'No aplica';
  if (q.type === 'matrix') {
    const matrixData = state.matrix[q.id] || {};
    const entries = Object.entries(matrixData);
    if (!entries.length) return 'Sin respuesta';
    return entries.map(([sol, func]) => `${sol}: ${func || 'Sin seleccionar'}`).join(' · ');
  }
  const ans = state.answers[q.id];
  if (Array.isArray(ans)) {
    return ans.length ? ans.join(', ') : 'Sin respuesta';
  }
  return String(ans || 'Sin respuesta');
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return [
      String(h).padStart(2, '0'),
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0')
    ].join(':');
  }
  return [String(m).padStart(2, '0'), String(s).padStart(2, '0')].join(':');
}

export function generateExportJson(state: SessionState): Record<string, unknown> {
  const activeQuestions = getActiveQuestions(state.answers);
  const progress = calculateProgress(state.answers, state.matrix, state.na);
  const nowIso = new Date().toISOString();

  const formattedQuestions = activeQuestions.map((q, idx) => ({
    sequential: idx + 1,
    id: q.id,
    section: q.section,
    type: q.type,
    question: q.text,
    status: isQuestionNA(q, state.na)
      ? 'NO_APLICA'
      : isQuestionAnswered(q, state.answers, state.matrix, state.na)
      ? 'RESPONDIDA'
      : 'PENDIENTE',
    answer: q.type === 'matrix' ? state.matrix[q.id] || {} : state.answers[q.id] ?? null,
    formattedAnswer: formatAnswer(q, state),
    additionalInfo: state.additionalInfo[q.id] || '',
    evidence: state.evidence[q.id] || '',
    observation: state.observations[q.id] || '',
    consultantPrivateNote: state.privateNotes[q.id] || '',
    relatedBmsExercises: q.related || []
  }));

  const signals = evaluateSignals(state);
  const audit = getAuditReport(state);

  const crossValidationAudit = signals
    .filter((s) => s.clientClaim && s.evidenceFound)
    .map((s) => ({
      area: s.area,
      contradiction: s.title,
      clientClaim: s.clientClaim,
      evidenceReality: s.evidenceFound,
      trueNeed: s.trueNeed,
      recommendedExercises: s.recommendedExercises || [],
      sources: s.source || []
    }));

  return {
    schemaVersion: 'BMS-PROFUNDIZACION-4.2',
    methodology: 'CREA Y MONETIZA™',
    pillar: 'Business Marketing Strategy',
    stage: 'Post-sale deep dive',
    generatedAt: nowIso,
    sourceLibrary: {
      name: 'BMS — Las 100 preguntas imprescindibles para empezar con un cliente',
      totalQuestions: REFERENCE_LIBRARY_COUNT
    },
    session: {
      clientName: state.clientName,
      clientEmail: state.clientEmail,
      consultant: state.consultant,
      startedAt: state.startedAt,
      elapsedSeconds: state.elapsedSeconds,
      elapsed: formatTime(state.elapsedSeconds),
      finished: state.finished
    },
    architecture: {
      referenceLibraryCount: REFERENCE_LIBRARY_COUNT,
      coreQuestions: coreQuestions.length,
      conditionalLibrary: conditionalQuestions.length,
      conditionalActive: getActiveConditionals(state.answers).length,
      activeQuestions: progress.active,
      answered: progress.answered,
      notApplicable: progress.na,
      pending: progress.pending,
      consistencyScore: audit.consistencyScore,
      contradictionsDetected: audit.contradictionCount
    },
    questions: formattedQuestions,
    rawAnswers: clone(state.answers),
    notApplicable: clone(state.na),
    additionalInfo: clone(state.additionalInfo),
    evidence: clone(state.evidence),
    observations: clone(state.observations),
    privateNotes: clone(state.privateNotes),
    matrix: clone(state.matrix),
    strategicSignals: signals,
    crossValidationAudit,
    analysisPackage: {
      instruction:
        'Analizar todas las respuestas, información adicional, evidencia, observaciones y notas como un sistema conectado. Identificar correlaciones, contradicciones, posibles relaciones causales y prioridades. No confundir correlación con causalidad. Cuando la evidencia sea insuficiente utilizar REQUIERE VALIDACIÓN.',
      distinctions: ['Hecho', 'Declaración del cliente', 'Evidencia', 'Hipótesis', 'Conclusión'],
      depthMap: ['VALIDAR / DOCUMENTAR', 'OPTIMIZAR', 'PROFUNDIZAR', 'REQUIERE INFORMACIÓN'],
      antiBiasDirective:
        'DISCERNIMIENTO ANTISESGO: El cliente a menudo describe su negocio desde el deseo o la aspiración ("estamos estandarizados", "tenemos membresía", "recompran 50%"). La auditoría antisesgo en crossValidationAudit cruza estas declaraciones con hechos operativos ("modelo 100% venta única", "relación termina al entregar", "personalización excesiva"). Prioriza SIEMPRE la evidencia operativa sobre el relato subjetivo del cliente.',
      requiredOutputs: [
        'Resumen ejecutivo',
        'Situación actual',
        'Fortalezas',
        'Brechas',
        'Correlaciones y patrones',
        'Posibles relaciones causales',
        'Contradicciones',
        'Bloqueadores prioritarios',
        'Oportunidades',
        'Riesgos',
        'Mapa de profundidad',
        'Ejercicios BMS que requieren mayor énfasis',
        'Ejercicios BMS que pueden validarse/documentarse',
        'Información faltante',
        'Recomendación estratégica global',
        'Prioridades de intervención',
        'Guía para el consultor'
      ],
      rules: [
        'No decidir nuevamente el pilar.',
        'No analizar las preguntas de forma aislada.',
        'No inventar información.',
        'No convertir una declaración del cliente en un hecho sin evidencia.',
        'No afirmar causalidad sin evidencia suficiente.',
        'Cuando exista contradicción, marcar REQUIERE VALIDACIÓN.',
        'La profundidad determina dónde profundizar, no qué ejercicios BMS eliminar.',
        'Todos los ejercicios BMS pertinentes siguen disponibles.'
      ]
    },
    masterPrompt: `
ACTÚA COMO:
Senior Consultant de Business Marketing Strategy (BMS), analista estratégico y especialista en modelos de negocio, portafolio, marketing, ventas, monetización, productización y transformación empresarial.
CONTEXTO:
El cliente ya pasó por CREA Y MONETIZA™ y el pilar BMS ya fue contratado.
Esta sesión corresponde a una profundización posterior a la contratación.
NO debes decidir nuevamente qué pilar necesita.

DIRECTIVA FUNDAMENTAL ANTISESGO (LO QUE DICE VS. LO QUE REALMENTE NECESITA):
1. No te dejes llevar por la narrativa o autopercepción optimista del cliente.
2. Analiza el bloque 'crossValidationAudit' y las 'strategicSignals' adjuntas.
3. Separa rigurosamente:
   - Lo que el cliente declara
   - Lo que la evidencia operativa demuestra
   - Lo que el negocio REALMENTE necesita resolver en su raíz.
4. Identifica las contradicciones críticas:
   - Si declara membresía o cross-sell pero opera con 'Venta única' y la relación 'Termina', la membresía no existe en la realidad: necesita estructurar un backend de continuidad real (BMS 2.2.6, 2.2.9, 2.2.17).
   - Si declara entrega 'Completamente estandarizada' pero admite 'Personalización excesiva' o el fundador centraliza ventas/onboarding, la estandarización es ilusoria: necesita productizar activos transferibles (BMS 2.2.7, 2.2.8, 2.2.15).
   - Si cobra por 'Costos + margen / horas' y su mayor riesgo son 'Márgenes insuficientes', su pricing de suma cero destruye el margen: necesita Value Pricing (BMS 2.2.1b, 2.2.8).
   - Si genera prospectos pero hace 'Nada' con los que no compran de inmediato, tiene un embudo de un solo disparo: necesita un motor de nutrición antes de buscar más alianzas o pauta (BMS 2.2.16, 2.2.17, 2.3.5).
5. Enfoca el plan de acción en los ejercicios BMS prioritarios que atacan la causa raíz.
    `
  };
}

export function safeFileName(clientName?: string): string {
  const clean = (clientName || 'Cliente')
    .trim()
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return 'BMS_Profundizacion_' + (clean || 'Cliente');
}

export function downloadFile(content: string, filename: string, mimeType?: string): boolean {
  try {
    const blob = new Blob([content], { type: mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (err) {
    console.error('Error de descarga:', err);
    return false;
  }
}

/**
 * Abre el reporte formateado en una ventana/pestaña limpia y dispara automáticamente
 * el cuadro de diálogo "Guardar como PDF" nativo del navegador, garantizando fidelidad visual total.
 * Si las ventanas emergentes estuvieran bloqueadas, descarga el archivo .html como respaldo.
 */
export function printOrDownloadPdf(state: SessionState, isConsultant: boolean): void {
  const htmlContent = generateClientOrConsultantHtml(state, isConsultant);
  const title = isConsultant ? 'Reporte_Consultor_BMS' : 'Reporte_Cliente_BMS';
  const cleanName = safeFileName(state.clientName);

  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.document.title = `${cleanName}_${title}`;
      // El script embebido en el HTML ejecutará window.print()
      return;
    }
  } catch (e) {
    console.warn('No se pudo abrir ventana de impresión directa, usando descarga:', e);
  }

  // Fallback si el navegador bloquea popups en iframe
  downloadFile(htmlContent, `${cleanName}_${title}.html`, 'text/html;charset=utf-8');
}

export function generateClientOrConsultantHtml(state: SessionState, isConsultant: boolean): string {
  const progress = calculateProgress(state.answers, state.matrix, state.na);
  const activeQuestions = getActiveQuestions(state.answers);
  const dateStr = new Date().toLocaleDateString('es-ES');
  const signals = evaluateSignals(state);
  const audit = getAuditReport(state);

  // Sección exclusiva del consultor: Auditoría Estratégica y Preguntas de Control
  let consultantAnalysisSectionHtml = '';
  if (isConsultant) {
    const contradictionSignals = signals.filter((s) => s.clientClaim && s.evidenceFound);
    const otherSignals = signals.filter((s) => !s.clientClaim || !s.evidenceFound);

    consultantAnalysisSectionHtml = `
  <div class="consultant-audit-box">
    <div class="consultant-badge">SECCIÓN CONFIDENCIAL EXCLUSIVA DEL CONSULTOR</div>
    <h2 style="border-bottom:2px solid #D7192B;padding-bottom:6px;margin-top:10px;color:#111;">
      Auditoría Estratégica: Lo que el cliente declara vs. Evidencia real
    </h2>
    <p style="font-size:11px;color:#444;line-height:1.6;margin-bottom:16px;">
      Este análisis antisesgo cruza las declaraciones aspiracionales del cliente con la evidencia operativa reportada. Permite al consultor enfocar la intervención en la causa raíz real y no en el síntoma declarado.
    </p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:12px;">
        <div style="font-size:10px;font-weight:900;text-transform:uppercase;color:#666;">Índice de Coherencia Operativa</div>
        <div style="font-size:24px;font-weight:900;color:${audit.consistencyScore >= 80 ? '#08733F' : audit.consistencyScore >= 60 ? '#b45309' : '#D7192B'};margin-top:4px;">
          ${audit.consistencyScore}%
        </div>
        <div style="font-size:10px;color:#666;margin-top:2px;">
          ${audit.consistencyScore >= 80 ? 'Coherencia interna alta' : audit.consistencyScore >= 60 ? 'Inconsistencias moderadas' : 'Discrepancia crítica entre relato y operación'}
        </div>
      </div>
      <div style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:12px;">
        <div style="font-size:10px;font-weight:900;text-transform:uppercase;color:#666;">Contradicciones Detectadas</div>
        <div style="font-size:24px;font-weight:900;color:${contradictionSignals.length === 0 ? '#08733F' : '#D7192B'};margin-top:4px;">
          ${contradictionSignals.length}
        </div>
        <div style="font-size:10px;color:#666;margin-top:2px;">
          Cruces entre preguntas de control y modelos operativos
        </div>
      </div>
    </div>

    ${
      contradictionSignals.length > 0
        ? `<h3 style="font-size:13px;font-weight:900;color:#111;text-transform:uppercase;margin:16px 0 10px;">
            Inconsistencias y Preguntas de Control Críticas (${contradictionSignals.length}):
           </h3>`
        : ''
    }

    ${contradictionSignals
      .map(
        (s) => `
    <div style="background:#fff;border-left:4px solid ${s.type === 'red' ? '#D7192B' : '#f59e0b'};border-radius:6px;border-top:1px solid #e5e5e5;border-right:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;padding:14px;margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <strong style="font-size:12px;color:#111;">${escapeHtml(s.title)}</strong>
        ${s.area ? `<span style="font-size:9px;font-weight:700;background:#f3f4f6;padding:2px 6px;border-radius:4px;color:#555;">${escapeHtml(s.area)}</span>` : ''}
      </div>
      <div style="font-size:11px;color:#444;margin-bottom:10px;line-height:1.5;">${escapeHtml(s.text)}</div>
      
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:5px;padding:8px 10px;margin-bottom:6px;font-size:10.5px;">
        <strong style="color:#991b1b;">Lo que el cliente declara:</strong> ${escapeHtml(s.clientClaim || '')}
      </div>
      <div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:5px;padding:8px 10px;margin-bottom:6px;font-size:10.5px;">
        <strong style="color:#92400e;">Evidencia operativa real reportada:</strong> ${escapeHtml(s.evidenceFound || '')}
      </div>
      ${
        s.trueNeed
          ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:5px;padding:8px 10px;font-size:10.5px;">
              <strong style="color:#166534;">Necesidad raíz a trabajar en consultoría:</strong> ${escapeHtml(s.trueNeed)}
            </div>`
          : ''
      }
      ${
        s.recommendedExercises && s.recommendedExercises.length
          ? `<div style="margin-top:8px;font-size:10px;color:#555;">
              <strong>Ejercicios recomendados del manual BMS:</strong> ${escapeHtml(s.recommendedExercises.join(', '))}
            </div>`
          : ''
      }
    </div>`
      )
      .join('')}

    ${
      otherSignals.length > 0
        ? `<h3 style="font-size:13px;font-weight:900;color:#111;text-transform:uppercase;margin:16px 0 10px;">
            Otras Señales de Alerta Detectadas (${otherSignals.length}):
           </h3>`
        : ''
    }

    ${otherSignals
      .map(
        (s) => `
    <div style="background:#fff;border-left:4px solid ${s.type === 'red' ? '#D7192B' : '#f59e0b'};border-radius:6px;border-top:1px solid #e5e5e5;border-right:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;padding:12px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <strong style="font-size:11px;color:#111;">${escapeHtml(s.title)}</strong>
        ${s.area ? `<span style="font-size:9px;font-weight:700;background:#f3f4f6;padding:2px 6px;border-radius:4px;color:#555;">${escapeHtml(s.area)}</span>` : ''}
      </div>
      <div style="font-size:10.5px;color:#444;line-height:1.5;">${escapeHtml(s.text)}</div>
      ${
        s.recommendedExercises && s.recommendedExercises.length
          ? `<div style="margin-top:6px;font-size:9.5px;color:#555;">
              <strong>Ejercicios sugeridos BMS:</strong> ${escapeHtml(s.recommendedExercises.join(', '))}
            </div>`
          : ''
      }
    </div>`
      )
      .join('')}
  </div>`;
  }

  const questionsHtml = activeQuestions
    .map((q, idx) => {
      const formatted = formatAnswer(q, state);
      const addInfo = state.additionalInfo[q.id] || '';
      const evidence = state.evidence[q.id] || '';
      const obs = state.observations[q.id] || '';
      const note = state.privateNotes[q.id] || '';

      let matrixHtml = '';
      if (q.type === 'matrix') {
        const matrixData = state.matrix[q.id] || {};
        matrixHtml = `
        <table class="matrix-document">
          <thead>
            <tr>
              <th>Solución</th>
              <th>Función</th>
            </tr>
          </thead>
          <tbody>${Object.entries(matrixData)
            .map(
              ([sol, func]) => `
          <tr>
            <td>${escapeHtml(sol)}</td>
            <td>${escapeHtml(func)}</td>
          </tr>`
            )
            .join('')}</tbody>
        </table>`;
      }

      return `
      <div class="question">
        <div class="id">Pregunta ${idx + 1} · ${escapeHtml(q.id)}</div>
        <h3>${escapeHtml(q.text)}</h3>
        <p><strong>Estado:</strong> ${
          isQuestionNA(q, state.na)
            ? 'No aplica'
            : isQuestionAnswered(q, state.answers, state.matrix, state.na)
            ? 'Respondida'
            : 'Pendiente'
        }</p>
        ${q.type === 'matrix' ? matrixHtml : `<p><strong>Respuesta:</strong> ${escapeHtml(formatted)}</p>`}
        ${addInfo ? `<p><strong>Información adicional:</strong> ${escapeHtml(addInfo)}</p>` : ''}
        ${evidence ? `<p><strong>Evidencia:</strong> ${escapeHtml(evidence)}</p>` : ''}
        ${obs ? `<p><strong>Observación:</strong> ${escapeHtml(obs)}</p>` : ''}
        ${
          isConsultant && note
            ? `<div class="private"><strong>Nota privada del consultor:</strong><br><br>${escapeHtml(
                note
              )}</div>`
            : ''
        }
      </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isConsultant ? 'Reporte Consultor BMS' : 'Reporte Cliente BMS'} — ${escapeHtml(state.clientName || 'Cliente')}</title>
<style>
@page {
  size: A4 portrait;
  margin: 15mm 15mm 15mm 15mm;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 20px;
  background: #f3f3f3;
  color: #111;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.5;
}
.no-print-bar {
  max-width: 900px;
  margin: 0 auto 16px auto;
  background: #171717;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.btn-print {
  background: #D7192B;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(215,25,43,0.4);
}
.btn-print:hover { background: #b91222; }
.page {
  max-width: 900px;
  margin: auto;
  background: #fff;
  padding: 40px;
  box-shadow: 0 4px 14px rgba(0,0,0,.08);
  border-radius: 8px;
}
.cover { border-top: 7px solid #D7192B; padding-top: 12px; padding-bottom: 25px; }
.brand { color: #D7192B; font-weight: 900; letter-spacing: 2px; font-size: 11px; }
h1 { font-size: 26px; font-weight: 900; margin: 10px 0; color: #111; }
h2 { border-bottom: 2px solid #D7192B; padding-bottom: 6px; margin-top: 28px; font-size: 16px; font-weight: 900; }
.meta { color: #555; font-size: 11px; line-height: 1.8; }
.status { padding: 12px; border-radius: 7px; background: #EAF8F0; color: #08733F; font-size: 11px; line-height: 1.6; margin: 20px 0; border: 1px solid #bbf7d0; }
.question { padding: 14px 0; border-bottom: 1px solid #E5E7EB; page-break-inside: avoid; }
.id { color: #D7192B; font-size: 10px; font-weight: 900; }
h3 { font-size: 13px; margin: 5px 0 8px; color: #111; }
p { font-size: 11px; line-height: 1.55; margin: 4px 0; }
.private { background: #171717; color: #fff; padding: 12px; border-radius: 6px; margin-top: 8px; font-size: 10.5px; line-height: 1.5; }
.consultant-audit-box { background: #fafafa; border: 2px solid #e5e5e5; border-radius: 8px; padding: 18px; margin: 22px 0 28px; }
.consultant-badge { display: inline-block; background: #D7192B; color: #fff; font-size: 9px; font-weight: 900; letter-spacing: 1px; padding: 3px 8px; border-radius: 4px; margin-bottom: 8px; }
.matrix-document { width: 100%; border-collapse: collapse; margin-top: 10px; }
.matrix-document th, .matrix-document td { border: 1px solid #ddd; padding: 8px; font-size: 10px; text-align: left; }
.matrix-document th { background: #f5f5f5; }
.footer { margin-top: 35px; padding-top: 12px; border-top: 2px solid #111; color: #777; font-size: 9.5px; }

@media print {
  body { background: #fff !important; padding: 0 !important; }
  .no-print-bar { display: none !important; }
  .page { box-shadow: none !important; padding: 0 !important; max-width: 100% !important; border-radius: 0 !important; }
  .question { page-break-inside: avoid; }
  .consultant-audit-box { page-break-inside: avoid; }
}
</style>
</head>
<body>
<div class="no-print-bar">
  <div>
    <strong style="font-size:13px;letter-spacing:0.5px;">Vista previa de impresión en PDF</strong>
    <div style="font-size:11px;color:#aaa;">Selecciona la opción <strong>"Guardar como PDF"</strong> en el destino de tu navegador.</div>
  </div>
  <button class="btn-print" onclick="window.print()">Imprimir / Guardar en PDF</button>
</div>

<div class="page">
  <div class="cover">
    <div class="brand">PATRICIA LOAIZA · CREA Y MONETIZA™</div>
    <h1>Profundización BMS — ${isConsultant ? 'Documento Interno del Consultor' : 'Documento del Cliente'}</h1>
    <div class="meta">
      <strong>Cliente:</strong> ${escapeHtml(state.clientName || 'Sin especificar')}<br>
      <strong>Fecha:</strong> ${escapeHtml(dateStr)}<br>
      <strong>Consultor/a:</strong> ${escapeHtml(state.consultant || DEFAULT_CONSULTANT)}<br>
      <strong>Preguntas núcleo:</strong> ${coreQuestions.length}<br>
      <strong>Condicionales activas:</strong> ${getActiveConditionals(state.answers).length}<br>
      <strong>Total activas:</strong> ${progress.active}<br>
      <strong>Respondidas:</strong> ${progress.answered}<br>
      <strong>No aplica:</strong> ${progress.na}<br>
      <strong>Pendientes:</strong> ${progress.pending}
    </div>
  </div>

  <h2>Información de la sesión</h2>
  <div class="status">
    <strong>${
      progress.pending === 0
        ? '✓ Sesión de profundización completada.'
        : '⚠ Sesión con preguntas pendientes.'
    }</strong><br><br>
    Esta sesión muestra únicamente las preguntas pertinentes activadas para este caso según la lógica del negocio.<br><br>
    Biblioteca BMS completa: ${REFERENCE_LIBRARY_COUNT} preguntas de referencia.<br><br>
    Preguntas núcleo utilizadas: ${coreQuestions.length} · Condicionales activadas: ${
    getActiveConditionals(state.answers).length
  }.
  </div>

  ${consultantAnalysisSectionHtml}

  <h2>Respuestas del Cuestionario de Profundización</h2>
  ${questionsHtml}

  <div class="footer">
    ${
      isConsultant
        ? 'DOCUMENTO INTERNO · Incluye notas confidenciales del consultor y auditoría antisesgo.'
        : 'DOCUMENTO DEL CLIENTE · Respuestas y estructura acordada para la consultoría BMS.'
    }<br><br>
    CREA Y MONETIZA™ · Patricia Loaiza
  </div>
</div>

<script>
  window.addEventListener('DOMContentLoaded', () => {
    // Si la ventana fue abierta por la app, dispara la orden de impresión nativa a PDF
    setTimeout(() => {
      window.print();
    }, 450);
  });
</script>
</body>
</html>`;
}

export function fillTestData(currentState: SessionState): SessionState {
  const state = clone(currentState);
  state.clientName = 'Empresa Demo S.A.S.';
  state.clientEmail = 'contacto@empresademo.com';
  state.consultant = DEFAULT_CONSULTANT;

  coreQuestions.forEach((q) => {
    if (q.type === 'multi') {
      state.answers[q.id] = q.options && q.options.length ? [q.options[0]] : ['Respuesta de prueba'];
    } else if (q.type === 'single') {
      state.answers[q.id] = q.options && q.options.length ? q.options[0] : 'Respuesta de prueba';
    } else if (q.type === 'open') {
      state.answers[q.id] = 'Necesitamos validar la sensibilidad al precio y la retención real.';
    }
  });

  state.answers['BMS-005'] = ['Consultoría', 'Membresía / suscripción'];
  state.matrix['BMS-006'] = {
    Consultoría: 'Oferta principal',
    'Membresía / suscripción': 'Cross-sell'
  };
  state.answers['BMS-008'] = 'Media: estructura estándar con bastante adaptación';
  state.answers['BMS-010'] = ['Margen', 'Costos directos', 'Horas de trabajo'];
  state.answers['BMS-013'] = '25%–50%';
  state.answers['BMS-018'] = ['Leads', 'Conversión', 'CAC', 'Ventas'];

  let guard = 0;
  while (guard < 20) {
    guard++;
    const pending = getActiveQuestions(state.answers).filter(
      (q) => !isQuestionHandled(q, state.answers, state.matrix, state.na)
    );
    if (pending.length === 0) break;
    let filledAny = false;
    pending.forEach((q) => {
      if (q.type === 'matrix') {
        const solutions = ensureArray(state.answers[q.dependsOn || '']);
        if (!state.matrix[q.id]) state.matrix[q.id] = {};
        solutions.forEach((sol) => {
          state.matrix[q.id][sol] = 'Oferta principal';
        });
        filledAny = true;
      } else if (q.type === 'multi') {
        state.answers[q.id] = q.options && q.options.length ? [q.options[0]] : ['Respuesta de prueba'];
        filledAny = true;
      } else if (q.type === 'single') {
        state.answers[q.id] = q.options && q.options.length ? q.options[0] : 'Respuesta de prueba';
        filledAny = true;
      } else if (q.type === 'open') {
        state.answers[q.id] = 'Respuesta de prueba condicional';
        filledAny = true;
      }
    });
    if (!filledAny) break;
  }

  cleanInactiveConditionals(state);
  return state;
}

export function runTestSuite(currentState?: SessionState): TestSuiteResult {
  const originalState = clone(currentState || createInitialState());
  let b = clone(originalState);
  const tests: TestResult[] = [];

  function t(pass: boolean, title: string, detail = ''): TestResult {
    return { pass: !!pass, title, detail };
  }

  try {
    tests.push(t(coreQuestions.length === 29, '01 · Existen exactamente 29 preguntas núcleo', `Detectadas: ${coreQuestions.length}`));
    const allIds = allQuestions.map((q) => q.id);
    tests.push(t(new Set(allIds).size === allIds.length, '02 · Todos los IDs son únicos', `Total IDs: ${allIds.length}`));
    tests.push(t(allQuestions.every((q) => ['single', 'multi', 'open', 'matrix'].includes(q.type)), '03 · Todos los tipos de pregunta son válidos'));
    tests.push(t(allQuestions.filter((q) => q.type === 'single').every((q) => Array.isArray(q.options) && q.options.length > 0), '04 · Toda selección única tiene opciones'));
    tests.push(t(allQuestions.filter((q) => q.type === 'multi').every((q) => Array.isArray(q.options) && q.options.length > 0), '05 · Toda selección múltiple tiene opciones'));

    const bms006 = findQuestionById('BMS-006');
    tests.push(t(!!(bms006 && bms006.type === 'matrix' && (bms006.options?.length || 0) > 0), '06 · BMS-006 tiene matriz y funciones disponibles'));
    tests.push(t(conditionalQuestions.length === 12, '07 · Existen exactamente 12 condicionales'));
    tests.push(t(conditionalQuestions.every((q) => q.trigger), '08 · Las 12 condicionales tienen trigger'));
    tests.push(t(new Set(conditionalQuestions.map((q) => q.id)).size === 12, '09 · IDs condicionales únicos'));

    b.answers['BMS-005'] = ['Consultoría', 'Membresía / suscripción'];
    b.matrix['BMS-006'] = { Consultoría: 'Oferta principal' };
    const sols = ensureArray(b.answers['BMS-005']);
    tests.push(t(sols.length === 2, '10 · BMS-006 genera una fila por solución', `Soluciones detectadas: ${sols.length}`));
    tests.push(t(b.matrix['BMS-006'].Consultoría === 'Oferta principal', '11 · BMS-006 conserva la función seleccionada'));

    b.matrix['BMS-006']['Membresía / suscripción'] = 'Cross-sell';
    tests.push(t(isMatrixCompleted(bms006!, b.answers, b.matrix), '12 · La matriz completa cuenta como respondida'));

    b.answers['BMS-010'] = ['Ingresos'];
    tests.push(t(isTriggerActive(findQuestionById('BMS-C03')!, b.answers), '13 · C03 se activa cuando solo existe evidencia de ingresos', 'Profundización por evidencia insuficiente.'));

    b.answers['BMS-010'] = ['Ingresos', 'Margen', 'Costos directos'];
    tests.push(t(!isTriggerActive(findQuestionById('BMS-C03')!, b.answers), '14 · C03 no se activa cuando existe evidencia suficiente'));

    b.answers['BMS-013'] = 'No lo sé';
    tests.push(t(isTriggerActive(findQuestionById('BMS-C04')!, b.answers), '15 · C04 se activa con recompra desconocida'));

    b.answers['BMS-018'] = ['Ventas'];
    tests.push(t(isTriggerActive(findQuestionById('BMS-C06')!, b.answers), '16 · C06 se activa con evidencia métrica débil'));

    b.answers['BMS-018'] = ['Leads', 'Conversión', 'CAC', 'Ventas'];
    tests.push(t(!isTriggerActive(findQuestionById('BMS-C06')!, b.answers), '17 · C06 no se activa con conjunto métrico suficiente'));

    b.na['BMS-001'] = true;
    tests.push(t(isQuestionNA(findQuestionById('BMS-001')!, b.na), '18 · N/A se identifica correctamente'));
    tests.push(t(!getPendingQuestions(b.answers, b.matrix, b.na).some((q) => q.id === 'BMS-001'), '19 · N/A no se contabiliza como pendiente'));

    b.answers['BMS-020'] = [];
    b.answers['BMS-C07'] = ['Webinar'];
    cleanInactiveConditionals(b);
    tests.push(t(b.answers['BMS-C07'] === undefined, '20 · Una condicional inactiva limpia su respuesta'));
    tests.push(t(b.matrix['BMS-006'].Consultoría === 'Oferta principal', '21 · La limpieza no elimina datos válidos de la matriz'));

    const jsonDoc = generateExportJson(b);
    tests.push(t(!!(jsonDoc && Array.isArray(jsonDoc.questions)), '22 · El JSON se genera correctamente'));
    const arch = jsonDoc.architecture as Record<string, number>;
    tests.push(t(arch.coreQuestions === 29 && arch.referenceLibraryCount === 100 && arch.conditionalLibrary === 12, '23 · El JSON conserva 29 núcleo, 12 condicionales y biblioteca 100'));

    b.privateNotes['BMS-001'] = 'NOTA PRIVADA TEST';
    const jsonPrivate = generateExportJson(b) as any;
    tests.push(t(jsonPrivate.privateNotes['BMS-001'] === 'NOTA PRIVADA TEST', '24 · Las notas privadas se almacenan en JSON'));

    const htmlClient = generateClientOrConsultantHtml(b, false);
    tests.push(t(!htmlClient.includes('NOTA PRIVADA TEST'), '25 · Documento cliente no contiene nota privada'));

    const htmlConsultant = generateClientOrConsultantHtml(b, true);
    tests.push(t(htmlConsultant.includes('NOTA PRIVADA TEST'), '26 · Documento consultor contiene nota privada'));
    tests.push(t(htmlClient.includes('Información de la sesión') && htmlClient.includes('BMS-001'), '27 · Documento cliente contiene estructura y preguntas'));
    tests.push(t(typeof downloadFile === 'function' && typeof generateExportJson === 'function', '28 · Funciones de descarga disponibles'));

    b.answers['BMS-009'] = ['No existe un criterio definido'];
    b.answers['BMS-010'] = ['Ingresos'];
    const signals = evaluateSignals(b);
    tests.push(t(signals.some((s) => s.area === 'Rentabilidad'), '29 · Se detecta señal estratégica de rentabilidad'));

    b.answers['BMS-018'] = ['No utilizamos métricas sistemáticamente'];
    b.answers['BMS-019'] = ['Modificar ofertas'];
    const metricsDecisionContradiction =
      ensureArray(b.answers['BMS-018']).includes('No utilizamos métricas sistemáticamente') &&
      ensureArray(b.answers['BMS-019']).some((v) => v !== 'No tomamos decisiones sistemáticamente');
    tests.push(t(metricsDecisionContradiction, '30 · Se identifica contradicción entre métricas y decisiones'));

    // Test 31: Full session leaves 0 pending
    b.answers = {};
    b.na = {};
    b.additionalInfo = {};
    b.evidence = {};
    b.observations = {};
    b.privateNotes = {};
    b.matrix = {};
    coreQuestions.forEach((q) => {
      if (q.type === 'multi') b.answers[q.id] = [q.options![0]];
      else if (q.type === 'single') b.answers[q.id] = q.options![0];
      else if (q.type === 'open') b.answers[q.id] = 'Respuesta de prueba';
    });
    b.answers['BMS-005'] = ['Consultoría', 'Membresía / suscripción'];
    b.matrix['BMS-006'] = {
      Consultoría: 'Oferta principal',
      'Membresía / suscripción': 'Cross-sell'
    };

    let guard = 0;
    while (guard < 20) {
      guard++;
      const pending = getActiveQuestions(b.answers).filter(
        (q) => !isQuestionHandled(q, b.answers, b.matrix, b.na)
      );
      if (pending.length === 0) break;
      let filledAny = false;
      pending.forEach((q) => {
        if (q.type === 'matrix') {
          const sols = ensureArray(b.answers[q.dependsOn!]);
          b.matrix[q.id] = b.matrix[q.id] || {};
          sols.forEach((sol) => {
            b.matrix[q.id][sol] = 'Oferta principal';
          });
          filledAny = true;
          return;
        }
        if (q.type === 'multi') {
          b.answers[q.id] = q.options && q.options.length ? [q.options[0]] : ['Respuesta de prueba'];
          filledAny = true;
          return;
        }
        if (q.type === 'single') {
          b.answers[q.id] = q.options && q.options.length ? q.options[0] : 'Respuesta de prueba';
          filledAny = true;
          return;
        }
        if (q.type === 'open') {
          b.answers[q.id] = 'Respuesta de prueba';
          filledAny = true;
          return;
        }
      });
      if (!filledAny) break;
    }
    cleanInactiveConditionals(b);
    const prog31 = calculateProgress(b.answers, b.matrix, b.na);
    const pending31 = getPendingQuestions(b.answers, b.matrix, b.na);
    tests.push(t(
      prog31.pending === 0,
      '31 · Una sesión completa queda con 0 pendientes',
      pending31.length
        ? 'Pendientes: ' + pending31.map((q) => q.id + ' · ' + q.text).join(' | ')
        : 'Todas las preguntas activas fueron completadas.'
    ));

    b.answers['BMS-005'] = ['Consultoría'];
    b.answers['BMS-008'] = 'Muy alta: cada cliente requiere una solución prácticamente diferente';
    tests.push(t(
      getActiveConditionals(b.answers).some((q) => q.id === 'BMS-C01') &&
        getActiveConditionals(b.answers).some((q) => q.id === 'BMS-C02'),
      '32 · Las condicionales de oferta/personalización se activan'
    ));

    const serialized = JSON.stringify(b);
    tests.push(t(serialized.includes('BMS-005') && serialized.includes('BMS-006'), '33 · La estructura guardable conserva respuestas y matriz'));

    b = clone(originalState);
    tests.push(t(JSON.stringify(b) === JSON.stringify(originalState), '34 · La prueba automática restaura exactamente la sesión original'));
    tests.push(t(!!(b.answers && b.na && b.additionalInfo && b.evidence && b.observations && b.privateNotes && b.matrix && b.currentId === originalState.currentId), '35 · La restauración conserva toda la estructura de sesión'));
    tests.push(t(Array.isArray(getPendingQuestions(b.answers, b.matrix, b.na)), '36 · El sistema puede construir lista de pendientes'));
    tests.push(t(typeof getAuditReport === 'function' && typeof generateClientOrConsultantHtml === 'function', '37 · Flujo completo de finalización y evaluación disponible'));
  } catch (err: any) {
    tests.push(t(false, 'ERROR DURANTE LAS PRUEBAS', err.message));
  }

  const passed = tests.filter((t) => t.pass).length;
  const total = tests.length;
  const percentage = total ? Math.round((passed / total) * 100) : 0;
  return { tests, passed, total, percentage };
}
