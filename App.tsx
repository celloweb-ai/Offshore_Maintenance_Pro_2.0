
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout.tsx';
import PlanForm from './components/PlanForm.tsx';
import PlanDisplay from './components/PlanDisplay.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';
import { MaintenancePlan, InstrumentType, PlatformType, UserSettings, MaintenanceCategory } from './types.ts';
import { generateMaintenancePlan } from './services/geminiService.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plans'>('plans');
  const [currentPlan, setCurrentPlan] = useState<MaintenancePlan | null>(null);
  const [history, setHistory] = useState<MaintenancePlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({
    defaultPersonnel: 'Instrumentista, Ajudante de Manutenção',
    defaultSupervisorRole: 'Supervisor de Manutenção'
  });
  
  const scrollTriggerRef = useRef(false);

  const isValidPlan = (plan: any): plan is MaintenancePlan => {
    if (!plan || typeof plan !== 'object') return false;
    const requiredFields = ['id', 'category', 'instrumentType', 'platformType', 'tag', 'testProcedures', 'technicalSpecifications', 'createdAt'];
    return requiredFields.every(field => field in plan);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('maintenance_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) setHistory(parsed.filter(isValidPlan));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (currentPlan && scrollTriggerRef.current) {
      const element = document.getElementById('plan-display-section');
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      scrollTriggerRef.current = false;
    }
  }, [currentPlan]);

  const handleGenerate = async (category: MaintenanceCategory, instrument: InstrumentType, platform: PlatformType, tag: string, symptom: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateMaintenancePlan(category, instrument, platform, tag, symptom, settings);
      if (isValidPlan(plan)) {
        setCurrentPlan(plan);
        scrollTriggerRef.current = true;
        const newHistory = [plan, ...history].slice(0, 20);
        setHistory(newHistory);
        localStorage.setItem('maintenance_history', JSON.stringify(newHistory));
      } else {
        throw new Error("Erro na estrutura do plano gerado.");
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (plan: MaintenancePlan) => {
    setError(null);
    setActiveTab('plans');
    setCurrentPlan(plan);
    scrollTriggerRef.current = true;
  };

  return (
    <Layout 
      onOpenSettings={() => setShowSettings(true)} 
      activeTab={activeTab}
      onNavigate={setActiveTab}
    >
      <div className="max-w-6xl mx-auto">
        {showSettings && (
          <SettingsPanel 
            currentSettings={settings}
            onClose={() => setShowSettings(false)}
            onSave={(s) => { setSettings(s); localStorage.setItem('maintenance_settings', JSON.stringify(s)); }}
          />
        )}

        {activeTab === 'plans' ? (
          <div className="space-y-8">
            <PlanForm onSubmit={handleGenerate} isLoading={isLoading} history={history} />
            {error && <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500 text-red-700">{error}</div>}
            <div id="plan-display-section">
              {currentPlan ? <PlanDisplay plan={currentPlan} /> : !isLoading && <div className="text-center py-20 text-slate-400">Inicie uma configuração acima.</div>}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 font-bold">Histórico Técnico</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
                  <tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Categoria</th><th className="px-6 py-4">TAG</th><th className="px-6 py-4">Ação</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">{new Date(h.createdAt).toLocaleDateString()}</td>
                      <td className={`px-6 py-4 font-bold ${h.category === MaintenanceCategory.CORRECTIVE ? 'text-orange-600' : 'text-blue-600'}`}>{h.category}</td>
                      <td className="px-6 py-4 font-black">{h.tag}</td>
                      <td className="px-6 py-4"><button onClick={() => loadFromHistory(h)} className="text-blue-600 font-bold hover:underline">Abrir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
