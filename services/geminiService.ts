
import { GoogleGenAI, Type } from "@google/genai";
import { MaintenancePlan, InstrumentType, PlatformType, UserSettings, MaintenanceCategory } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAINTENANCE_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    category: { type: Type.STRING },
    instrumentType: { type: Type.STRING },
    platformType: { type: Type.STRING },
    tag: { type: Type.STRING },
    intervalMonths: { type: Type.NUMBER, nullable: true },
    failureSymptom: { type: Type.STRING, nullable: true },
    faultDiagnosis: { type: Type.STRING, nullable: true },
    personnel: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    materials: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    standards: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    safetyAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hazard: { type: Type.STRING, description: "Risco identificado (ex: Queda de pressão, Eletricidade)" },
          mitigation: { type: Type.STRING, description: "Medida de controle (ex: Uso de EPI, Bloqueio LOTO)" }
        },
        required: ["hazard", "mitigation"]
      }
    },
    testProcedures: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          action: { type: Type.STRING },
          details: { type: Type.STRING },
          reference: { type: Type.STRING }
        },
        required: ["id", "action", "details", "reference"]
      }
    },
    safetyPrecautions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    technicalSpecifications: {
      type: Type.OBJECT,
      properties: {
        rangeMin: { type: Type.NUMBER },
        rangeMax: { type: Type.NUMBER },
        unit: { type: Type.STRING },
        accuracy: { type: Type.STRING },
        expectedSignal: { type: Type.STRING }
      },
      required: ["rangeMin", "rangeMax", "unit", "accuracy", "expectedSignal"]
    }
  },
  required: [
    "id", "category", "instrumentType", "platformType", "tag", 
    "personnel", "materials", "standards", "testProcedures", "safetyPrecautions",
    "technicalSpecifications", "safetyAnalysis"
  ]
};

export const generateMaintenancePlan = async (
  category: MaintenanceCategory,
  instrumentType: InstrumentType,
  platformType: PlatformType,
  tag: string,
  symptom?: string,
  settings?: UserSettings
): Promise<any> => {
  const isCorrective = category === MaintenanceCategory.CORRECTIVE;
  
  const personnelGuidance = settings?.defaultPersonnel 
    ? `Para a seção de pessoal envolvido, utilize preferencialmente estas funções: ${settings.defaultPersonnel}.`
    : "Determine o pessoal técnico necessário (ex: Instrumentista, Ajudante).";

  const prompt = `Gere um documento técnico de manutenção para o seguinte cenário offshore:
    Categoria: ${category}
    Instrumento: ${instrumentType}
    Tipo de Unidade: ${platformType}
    Tag do Instrumento: ${tag}
    ${isCorrective ? `Sintoma de Falha: ${symptom}` : ''}

    REQUISITOS ADICIONAIS DE SEGURANÇA (NR-37):
    Gere uma Análise Preliminar de Risco (safetyAnalysis) com pelo menos 4 riscos específicos para este instrumento em ambiente offshore e suas respectivas medidas de controle.

    O documento deve incluir:
    1. Um ID único.
    2. Se Preventiva: Intervalo recomendado. Se Corretiva: Provável causa técnica.
    3. Pessoal técnico e recursos.
    4. Normas aplicáveis.
    5. Procedimentos passo a passo.
    6. APR completa (Riscos/Mitigação).
    7. Especificações de Calibração.

    Responda em JSON seguindo o esquema. Aja como um engenheiro sênior.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: MAINTENANCE_PLAN_SCHEMA,
      },
    });

    const plan = JSON.parse(response.text);
    return {
      ...plan,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Falha ao gerar o documento de manutenção.");
  }
};
