import React from 'react';
import { BookOpen, Briefcase, Info, Mail, User } from 'lucide-react';
import { CORE_TOTAL, REFERENCE_LIBRARY_COUNT } from '../data/questions';

interface CoverHeaderProps {
  clientName: string;
  clientEmail: string;
  consultant: string;
  onChangeClientName: (name: string) => void;
  onChangeClientEmail: (email: string) => void;
  onChangeConsultant: (consultant: string) => void;
}

export const CoverHeader: React.FC<CoverHeaderProps> = ({
  clientName,
  clientEmail,
  consultant,
  onChangeClientName,
  onChangeClientEmail,
  onChangeConsultant
}) => {
  return (
    <section
      id="section-cover-card"
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
    >
      <div className="border-t-[8px] border-[#D7192B] p-6 sm:p-8 pb-5">
        <div className="text-xs font-black tracking-widest text-[#D7192B] uppercase mb-2">
          PATRICIA LOAIZA · CREA Y MONETIZA™
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-2">
          Profundización BMS
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
          Sesión estratégica de profundización posterior a la contratación del pilar{' '}
          <strong className="text-gray-900 font-semibold">
            Business Marketing Strategy (BMS)
          </strong>
          .
        </p>

        <div className="mt-5 p-4 bg-rose-50 border-l-4 border-[#D7192B] rounded-r-lg text-xs text-gray-800 leading-relaxed flex items-start gap-3">
          <Info className="w-5 h-5 text-[#D7192B] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-gray-900 mb-1">Guía de pertinencia metodológica:</div>
            <p className="mb-2">
              Esta sesión utiliza una selección pertinente de la biblioteca BMS.{' '}
              <strong className="font-bold text-[#D7192B]">
                {CORE_TOTAL} preguntas núcleo
              </strong>{' '}
              constituyen la base de la sesión. Las preguntas condicionales aparecen solamente
              cuando la información aportada justifica profundizar.
            </p>
            <p className="text-gray-600 text-[11px]">
              La biblioteca completa contiene{' '}
              <strong className="font-semibold text-gray-800">
                {REFERENCE_LIBRARY_COUNT} preguntas de referencia
              </strong>
              . Eso no significa que la sesión deba responder las 100; solo aquellas pertinentes
              a la realidad de tu negocio.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 pb-6 pt-1 bg-gray-50/50 border-t border-gray-100">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
          Ficha de identificación de la sesión
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3 focus-within:border-[#D7192B] focus-within:ring-1 focus-within:ring-[#D7192B] transition-all">
            <label
              htmlFor="clientNameInput"
              className="block text-[10px] font-black text-gray-500 tracking-wider uppercase mb-1 flex items-center gap-1"
            >
              <User className="w-3 h-3 text-gray-400" /> CLIENTE
            </label>
            <input
              id="clientNameInput"
              type="text"
              value={clientName}
              onChange={(e) => onChangeClientName(e.target.value)}
              placeholder="Nombre del cliente o empresa"
              className="w-full text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3 focus-within:border-[#D7192B] focus-within:ring-1 focus-within:ring-[#D7192B] transition-all">
            <label
              htmlFor="clientEmailInput"
              className="block text-[10px] font-black text-gray-500 tracking-wider uppercase mb-1 flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-gray-400" /> EMAIL
            </label>
            <input
              id="clientEmailInput"
              type="email"
              value={clientEmail}
              onChange={(e) => onChangeClientEmail(e.target.value)}
              placeholder="email@cliente.com"
              className="w-full text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3 focus-within:border-[#D7192B] focus-within:ring-1 focus-within:ring-[#D7192B] transition-all">
            <label
              htmlFor="consultantInput"
              className="block text-[10px] font-black text-gray-500 tracking-wider uppercase mb-1 flex items-center gap-1"
            >
              <Briefcase className="w-3 h-3 text-gray-400" /> CONSULTOR/A
            </label>
            <input
              id="consultantInput"
              type="text"
              value={consultant}
              onChange={(e) => onChangeConsultant(e.target.value)}
              placeholder="Nombre del consultor"
              className="w-full text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
