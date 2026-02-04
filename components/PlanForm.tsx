
import React, { useState } from 'react';
import { InstrumentType, PlatformType, MaintenancePlan, MaintenanceCategory } from '../types';

interface PlanFormProps {
  onSubmit: (category: MaintenanceCategory, instrument: InstrumentType, platform: PlatformType, tag: string, symptom: string) => void;
  isLoading: boolean;
  history: MaintenancePlan[];
}

interface FormErrors {
  instrument?: string;
  platform?: string;
  tag?: string;
  category?: string;
  symptom?: string;
  general?: string;
}

const PlanForm: React.FC<PlanFormProps> = ({ onSubmit, isLoading, history }) => {
  const [category, setCategory] = useState<MaintenanceCategory>(MaintenanceCategory.PREVENTIVE);
  const [instrument, setInstrument] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [tag, setTag] = useState('');
  const [symptom, setSymptom] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isShaking, setIsShaking] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const normalizedTag = tag.trim().toUpperCase();
    let hasEmptyFields = false;
    
    if (!instrument) {
      newErrors.instrument = 'O tipo de instrumento é obrigatório.';
      hasEmptyFields = true;
    }
    
    if (!platform) {
      newErrors.platform = 'A unidade de instalação é obrigatória.';
      hasEmptyFields = true;
    }
    
    if (!tag.trim()) {
      newErrors.tag = 'O TAG do equipamento é obrigatório.';
      hasEmptyFields = true;
    }

    if (category === MaintenanceCategory.CORRECTIVE && !symptom.trim()) {
      newErrors.symptom = 'Descreva o sintoma da falha para a corretiva.';
      hasEmptyFields = true;
    }

    if (hasEmptyFields) {
      newErrors.general = 'Dados pendentes: Preencha todos os campos obrigatórios.';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(category, instrument as InstrumentType, platform as PlatformType, tag.trim(), symptom.trim());
    }
  };

  const getInputClass = (error?: string) => `
    w-full bg-slate-50 border text-slate-900 text-sm rounded-lg block p-2.5 transition-all outline-none
    ${error 
      ? 'border-red-500 ring-2 ring-red-100 bg-red-50 focus:border-red-600 focus:ring-red-200' 
      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}
    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <section className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print transition-transform ${isShaking ? 'animate-shake' : ''}`}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
      
      <h2 className="text-lg font-bold mb-6 flex items-center text-slate-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
        Configuração da Intervenção Técnica
      </h2>

      {/* Seletor de Categoria - Destaque Principal */}
      <div className="flex mb-8 bg-slate-100 p-1 rounded-xl">
        <button 
          type="button"
          onClick={() => setCategory(MaintenanceCategory.PREVENTIVE)}
          className={`flex-1 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
            category === MaintenanceCategory.PREVENTIVE 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Manutenção Preventiva
        </button>
        <button 
          type="button"
          onClick={() => setCategory(MaintenanceCategory.CORRECTIVE)}
          className={`flex-1 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
            category === MaintenanceCategory.CORRECTIVE 
              ? 'bg-white text-orange-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Manutenção Corretiva
        </button>
      </div>

      {errors.general && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg" role="alert">
          <p className="text-sm text-red-800 font-bold uppercase">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Tipo de Instrumento</label>
            <select 
              value={instrument}
              disabled={isLoading}
              onChange={(e) => setInstrument(e.target.value)}
              className={getInputClass(errors.instrument)}
            >
              <option value="">Selecione...</option>
              {Object.values(InstrumentType).map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Unidade Offshore</label>
            <select 
              value={platform}
              disabled={isLoading}
              onChange={(e) => setPlatform(e.target.value)}
              className={getInputClass(errors.platform)}
            >
              <option value="">Selecione...</option>
              {Object.values(PlatformType).map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Identificação TAG</label>
            <input 
              type="text"
              value={tag}
              disabled={isLoading}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Ex: PT-1010A"
              className={getInputClass(errors.tag)}
            />
          </div>
        </div>

        {category === MaintenanceCategory.CORRECTIVE && (
          <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
            <label className="block text-xs font-black text-orange-600 uppercase tracking-widest">Descrição do Sintoma / Falha Reportada</label>
            <textarea 
              value={symptom}
              disabled={isLoading}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Ex: O transmissor apresenta leitura travada em 100% mesmo com linha despressurizada..."
              className={`${getInputClass(errors.symptom)} min-h-[100px] resize-none`}
            />
            {errors.symptom && <p className="text-[10px] text-red-600 font-bold uppercase">{errors.symptom}</p>}
          </div>
        )}

        <div className="pt-2">
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl font-black text-white uppercase tracking-widest transition-all flex items-center justify-center space-x-3 shadow-lg ${
              isLoading ? 'bg-slate-400' : category === MaintenanceCategory.PREVENTIVE ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {isLoading ? (
              <span>Processando Inteligência...</span>
            ) : (
              <span>Gerar {category === MaintenanceCategory.PREVENTIVE ? 'Plano Preventivo' : 'Roteiro de Reparo'}</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default PlanForm;
