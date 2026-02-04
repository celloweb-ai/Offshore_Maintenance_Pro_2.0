import React, { useState, useRef, useEffect } from 'react';
import { MaintenancePlan, LogEntry, MaintenanceCategory } from '../types.ts';

declare var html2pdf: any;

interface PlanDisplayProps {
  plan: MaintenancePlan;
}

const STATUS_OPTIONS = [
  { value: 'Operacional', color: 'text-green-600', bg: 'bg-green-500', hint: 'Instrumento operando dentro dos parâmetros nominais.' },
  { value: 'Em Manutenção', color: 'text-blue-600', bg: 'bg-blue-500', hint: 'Intervenção em curso. Malha pode estar em bypass.' },
  { value: 'Desligado', color: 'text-slate-600', bg: 'bg-slate-500', hint: 'Equipamento desenergizado ou fora de serviço.' },
  { value: 'Requer Atenção', color: 'text-amber-600', bg: 'bg-amber-500', hint: 'Operando com restrições ou falhas intermitentes.' },
];

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
  const isCorrective = plan.category === MaintenanceCategory.CORRECTIVE;
  
  const [fieldObservations, setFieldObservations] = useState('');
  const [rootCause, setRootCause] = useState(plan.faultDiagnosis || '');
  const [engConclusion, setEngConclusion] = useState('');
  
  const [technicalReviewerName, setTechnicalReviewerName] = useState('');
  const [technicalReviewDate, setTechnicalReviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [technicalComments, setTechnicalComments] = useState('');
  
  const [safetyVerification, setSafetyVerification] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState(isCorrective ? 'Em Manutenção' : 'Operacional');
  const [internalTag, setInternalTag] = useState('');
  const [installationLocation, setInstallationLocation] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  
  const [checkedRisks, setCheckedRisks] = useState<Record<number, boolean>>({});
  
  const [executante, setExecutante] = useState({ nome: '', matricula: '', data: '', hora: '' });
  const [supervisor, setSupervisor] = useState({ nome: '', data: '', carimbo: '' });
  const [signatures, setSignatures] = useState({ executante: '', supervisor: '' });

  const [editLogs, setEditLogs] = useState<LogEntry[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [showValidationErrorAlert, setShowValidationErrorAlert] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const printContainerRef = useRef<HTMLDivElement>(null);
  const canvasExecRef = useRef<HTMLCanvasElement>(null);
  const canvasSupRef = useRef<HTMLCanvasElement>(null);
  const technicalReviewerRef = useRef<HTMLInputElement>(null);
  const safetyVerificationRef = useRef<HTMLSelectElement>(null);
  const technicalCommentsRef = useRef<HTMLTextAreaElement>(null);
  const executanteSectionRef = useRef<HTMLDivElement>(null);
  const supervisorSectionRef = useRef<HTMLDivElement>(null);
  const aprSectionRef = useRef<HTMLDivElement>(null);

  // Determinar cores do tema com base na criticidade e categoria
  const themeColorClass = isCritical 
    ? 'border-red-600' 
    : isCorrective ? 'border-orange-600' : 'border-slate-200';
  
  const headerBgClass = isCritical 
    ? 'bg-red-900' 
    : isCorrective ? 'bg-orange-700' : 'bg-slate-900';
  
  const containerBgClass = isCritical ? 'bg-red-50/30' : 'bg-white';

  useEffect(() => {
    const savedData = localStorage.getItem(`maintenance_state_${plan.id}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.fieldObservations) setFieldObservations(parsed.fieldObservations);
        if (parsed.rootCause) setRootCause(parsed.rootCause);
        if (parsed.engConclusion) setEngConclusion(parsed.engConclusion);
        if (parsed.technicalReviewerName) setTechnicalReviewerName(parsed.technicalReviewerName);
        if (parsed.technicalReviewDate) setTechnicalReviewDate(parsed.technicalReviewDate);
        if (parsed.technicalComments) setTechnicalComments(parsed.technicalComments);
        if (parsed.safetyVerification) setSafetyVerification(parsed.safetyVerification);
        if (parsed.equipmentStatus) setEquipmentStatus(parsed.equipmentStatus);
        if (parsed.internalTag) setInternalTag(parsed.internalTag);
        if (parsed.installationLocation) setInstallationLocation(parsed.installationLocation);
        if (parsed.isCritical !== undefined) setIsCritical(parsed.isCritical);
        if (parsed.executante) setExecutante(parsed.executante);
        if (parsed.supervisor) setSupervisor(parsed.supervisor);
        if (parsed.editLogs) setEditLogs(parsed.editLogs);
        if (parsed.signatures) setSignatures(parsed.signatures);
        if (parsed.checkedRisks) setCheckedRisks(parsed.checkedRisks);
      } catch (e) { console.error(e); }
    }
  }, [plan.id]);

  useEffect(() => {
    const dataToSave = {
      fieldObservations, rootCause, engConclusion, 
      technicalReviewerName, technicalReviewDate, technicalComments,
      safetyVerification, equipmentStatus, internalTag, installationLocation, isCritical, executante, supervisor, editLogs, signatures, checkedRisks
    };
    localStorage.setItem(`maintenance_state_${plan.id}`, JSON.stringify(dataToSave));
  }, [fieldObservations, rootCause, engConclusion, technicalReviewerName, technicalReviewDate, technicalComments, safetyVerification, equipmentStatus, internalTag, installationLocation, isCritical, executante, supervisor, editLogs, signatures, checkedRisks, plan.id]);

  const initSignature = (canvas: HTMLCanvasElement | null, key: 'executante' | 'supervisor') => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let isDrawing = false;

    const getCoordinates = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const start = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      if (e.cancelable) e.preventDefault();
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const { x, y } = getCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (e.cancelable) e.preventDefault();
    };

    const end = () => {
      if (!isDrawing) return;
      isDrawing = false;
      ctx.closePath();
      setSignatures(prev => ({ ...prev, [key]: canvas.toDataURL() }));
      setValidationErrors(prev => ({ ...prev, [`signature_${key}`]: false }));
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', end);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', draw);
      window.removeEventListener('mouseup', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', end);
    };
  };

  useEffect(() => {
    let cleanupExec: (() => void) | undefined;
    let cleanupSup: (() => void) | undefined;

    if (canvasExecRef.current && !signatures.executante) {
      cleanupExec = initSignature(canvasExecRef.current, 'executante');
    }
    if (canvasSupRef.current && !signatures.supervisor) {
      cleanupSup = initSignature(canvasSupRef.current, 'supervisor');
    }

    return () => {
      if (cleanupExec) cleanupExec();
      if (cleanupSup) cleanupSup();
    };
  }, [plan, signatures.executante, signatures.supervisor]);

  const clearSignature = (key: 'executante' | 'supervisor') => {
    setSignatures(prev => ({ ...prev, [key]: '' }));
  };

  const handleRiskToggle = (idx: number) => {
    setCheckedRisks(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
    setValidationErrors(prev => ({ ...prev, apr: false }));
  };

  const validateAllRisks = () => {
    const all = {};
    plan.safetyAnalysis?.forEach((_, idx) => {
      all[idx] = true;
    });
    setCheckedRisks(all);
    setValidationErrors(prev => ({ ...prev, apr: false }));
  };

  const handlePrintPDF = async () => {
    const errors: Record<string, boolean> = {};
    let firstErrorRef: React.RefObject<any> | null = null;

    // Validação da APR
    const totalRisks = plan.safetyAnalysis?.length || 0;
    const checkedCount = Object.values(checkedRisks).filter(v => v).length;
    if (checkedCount < totalRisks) {
      errors.apr = true;
      firstErrorRef = aprSectionRef;
    }

    // Validação de Segurança Aprovada (Obrigatório "Sim")
    if (safetyVerification !== 'Sim') {
      errors.safetyVerification = true;
      if (!firstErrorRef) firstErrorRef = safetyVerificationRef;
    }

    // Validação dos campos técnicos
    if (!technicalReviewerName.trim()) {
      errors.technicalReviewerName = true;
      if (!firstErrorRef) firstErrorRef = technicalReviewerRef;
    }
    if (!technicalComments.trim()) {
      errors.technicalComments = true;
      if (!firstErrorRef) firstErrorRef = technicalCommentsRef;
    }

    // Validações de Assinatura
    if (!executante.nome.trim()) {
      errors.nome_executante = true;
      if (!firstErrorRef) firstErrorRef = executanteSectionRef;
    }
    if (!signatures.executante) {
      errors.signature_executante = true;
      if (!firstErrorRef) firstErrorRef = executanteSectionRef;
    }
    if (!supervisor.nome.trim()) {
      errors.nome_supervisor = true;
      if (!firstErrorRef) firstErrorRef = supervisorSectionRef;
    }
    if (!signatures.supervisor) {
      errors.signature_supervisor = true;
      if (!firstErrorRef) firstErrorRef = supervisorSectionRef;
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setShowValidationErrorAlert(true);
      if (firstErrorRef && firstErrorRef.current) {
        firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => setShowValidationErrorAlert(false), 5000);
      return;
    }

    if (printContainerRef.current) {
      setIsGeneratingPDF(true);
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Relatorio_Tecnico_${plan.tag}_${plan.instrumentType.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          letterRendering: true,
          windowWidth: 800 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        await html2pdf().set(opt).from(printContainerRef.current).save();
      } catch (e) {
        console.error("PDF generation failed:", e);
        alert("Ocorreu um erro ao gerar o PDF. Tentando impressão nativa do navegador.");
        window.print();
      } finally {
        setIsGeneratingPDF(false);
      }
    }
  };

  const handleExportJSON = () => {
    const data = { plan, state: { fieldObservations, rootCause, technicalReviewerName, technicalReviewDate, technicalComments, safetyVerification, equipmentStatus, internalTag, installationLocation, isCritical, executante, supervisor, signatures, checkedRisks } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manutencao_${plan.tag}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="relative">
      {/* Overlay de Geração */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md no-print">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center space-y-4 max-w-sm text-center border border-slate-200">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gerando PDF A4</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Otimizando layout técnico e validando verificações de segurança...
            </p>
          </div>
        </div>
      )}

      {/* Mensagem de Erro de Validação */}
      {showValidationErrorAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-black text-xs uppercase tracking-widest animate-bounce no-print flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <span>ERRO: Verificação de segurança deve ser aprovada para imprimir!</span>
        </div>
      )}

      <div 
        ref={printContainerRef} 
        className={`rounded-xl shadow-md border mt-8 transition-all ${themeColorClass} ${containerBgClass} mb-20 relative overflow-hidden`}
        style={{ width: isGeneratingPDF ? '800px' : 'auto', margin: isGeneratingPDF ? '0 auto' : undefined }}
      >
        {/* Header */}
        <div className={`rounded-t-xl p-8 flex justify-between items-start text-white transition-colors duration-500 ${headerBgClass}`}>
          <div className="flex-1">
            <h2 className={`font-bold flex items-center flex-wrap transition-all duration-500 ${isCritical ? 'text-3xl' : 'text-2xl'}`}>
              {isCritical && (
                <span className="mr-3 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
              )}
              <span className={`text-slate-900 text-[10px] px-2 py-1 rounded mr-3 uppercase font-black tracking-widest no-print ${isCritical ? 'bg-yellow-400' : isCorrective ? 'bg-orange-400' : 'bg-yellow-500'}`}>
                {plan.category.toUpperCase()}
              </span>
              <span className="mr-2">RELATÓRIO DE MANUTENÇÃO: {plan.tag}</span>
            </h2>
            <div className="flex items-center text-slate-300 mt-1 font-medium text-sm">
              <span className="uppercase tracking-wider">{plan.instrumentType}</span>
              <span className="mx-2 opacity-50">—</span>
              <span className="uppercase tracking-wider">{plan.platformType}</span>
            </div>
          </div>
          <div className="flex space-x-3 no-print">
            <button onClick={handleExportJSON} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/20 text-xs font-bold">Exportar JSON</button>
            <button 
              onClick={handlePrintPDF} 
              disabled={isGeneratingPDF}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors text-xs font-bold flex items-center shadow-lg active:scale-95 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {isGeneratingPDF ? 'Processando...' : 'Imprimir em A4'}
            </button>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* Dados Gerais */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Periodicidade</span>
              <span className="text-lg font-black text-blue-700">{plan.category === MaintenanceCategory.PREVENTIVE ? `${plan.intervalMonths} Meses` : 'SOB DEMANDA'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Status Final</span>
              <select 
                value={equipmentStatus} 
                onChange={(e) => setEquipmentStatus(e.target.value)} 
                className="w-full bg-transparent font-black text-slate-800 outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.value.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 no-print">
              <span className="text-[10px] font-black text-red-600 uppercase block mb-1">Equip. Crítico?</span>
              <div className="flex items-center mt-1">
                <input 
                  type="checkbox" 
                  checked={isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <span className="ml-2 text-xs font-black text-slate-700">{isCritical ? 'SIM' : 'NÃO'}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">TAG Interna (Op.)</span>
              <input 
                type="text"
                value={internalTag}
                onChange={(e) => setInternalTag(e.target.value.toUpperCase())}
                placeholder="Ex: AB-123"
                className="w-full bg-transparent font-black text-slate-800 outline-none placeholder:text-slate-300 text-xs uppercase"
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Local de Instalação</span>
              <input 
                type="text"
                value={installationLocation}
                onChange={(e) => setInstallationLocation(e.target.value)}
                placeholder="Ex: Deck 3, Setor B..."
                className="w-full bg-transparent font-black text-slate-800 outline-none placeholder:text-slate-300 text-[10px] uppercase"
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Unidade Offshore</span>
              <span className="text-xs font-black text-slate-800 block uppercase truncate">{plan.platformType}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Norma Técnica</span>
              <span className="text-xs font-black text-slate-800 block uppercase truncate">{plan.standards[0] || 'N/A'}</span>
            </div>
          </div>

          {/* APR (NR-37) */}
          <div ref={aprSectionRef} className={`print-avoid-break p-4 rounded-xl transition-all ${validationErrors.apr ? 'bg-red-50 ring-2 ring-red-500' : 'bg-slate-50/50 border border-slate-100'}`}>
            <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-4">
              <h3 className="text-md font-black text-red-600 uppercase tracking-wider flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                NR-37: Análise Preliminar de Risco (APR)
              </h3>
              <div className="flex items-center space-x-4 no-print">
                 {validationErrors.apr && <span className="text-[10px] font-black text-red-600 animate-pulse">VALIDAÇÃO OBRIGATÓRIA</span>}
                 <button onClick={validateAllRisks} className="text-[10px] font-bold bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 shadow-md uppercase tracking-tighter">Confirmar Todos</button>
              </div>
            </div>
            <div className="bg-white border border-red-100 rounded-xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-red-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-[9px] font-black text-red-700 uppercase">Risco</th>
                    <th className="px-4 py-3 text-left text-[9px] font-black text-red-700 uppercase">Medidas de Mitigação</th>
                    <th className="px-4 py-3 text-center text-[9px] font-black text-red-700 uppercase no-print">OK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {plan.safetyAnalysis?.map((risk, idx) => (
                    <tr key={idx} className={`${checkedRisks[idx] ? 'bg-green-50/20' : ''} hover:bg-slate-50 transition-colors`}>
                      <td className="px-4 py-3 text-[11px] font-bold text-red-900 uppercase">{risk.hazard}</td>
                      <td className="px-4 py-3 text-[11px] text-red-700 italic font-medium">{risk.mitigation}</td>
                      <td className="px-4 py-3 text-center no-print">
                        <input 
                          type="checkbox" 
                          checked={!!checkedRisks[idx]}
                          onChange={() => handleRiskToggle(idx)}
                          className="w-6 h-6 text-red-600 rounded-md border-slate-300 focus:ring-red-500 cursor-pointer" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calibração */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 print-avoid-break shadow-inner">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Envelope Operacional de Calibração</h3>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-blue-600 uppercase mb-1">Unidade</span>
                <span className="text-2xl font-black text-blue-700">{plan.technicalSpecifications.unit.toUpperCase()}</span>
              </div>
            </div>
            <div className="relative h-6 bg-slate-200 rounded-full mb-3 shadow-inner">
              <div className="absolute left-[10%] right-[10%] h-full bg-blue-500/20 border-x-2 border-blue-500/40"></div>
            </div>
            <div className="flex justify-between text-[11px] font-black text-slate-600 uppercase">
              <span>{plan.technicalSpecifications.rangeMin} LRL</span>
              <span className="text-blue-600 tracking-widest text-[9px]">Faixa de Trabalho</span>
              <span>{plan.technicalSpecifications.rangeMax} URL</span>
            </div>
          </div>

          {/* Procedimentos */}
          <div className="print-avoid-break">
            <h3 className="text-md font-black text-slate-900 border-b-2 border-blue-600 pb-2 mb-4 uppercase tracking-widest">Procedimentos de Manutenção</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase">Ação Técnica</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase">Referência</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase no-print">OK</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {plan.testProcedures.map((proc) => (
                    <tr key={proc.id}>
                      <td className="px-6 py-5">
                        <p className="text-[12px] font-black text-slate-900 uppercase">{proc.action}</p>
                        <p className="text-[11px] text-slate-500 font-medium italic">{proc.details}</p>
                      </td>
                      <td className="px-6 py-5 text-[10px] font-mono font-black text-slate-400 uppercase">{proc.reference}</td>
                      <td className="px-6 py-5 text-center no-print">
                        <input type="checkbox" className="w-6 h-6 text-blue-600 rounded-md border-slate-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fechamento e Revisão */}
          <div className="print-avoid-break space-y-8">
            <h3 className="text-md font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-4 uppercase tracking-widest">Fechamento Técnico e Auditoria</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Causa Raiz / Diagnóstico Final</label>
                <textarea 
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Relate as anomalias e ações definitivas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm min-h-[100px] outline-none shadow-inner resize-none font-medium"
                />
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-8 shadow-sm">
                <div className="flex items-center space-x-3 text-blue-700 border-b border-slate-200 pb-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <h4 className="text-sm font-black uppercase tracking-widest">Revisão Técnica Engenharia</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Revisor Técnico *</label>
                    <input 
                      ref={technicalReviewerRef}
                      type="text"
                      value={technicalReviewerName}
                      onChange={(e) => setTechnicalReviewerName(e.target.value)}
                      placeholder="NOME / MATRÍCULA"
                      className={`w-full bg-white border rounded-xl px-4 py-3 text-xs font-bold uppercase focus:ring-4 outline-none transition-all ${
                        validationErrors.technicalReviewerName ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Data da Revisão</label>
                    <input 
                      type="date"
                      value={technicalReviewDate}
                      onChange={(e) => setTechnicalReviewDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-orange-600 uppercase tracking-wider">Segurança Aprovada? *</label>
                    <select 
                      ref={safetyVerificationRef}
                      value={safetyVerification}
                      onChange={(e) => {
                        setSafetyVerification(e.target.value);
                        setValidationErrors(prev => ({ ...prev, safetyVerification: false }));
                      }}
                      className={`w-full bg-white border rounded-xl px-4 py-3 text-xs font-black uppercase focus:ring-4 outline-none transition-all ${
                        validationErrors.safetyVerification ? 'border-red-600 ring-4 ring-red-50 bg-red-50 animate-pulse' : 'border-slate-200 focus:ring-blue-100'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim (LIBERADO)</option>
                      <option value="Não">Não (BLOQUEADO)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Parecer Técnico Final *</label>
                  <textarea 
                    ref={technicalCommentsRef}
                    value={technicalComments}
                    onChange={(e) => setTechnicalComments(e.target.value)}
                    placeholder="Parecer detalhado sobre a integridade..."
                    className={`w-full bg-white border rounded-2xl p-5 text-xs font-medium min-h-[140px] focus:ring-4 outline-none transition-all resize-none ${
                      validationErrors.technicalComments ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:ring-blue-100'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Assinaturas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t-4 border-slate-900 mt-20 print-avoid-break">
            <div ref={executanteSectionRef} className="space-y-4 text-center">
              <p className="text-[10px] font-black uppercase text-blue-700 mb-2">Execução: Profissional de Instrumentação *</p>
              {signatures.executante ? (
                <div className={`border-b-4 pb-4 ${validationErrors.signature_executante ? 'border-red-500' : 'border-slate-400'}`}>
                  <img src={signatures.executante} alt="Assinatura" className="h-28 object-contain mx-auto" />
                </div>
              ) : (
                <div className={`rounded-2xl overflow-hidden ${validationErrors.signature_executante ? 'ring-4 ring-red-500' : ''}`}>
                  <canvas ref={canvasExecRef} width={400} height={140} className="w-full h-36 bg-slate-50 border-2 border-dashed rounded-2xl cursor-crosshair no-print" />
                </div>
              )}
              <input 
                type="text"
                placeholder="NOME DO EXECUTANTE *"
                value={executante.nome}
                onChange={(e) => setExecutante(prev => ({...prev, nome: e.target.value.toUpperCase()}))}
                className="w-full text-center text-[12px] font-black uppercase outline-none"
              />
            </div>

            <div ref={supervisorSectionRef} className="space-y-4 text-center">
              <p className="text-[10px] font-black uppercase text-slate-900 mb-2">Aprovação: Liderança / Supervisão *</p>
              {signatures.supervisor ? (
                <div className={`border-b-4 pb-4 ${validationErrors.signature_supervisor ? 'border-red-500' : 'border-slate-400'}`}>
                  <img src={signatures.supervisor} alt="Assinatura" className="h-28 object-contain mx-auto" />
                </div>
              ) : (
                <div className={`rounded-2xl overflow-hidden ${validationErrors.signature_supervisor ? 'ring-4 ring-red-500' : ''}`}>
                  <canvas ref={canvasSupRef} width={400} height={140} className="w-full h-36 bg-slate-50 border-2 border-dashed rounded-2xl cursor-crosshair no-print" />
                </div>
              )}
              <input 
                type="text"
                placeholder="NOME DO SUPERVISOR *"
                value={supervisor.nome}
                onChange={(e) => setSupervisor(prev => ({...prev, nome: e.target.value.toUpperCase()}))}
                className="w-full text-center text-[12px] font-black uppercase outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDisplay;