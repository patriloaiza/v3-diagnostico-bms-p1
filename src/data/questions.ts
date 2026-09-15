import { Question } from '../types';

export const REFERENCE_LIBRARY_COUNT = 100;
export const CORE_TOTAL = 29;
export const STORAGE_KEY = 'crea_monetiza_bms_profundizacion_v4_2';
export const DEFAULT_CONSULTANT = 'Patricia Loaiza';

export const coreQuestions: Question[] = [
  {
    id: 'BMS-001',
    section: 'Cliente y mercado',
    type: 'multi',
    text: '¿Qué perfiles de clientes atiendes actualmente?',
    help: 'Selecciona todos los perfiles que realmente forman parte de tu actividad actual.',
    options: [
      'Empresas',
      'Profesionales independientes',
      'Emprendedores',
      'Creadores de contenido',
      'Equipos / departamentos',
      'Organizaciones',
      'Otro'
    ],
    related: ['2.1.1', '2.2.4']
  },
  {
    id: 'BMS-002',
    section: 'Cliente y mercado',
    type: 'single',
    text: '¿Cuál de esos perfiles representa actualmente la mayor oportunidad estratégica?',
    options: [
      'Mayor potencial de crecimiento',
      'Mayor rentabilidad',
      'Mayor facilidad de adquisición',
      'Mayor recurrencia',
      'Mayor afinidad con la propuesta',
      'Todavía no está claro'
    ],
    related: ['2.1.1', '2.2.4']
  },
  {
    id: 'BMS-003',
    section: 'Cliente y mercado',
    type: 'multi',
    text: '¿Qué fuentes de información utilizas actualmente para conocer mejor a tus clientes y mercado?',
    options: [
      'Entrevistas a clientes',
      'Datos de ventas',
      'Encuestas',
      'Analítica digital',
      'Investigación competitiva',
      'Redes sociales',
      'Equipo comercial',
      'No utilizamos información sistemáticamente'
    ],
    related: ['2.1.1', '2.3.1', '2.3.2']
  },
  {
    id: 'BMS-004',
    section: 'Cliente y mercado',
    type: 'open',
    text: '¿Qué información sobre tus clientes o mercado consideras que todavía necesitamos validar?',
    help: 'Utiliza este espacio cuando exista una incertidumbre que no pueda resolverse mediante las opciones anteriores.',
    example:
      'Ejemplo: interés real en consultoría frente a cursos, sensibilidad al precio, problema prioritario, intención de compra o perfil con mayor potencial.',
    placeholder: 'Escribe aquí la información que todavía necesitamos validar...',
    related: ['2.1.1', '2.3.1']
  },
  {
    id: 'BMS-005',
    section: 'Oferta y portafolio',
    type: 'multi',
    text: '¿Qué tipos de soluciones tienes actualmente en tu portafolio?',
    options: [
      'Consultoría',
      'Servicios',
      'Programa / formación',
      'Membresía / suscripción',
      'Producto digital',
      'Lead magnet',
      'Email / secuencia',
      'Evento / webinar',
      'Otro'
    ],
    related: ['2.2.1', '2.2.2', '2.2.6', '2.2.8']
  },
  {
    id: 'BMS-006',
    section: 'Oferta y portafolio',
    type: 'matrix',
    text: '¿Qué función cumple actualmente cada una de tus principales soluciones?',
    help: 'La matriz se genera según las soluciones seleccionadas en BMS-005.',
    dependsOn: 'BMS-005',
    options: [
      'Entrada',
      'Conversión',
      'Oferta principal',
      'Continuidad',
      'Cross-sell',
      'Upsell',
      'Retención',
      'Otro'
    ],
    related: ['2.2.1', '2.2.5', '2.2.6', '2.2.9', '2.2.17']
  },
  {
    id: 'BMS-007',
    section: 'Oferta y portafolio',
    type: 'multi',
    text: '¿En qué se diferencian actualmente tus principales ofertas?',
    options: [
      'Precio',
      'Nivel de servicio',
      'Profundidad',
      'Resultado prometido',
      'Personalización',
      'Duración',
      'Formato',
      'Audiencia',
      'No existe una diferenciación clara'
    ],
    related: ['2.2.1', '2.2.4', '2.2.5', '2.2.8']
  },
  {
    id: 'BMS-008',
    section: 'Oferta y portafolio',
    type: 'single',
    text: '¿Qué nivel de personalización requiere actualmente la entrega de tus principales ofertas?',
    options: [
      'Muy baja: solución prácticamente estandarizada',
      'Baja: pequeñas adaptaciones',
      'Media: estructura estándar con bastante adaptación',
      'Alta: cada cliente requiere adaptaciones importantes',
      'Muy alta: cada cliente requiere una solución prácticamente diferente'
    ],
    related: ['2.2.7', '2.2.8', '2.2.15']
  },
  {
    id: 'BMS-009',
    section: 'Pricing y economía',
    type: 'multi',
    text: '¿Qué criterios utilizas actualmente para establecer el precio de tus principales ofertas?',
    options: [
      'Costos + margen',
      'Precio de mercado',
      'Valor percibido',
      'Competencia',
      'Resultado / transformación',
      'Capacidad del cliente',
      'Experiencia propia',
      'Prueba y ajuste',
      'No existe un criterio definido'
    ],
    related: ['2.2.1b', '2.2.8']
  },
  {
    id: 'BMS-010',
    section: 'Pricing y economía',
    type: 'multi',
    text: '¿Qué información utilizas para evaluar la rentabilidad de una oferta?',
    help: 'Selecciona las variables que realmente utilizas, no las que te gustaría empezar a medir.',
    example:
      'Ejemplo: margen, costos directos, costos indirectos, horas de trabajo, beneficio por oferta o rentabilidad por cliente.',
    options: [
      'Ingresos',
      'Margen',
      'Costos directos',
      'Costos indirectos',
      'Horas de trabajo',
      'Beneficio por oferta',
      'Rentabilidad por cliente',
      'No la evaluamos sistemáticamente'
    ],
    related: ['2.2.1b', '2.2.8']
  },
  {
    id: 'BMS-011',
    section: 'Modelo de ingresos',
    type: 'multi',
    text: '¿Qué modelos de ingreso utilizas actualmente?',
    options: [
      'Venta única',
      'Proyecto',
      'Recurrente',
      'Suscripción',
      'Comisión',
      'Híbrido',
      'Otro'
    ],
    related: ['2.2.2', '2.2.6', '2.2.9']
  },
  {
    id: 'BMS-012',
    section: 'Cliente y monetización',
    type: 'multi',
    text: '¿Qué ocurre después de que un cliente compra tu oferta principal?',
    options: [
      'Termina la relación',
      'Recibe seguimiento',
      'Puede comprar otra oferta',
      'Recibe una oferta de continuidad',
      'Existe cross-sell',
      'Existe upsell',
      'Otro'
    ],
    related: ['2.2.5', '2.2.9', '2.2.17']
  },
  {
    id: 'BMS-013',
    section: 'Cliente y monetización',
    type: 'single',
    text: '¿Qué porcentaje aproximado de tus clientes vuelve a comprarte?',
    options: ['Más del 50%', '25%–50%', '11%–25%', '1%–10%', '0%', 'No lo sé'],
    related: ['2.2.9', '2.2.17']
  },
  {
    id: 'BMS-014',
    section: 'Productización',
    type: 'multi',
    text: '¿Qué elementos concretos de tu conocimiento o servicio podrían convertirse en activos reutilizables?',
    options: [
      'Metodologías',
      'Frameworks',
      'Plantillas',
      'Procesos',
      'Herramientas',
      'Recursos',
      'Agentes de IA',
      'Ninguno identificado todavía'
    ],
    related: ['2.2.7', '2.2.8', '2.2.15']
  },
  {
    id: 'BMS-015',
    section: 'Productización',
    type: 'multi',
    text: '¿Qué dificulta actualmente convertir esos elementos en soluciones reutilizables?',
    options: [
      'Personalización excesiva',
      'Falta de documentación',
      'No existe una metodología clara',
      'No sabemos qué productizar',
      'Falta de tiempo',
      'Falta de tecnología',
      'Dependencia del conocimiento personal',
      'Otro'
    ],
    related: ['2.2.7', '2.2.8', '2.2.15']
  },
  {
    id: 'BMS-016',
    section: 'Marketing',
    type: 'multi',
    text: '¿Qué componentes de tu estrategia de marketing están actualmente documentados?',
    options: [
      'Objetivos',
      'Audiencia',
      'Propuesta de valor',
      'Posicionamiento',
      'Contenido',
      'Canales',
      'Publicidad',
      'Email',
      'Presupuesto',
      'Calendario',
      'Ninguno de forma suficiente'
    ],
    related: ['2.3.1', '2.3.2', '2.3.3']
  },
  {
    id: 'BMS-017',
    section: 'Marketing',
    type: 'multi',
    text: '¿Qué fuentes o canales generan actualmente los clientes de mayor valor?',
    options: [
      'Referidos',
      'Redes sociales / contenido',
      'Publicidad',
      'Webinars',
      'Email',
      'SEO / web',
      'Alianzas',
      'Ventas directas',
      'Otro'
    ],
    related: ['2.3.1', '2.3.2', '2.3.5']
  },
  {
    id: 'BMS-018',
    section: 'Marketing y métricas',
    type: 'multi',
    text: '¿Qué métricas utilizas actualmente para tomar decisiones de marketing?',
    options: [
      'Leads',
      'Conversión',
      'Ventas',
      'CAC',
      'CPL',
      'ROI',
      'ROAS',
      'Margen',
      'No utilizamos métricas sistemáticamente'
    ],
    related: ['2.3.1', '2.3.2', '2.3.3']
  },
  {
    id: 'BMS-019',
    section: 'Marketing y métricas',
    type: 'multi',
    text: '¿Qué decisiones tomas a partir de esas métricas?',
    options: [
      'Redistribuir presupuesto',
      'Cambiar canales',
      'Cambiar mensajes',
      'Modificar ofertas',
      'Ajustar precios',
      'Cambiar campañas',
      'Priorizar segmentos',
      'No tomamos decisiones sistemáticamente'
    ],
    related: ['2.3.1', '2.3.2', '2.3.5']
  },
  {
    id: 'BMS-020',
    section: 'Funnel y ventas',
    type: 'multi',
    text: '¿Qué elementos forman actualmente tu recorrido comercial?',
    options: [
      'Contenido',
      'Lead magnet',
      'Email',
      'Webinar',
      'Página de captura',
      'Publicidad',
      'Campaña',
      'Ventas directas',
      'No existe un recorrido estructurado'
    ],
    related: ['2.2.3b', '2.2.16', '2.2.17']
  },
  {
    id: 'BMS-021',
    section: 'Funnel y ventas',
    type: 'multi',
    text: '¿Qué haces actualmente con las personas que no compran en el primer intento?',
    options: [
      'Nada',
      'Seguimiento manual',
      'Email',
      'Llamada',
      'Remarketing',
      'Contenido',
      'Nueva oferta',
      'No hacemos seguimiento'
    ],
    related: ['2.2.17', '2.3.5']
  },
  {
    id: 'BMS-022',
    section: 'Operación',
    type: 'multi',
    text: '¿Qué procesos importantes están actualmente documentados?',
    options: [
      'Marketing',
      'Ventas',
      'Onboarding',
      'Delivery',
      'Atención al cliente',
      'Administración',
      'Finanzas',
      'Contenido',
      'Automatizaciones',
      'Ninguno de forma suficiente'
    ],
    related: ['2.2.7', '2.2.8', '2.2.15']
  },
  {
    id: 'BMS-023',
    section: 'Operación',
    type: 'multi',
    text: '¿Qué procesos siguen dependiendo principalmente de ti?',
    options: [
      'Ventas',
      'Marketing',
      'Contenido',
      'Delivery',
      'Onboarding',
      'Atención al cliente',
      'Estrategia',
      'Administración',
      'Gestión interna',
      'Todos / casi todos'
    ],
    related: ['2.2.7', '2.2.8', '2.2.15']
  },
  {
    id: 'BMS-024',
    section: 'Operación',
    type: 'multi',
    text: '¿Qué tareas consideras prioritarias para delegar, automatizar o eliminar?',
    options: [
      'Administrativas',
      'Marketing',
      'Contenido',
      'Ventas',
      'Atención al cliente',
      'Delivery',
      'Seguimiento',
      'Reportes',
      'Facturación',
      'Gestión interna',
      'Otra'
    ],
    related: ['2.2.7', '2.2.15', '2.4.1']
  },
  {
    id: 'BMS-025',
    section: 'Delivery',
    type: 'single',
    text: '¿Cómo está estructurada actualmente la entrega de tu principal oferta?',
    options: [
      'Completamente estandarizada',
      'Mayormente estandarizada',
      'Mixta',
      'Se diseña en gran parte para cada cliente',
      'Completamente personalizada'
    ],
    related: ['2.2.8', '2.2.15']
  },
  {
    id: 'BMS-026',
    section: 'Delivery',
    type: 'multi',
    text: '¿Dónde se producen actualmente las principales fricciones en la entrega?',
    options: [
      'Onboarding',
      'Comunicación',
      'Planificación',
      'Delivery',
      'Equipo',
      'Tecnología',
      'Facturación',
      'Seguimiento',
      'Aprobaciones',
      'No existen fricciones importantes'
    ],
    related: ['2.2.8', '2.2.15']
  },
  {
    id: 'BMS-027',
    section: 'Crecimiento',
    type: 'multi',
    text: '¿Qué oportunidades de crecimiento estás considerando actualmente?',
    options: [
      'Alianzas',
      'Publicidad',
      'Diversificación',
      'Escalamiento',
      'Automatización',
      'Nuevas ofertas',
      'Nuevos mercados',
      'Recurrencia',
      'Productización'
    ],
    related: ['2.2.10', '2.2.11', '2.2.12', '2.2.13', '2.2.15', '2.4.1']
  },
  {
    id: 'BMS-028',
    section: 'Crecimiento',
    type: 'multi',
    text: '¿Cuáles son los principales riesgos que debemos considerar al diseñar la estrategia?',
    options: [
      'Márgenes insuficientes',
      'Dependencia de una persona',
      'Dependencia de un canal',
      'Falta de demanda',
      'Falta de capacidad',
      'Costes elevados',
      'Competencia',
      'Tecnología',
      'Flujo de caja',
      'Dependencia de pocos clientes',
      'Otro'
    ],
    related: ['2.4.1']
  },
  {
    id: 'BMS-029',
    section: 'Transformación',
    type: 'multi',
    text: '¿Qué capacidades o recursos necesitamos fortalecer para ejecutar la estrategia?',
    options: [
      'Conocimiento',
      'Equipo',
      'Tecnología',
      'Capital',
      'Marketing',
      'Ventas',
      'Operaciones',
      'Datos',
      'Automatización',
      'Liderazgo',
      'Procesos'
    ],
    related: ['2.4.1']
  }
];

