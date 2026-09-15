export type QuestionType = 'single' | 'multi' | 'open' | 'matrix';

export interface QuestionTrigger {
  question: string;
  values?: string[];
  mode?: 'insufficientEvidence' | 'weakMetrics';
}

export interface Question {
  id: string;
  section: string;
  type: QuestionType;
  text: string;
  help?: string;
  example?: string;
  placeholder?: string;
  options?: string[];
  related?: string[];
  dependsOn?: string;
  trigger?: QuestionTrigger;
}

export interface SessionState {
  clientName: string;
  clientEmail: string;
  consultant: string;
  startedAt: number;
  elapsedSeconds: number;
  currentId: string;
  finished: boolean;
  answers: Record<string, string | string[]>;
  na: Record<string, boolean>;
  additionalInfo: Record<string, string>;
  evidence: Record<string, string>;
  observations: Record<string, string>;
  privateNotes: Record<string, string>;
  matrix: Record<string, Record<string, string>>;
  history: string[];
}

export interface StrategicSignal {
  type: 'red' | 'yellow';
  area?: string;
  title: string;
  text: string;
  statement?: string;
  clientClaim?: string;
  evidenceFound?: string;
  trueNeed?: string;
  source?: string[];
  recommendedExercises?: string[];
}

export interface AuditReport {
  totalActive: number;
  coreCompleted: number;
  coreTotal: number;
  conditionalActiveCount: number;
  conditionalCompleted: number;
  answeredCount: number;
  naCount: number;
  pendingCount: number;
  percentage: number;
  consistencyScore: number;
  contradictionCount: number;
  pendingQuestions: Question[];
  signals: StrategicSignal[];
  isReady: boolean;
}

export interface TestResult {
  pass: boolean;
  title: string;
  detail?: string;
}

export interface TestSuiteResult {
  tests: TestResult[];
  passed: number;
  total: number;
  percentage: number;
}
