export type Category =
  | "Fundamentals"
  | "Pharmacology"
  | "Cardiac"
  | "Respiratory"
  | "Endocrine"
  | "Renal"
  | "Maternity"
  | "Pediatrics"
  | "Mental Health"
  | "Infection Control"
  | "Emergency"
  | "Critical Care"
  | "Prioritization"
  | "Gastrointestinal"
  | "Neurological";

export type Question = {
  id: string;
  cat: Category;
  q: string;
  a: string;
  keys: string[];
  context: string;
  explanation: string;
  clinicalSignificance: string;
  relatedConcepts: string[];
};

export const categories: { name: Category; topics: string }[] = [
  { name: "Fundamentals", topics: "Vital signs, safety, nursing process" },
  { name: "Pharmacology", topics: "Antidotes, electrolytes, monitoring" },
  { name: "Cardiac", topics: "ECG, circulation, arrhythmias" },
  { name: "Respiratory", topics: "COPD, ARDS, breath sounds" },
  { name: "Endocrine", topics: "Diabetes, hypoglycemia, thyroid" },
  { name: "Renal", topics: "AKI, electrolytes, dialysis" },
  { name: "Maternity", topics: "Labor, fetal monitoring, preeclampsia" },
  { name: "Pediatrics", topics: "Milestones, vital signs, immunizations" },
  { name: "Mental Health", topics: "Mood, anxiety, psychosis" },
  { name: "Infection Control", topics: "Precautions, sepsis, hygiene" },
  { name: "Emergency", topics: "ABCs, surveys, GCS" },
  { name: "Critical Care", topics: "Ventilation, PEEP, delirium" },
  { name: "Prioritization", topics: "Maslow, delegation, prioritization" },
  { name: "Gastrointestinal", topics: "Liver disease, GI bleeding, pancreatitis" },
  { name: "Neurological", topics: "Stroke, seizures, neurodegeneration" },
];