export const conditionalQuestions: Question[] = [
  {
    id: 'BMS-C01',
    section: 'Profundización · Oferta',
    type: 'multi',
    trigger: {
      question: 'BMS-005',
      values: ['Consultoría', 'Servicios', 'Programa / formación']
    },
    text: '¿Qué parte de tu oferta requiere actualmente mayor personalización?',
    options: [
      'Diagnóstico',
      'Estrategia',
      'Implementación',
      'Delivery',
      'Seguimiento',
      'Todo el servicio'
    ],
    related: ['2.2.7', '2.2.8']
  },
  {
    id: 'BMS-C02',
    section: 'Profundización · Personalización',
    type: 'single',
    trigger: {
      question: 'BMS-008',
      values: [
        'Alta: cada cliente requiere adaptaciones importantes',
        'Muy alta: cada cliente requiere una solución prácticamente diferente'
      ]
    },
    text: '¿Qué factor explica principalmente ese nivel de personalización?',
    options: [
      'Diferencias entre clientes',
      'Falta de estandarización',
      'Necesidad real del servicio',
      'Expectativas del cliente',
      'Modelo actual de delivery'
    ],
    related: ['2.2.7', '2.2.8', '2.2.15']
  },
  {
    id: 'BMS-C03',
    section: 'Profundización · Rentabilidad',
    type: 'multi',
    trigger: {
      question: 'BMS-010',
      mode: 'insufficientEvidence'
    },
    text: '¿Qué información deberíamos comenzar a medir para conocer mejor la rentabilidad de tus ofertas?',
    help: 'Esta pregunta aparece cuando la respuesta de BMS-010 todavía no aporta suficiente evidencia para evaluar rentabilidad.',
    options: [
      'Margen',
      'Horas de trabajo',
      'Coste de delivery',
      'Coste de adquisición',
      'Beneficio por oferta',
      'Rentabilidad por cliente'
    ],
    related: ['2.2.1b', '2.2.8']
  },
  {
    id: 'BMS-C04',
    section: 'Profundización · Recompra',
    type: 'multi',
    trigger: {
      question: 'BMS-013',
      values: ['No lo sé', '0%', '1%–10%']
    },
    text: '¿Qué información necesitamos conocer sobre la recompra?',
    options: [
      'Tasa de recompra',
      'Tiempo hasta la recompra',
      'Oferta que genera recompra',
      'Motivos de abandono',
      'Valor del cliente'
    ],
    related: ['2.2.9', '2.2.17']
  },
  {
    id: 'BMS-C05',
    section: 'Profundización · Recurrencia',
    type: 'multi',
    trigger: {
      question: 'BMS-011',
      values: ['Recurrente', 'Suscripción', 'Híbrido']
    },
    text: '¿Qué función cumple actualmente tu modelo recurrente?',
    options: [
      'Continuidad',
      'Retención',
      'Ingresos predecibles',
      'Cross-sell',
      'Acceso a otros servicios'
    ],
    related: ['2.2.6', '2.2.9']
  },
  {
    id: 'BMS-C06',
    section: 'Profundización · Métricas',
    type: 'multi',
    trigger: {
      question: 'BMS-018',
      mode: 'weakMetrics'
    },
    text: '¿Qué métricas sería prioritario comenzar a medir?',
    options: ['Leads', 'Conversión', 'CAC', 'Ventas', 'Margen', 'ROI', 'LTV'],
    related: ['2.3.1', '2.3.2']
  },
  {
    id: 'BMS-C07',
    section: 'Profundización · Funnel',
    type: 'multi',
    trigger: {
      question: 'BMS-020',
      values: ['Lead magnet', 'Email', 'Webinar', 'Página de captura']
    },
    text: '¿Qué ocurre después de que una persona entra en tu sistema de captación?',
    options: [
      'Secuencia de email',
      'Webinar',
      'Remarketing',
      'Llamada',
      'Contenido',
      'Nueva oferta',
      'No hay recorrido estructurado'
    ],
    related: ['2.2.16', '2.2.17']
  },
  {
    id: 'BMS-C08',
    section: 'Profundización · Seguimiento',
    type: 'multi',
    trigger: {
      question: 'BMS-021',
      values: ['No hacemos seguimiento', 'Nada']
    },
    text: '¿Por qué actualmente no existe seguimiento de quienes no compran?',
    options: [
      'Falta de tiempo',
      'Falta de automatización',
      'Falta de proceso',
      'Falta de datos',
      'No se había considerado',
      'No sabemos qué comunicar'
    ],
    related: ['2.2.17', '2.3.5']
  },
  {
    id: 'BMS-C09',
    section: 'Profundización · Documentación',
    type: 'multi',
    trigger: {
      question: 'BMS-022',
      values: ['Ninguno de forma suficiente']
    },
    text: '¿Qué procesos deberían documentarse primero?',
    options: [
      'Ventas',
      'Marketing',
      'Delivery',
      'Onboarding',
      'Atención al cliente',
      'Administración',
      'Operaciones'
    ],
    related: ['2.2.7', '2.2.8', '2.2.15']
  },
  {
    id: 'BMS-C10',
    section: 'Profundización · Dependencia',
    type: 'multi',
    trigger: {
      question: 'BMS-023',
      values: ['Todos / casi todos']
    },
    text: '¿Qué efecto tiene actualmente esa dependencia de ti?',
    options: [
      'Limita el crecimiento',
      'Reduce el tiempo disponible',
      'Aumenta los costes',
      'Retrasa la entrega',
      'Dificulta delegar',
      'Genera dependencia del fundador'
    ],
    related: ['2.2.7', '2.2.15', '2.4.1']
  },
  {
    id: 'BMS-C11',
    section: 'Profundización · Crecimiento',
    type: 'multi',
    trigger: {
      question: 'BMS-027',
      values: ['Publicidad', 'Escalamiento', 'Diversificación', 'Nuevas ofertas']
    },
    text: '¿Qué información necesitamos validar antes de ejecutar esa oportunidad de crecimiento?',
    options: [
      'Demanda',
      'Rentabilidad',
      'Capacidad',
      'CAC',
      'Margen',
      'Conversión',
      'Capacidad operativa'
    ],
    related: ['2.3.1', '2.3.6', '2.4.1']
  },
  {
    id: 'BMS-C12',
    section: 'Profundización · Riesgos',
    type: 'multi',
    trigger: {
      question: 'BMS-028',
      values: [
        'Márgenes insuficientes',
        'Dependencia de una persona',
        'Dependencia de un canal',
        'Falta de demanda',
        'Falta de capacidad'
      ]
    },
    text: '¿Qué acción ayudaría a reducir ese riesgo?',
    options: [
      'Medición',
      'Diversificación',
      'Estandarización',
      'Automatización',
      'Delegación',
      'Validación de mercado',
      'Optimización de precios'
    ],
    related: ['2.4.1']
  }
];

export const allQuestions: Question[] = [...coreQuestions, ...conditionalQuestions];