export const questionBank: Question[] = [
  { id: "fund-hr", cat: "Fundamentals", q: "What is the normal resting heart rate for an adult?", a: "60 to 100 beats per minute", keys: ["60", "100"], context: "Resting heart rate is a core cardiovascular vital sign.", explanation: "A normal adult resting heart rate is 60 to 100 beats per minute. Well-conditioned athletes may have lower resting rates.", clinicalSignificance: "Persistent tachycardia or bradycardia can signal medication effects, fever, hypoxia, or cardiac dysfunction.", relatedConcepts: ["Vital signs", "Cardiovascular assessment"] },
  { id: "pharm-warfarin", cat: "Pharmacology", q: "Which laboratory value is used to monitor warfarin therapy?", a: "The prothrombin time and INR", keys: ["prothrombin", "INR"], context: "Warfarin changes the clotting cascade and requires laboratory monitoring.", explanation: "The international normalized ratio, or INR, standardizes prothrombin time and guides warfarin dosing.", clinicalSignificance: "Monitoring reduces the risk of preventable bleeding or inadequate anticoagulation.", relatedConcepts: ["Anticoagulants", "Bleeding precautions"] },
  { id: "cardiac-mi", cat: "Cardiac", q: "What symptom is most concerning for acute myocardial infarction?", a: "New crushing chest pressure with diaphoresis and shortness of breath", keys: ["chest", "pressure", "diaphoresis"], context: "Acute coronary occlusion may present with pressure, autonomic symptoms, and respiratory discomfort.", explanation: "New chest pressure accompanied by sweating or shortness of breath warrants immediate assessment and escalation.", clinicalSignificance: "Early recognition supports rapid ECG acquisition and reperfusion-focused treatment.", relatedConcepts: ["Chest pain", "12-lead ECG"] },
  { id: "resp-copd", cat: "Respiratory", q: "What position often improves breathing for a patient with COPD?", a: "High-Fowler position with arms supported", keys: ["high-fowler", "arms", "supported"], context: "Positioning can reduce diaphragmatic pressure and improve accessory muscle use.", explanation: "An upright position, often with the arms supported, can maximize chest expansion and ease work of breathing.", clinicalSignificance: "Positioning is an immediate, low-risk intervention while oxygenation and the cause of distress are evaluated.", relatedConcepts: ["Dyspnea", "Breathing mechanics"] },
  { id: "endo-hypo", cat: "Endocrine", q: "What should a conscious patient with hypoglycemia receive first?", a: "A fast-acting carbohydrate such as glucose juice or tablets", keys: ["fast-acting", "carbohydrate", "glucose"], context: "Neuroglycopenic symptoms can progress quickly when blood glucose is low.", explanation: "A conscious patient who can swallow should receive a rapid source of glucose, followed by reassessment.", clinicalSignificance: "Prompt treatment prevents seizure, loss of consciousness, and neurologic injury.", relatedConcepts: ["Diabetes", "Point-of-care glucose"] },
  { id: "renal-aki", cat: "Renal", q: "Which finding is most concerning in acute kidney injury?", a: "A rapidly increasing serum potassium level", keys: ["increasing", "potassium"], context: "Reduced renal excretion can cause dangerous electrolyte accumulation.", explanation: "Hyperkalemia can disrupt cardiac conduction and requires prompt assessment, ECG monitoring, and treatment.", clinicalSignificance: "A changing potassium level may become life-threatening before other symptoms appear.", relatedConcepts: ["Electrolytes", "Cardiac monitoring"] },
  { id: "maternity-preeclampsia", cat: "Maternity", q: "Which finding requires immediate evaluation in a patient with preeclampsia?", a: "Severe headache with visual changes", keys: ["severe", "headache", "visual"], context: "Neurologic symptoms can indicate worsening disease and cerebral involvement.", explanation: "Severe headache or visual changes are warning signs that require immediate assessment and escalation.", clinicalSignificance: "Early intervention helps prevent seizure and maternal or fetal complications.", relatedConcepts: ["Blood pressure", "Eclampsia"] },
  { id: "peds-dehydration", cat: "Pediatrics", q: "What is an early sign of dehydration in an infant?", a: "Decreased wet diapers", keys: ["decreased", "wet", "diapers"], context: "Infants may deteriorate quickly because of limited fluid reserves.", explanation: "A reduction in wet diapers is a practical early indicator of reduced fluid intake or increased loss.", clinicalSignificance: "Trend urine output with other findings such as mucous membranes, tears, weight, and perfusion.", relatedConcepts: ["Fluid balance", "Infant assessment"] },
  { id: "mental-therapeutic", cat: "Mental Health", q: "What is a therapeutic response to a patient who says, 'I feel hopeless'?", a: "Tell me more about what is making you feel hopeless", keys: ["tell", "more", "hopeless"], context: "Open-ended responses encourage expression without minimizing the patient’s experience.", explanation: "A calm, open-ended response validates the concern and creates space to assess safety and support needs.", clinicalSignificance: "Direct, compassionate assessment is essential when depression or self-harm risk may be present.", relatedConcepts: ["Therapeutic communication", "Safety assessment"] },
  { id: "infection-cdiff", cat: "Infection Control", q: "Which precaution is required for a patient with C. difficile?", a: "Contact precautions with soap-and-water hand hygiene", keys: ["contact", "soap", "water"], context: "C. difficile spores are difficult to remove with alcohol-based sanitizer alone.", explanation: "Use contact precautions and wash hands with soap and water after care.", clinicalSignificance: "Correct precautions reduce transmission of resilient spores in healthcare settings.", relatedConcepts: ["Isolation", "Hand hygiene"] },
  { id: "emergency-abc", cat: "Emergency", q: "In the primary survey, what should the nurse assess first?", a: "Airway", keys: ["airway"], context: "The ABC approach addresses threats to life in priority order.", explanation: "Airway assessment comes first, followed by breathing and circulation, while controlling immediate catastrophic bleeding.", clinicalSignificance: "A blocked airway can cause irreversible harm within minutes.", relatedConcepts: ["Primary survey", "Rapid response"] },
  { id: "critical-peep", cat: "Critical Care", q: "What is the purpose of PEEP on a ventilator?", a: "To keep alveoli open at the end of expiration", keys: ["alveoli", "open", "expiration"], context: "Positive end-expiratory pressure changes alveolar recruitment.", explanation: "PEEP helps prevent end-expiratory alveolar collapse and can improve oxygenation.", clinicalSignificance: "The nurse monitors oxygenation, blood pressure, and signs of barotrauma as PEEP changes.", relatedConcepts: ["Mechanical ventilation", "Oxygenation"] },
  { id: "priority-airway", cat: "Prioritization", q: "Which patient should the nurse assess first?", a: "A patient with new stridor after extubation", keys: ["stridor", "extubation"], context: "Stridor suggests upper-airway narrowing.", explanation: "New stridor after extubation can rapidly progress to airway obstruction and requires immediate assessment.", clinicalSignificance: "Airway compromise takes priority over stable pain or routine care needs.", relatedConcepts: ["Delegation", "Airway management"] },
  { id: "gi-bleed", cat: "Gastrointestinal", q: "Which finding suggests an upper GI bleed?", a: "Coffee-ground emesis", keys: ["coffee-ground", "emesis"], context: "Blood exposed to gastric acid can change appearance.", explanation: "Coffee-ground emesis indicates partially digested blood in the upper gastrointestinal tract.", clinicalSignificance: "Assess hemodynamic stability and escalate promptly because bleeding may be ongoing.", relatedConcepts: ["Hemorrhage", "Fluid resuscitation"] },
  { id: "neuro-stroke", cat: "Neurological", q: "What is the priority action for sudden facial droop and speech difficulty?", a: "Activate the stroke response and document the last known well time", keys: ["stroke", "last", "known", "well"], context: "Time-sensitive stroke treatment depends on rapid recognition and a reliable onset timeline.", explanation: "Activate the stroke pathway and establish the last known well time while completing urgent assessment.", clinicalSignificance: "Timely treatment may reduce permanent neurologic disability.", relatedConcepts: ["FAST", "Neurologic assessment"] },
];
