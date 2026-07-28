
import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const COLORS = {
  gold: "#F5C400",
  goldDark: "#C49B00",
  goldLight: "#FFF9E0",
  black: "#0D0D0D",
  charcoal: "#1A1A1A",
  gray: "#6B6B6B",
  lightGray: "#F4F4F2",
  white: "#FAFAF8",
};

const diagnosticSections = [
  {
    id: "overs",
    label: "DIAGNÓSTICO INICIAL",
    title: "Los 3 Overs",
    subtitle: "Identifica dónde se está drenando la energía de tu cliente",
    color: COLORS.gold,
    questions: [
      {
        id: "o1",
        over: "OVERWORKED",
        text: "¿Con qué frecuencia tu cliente trabaja más de lo necesario por miedo a que el resultado no sea perfecto?",
        options: ["Casi siempre — es su patrón dominante", "Con frecuencia — especialmente en proyectos visibles", "A veces — en momentos de presión", "Rara vez — tiene esto bajo control"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "o2",
        over: "OVERCOMMITTED",
        text: "¿Tu cliente dice sí a responsabilidades que no están en su descripción de puesto (office housework)?",
        options: ["Sí, constantemente y lo resiente", "Sí, lo hace pero empieza a cuestionarlo", "A veces, en situaciones específicas", "No, tiene límites claros en esto"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "o3",
        over: "OVERWHELMED",
        text: "¿Cómo describe tu cliente su estado energético al final de una semana típica?",
        options: ["Agotada — siente que no alcanza nada importante", "Ocupada — mucho movimiento, poco impacto estratégico", "Funcional — entrega pero sin energía para más", "Enfocada — gestiona bien sus prioridades"],
        scores: [4, 3, 2, 1],
      },
    ],
  },
  {
    id: "P",
    label: "PILAR P",
    title: "Propósito — Llamado Visible",
    subtitle: "¿Tiene claridad sobre quién es y para qué quiere el nivel siguiente?",
    color: "#2D6A4F",
    questions: [
      {
        id: "p1",
        text: "¿Puede tu cliente articular en 1–2 oraciones por qué específicamente quiere llegar a VP (más allá del título)?",
        options: ["No — no lo ha pensado con claridad", "Vagamente — habla de 'querer más impacto' sin especificar", "En desarrollo — tiene una idea pero no está pulida", "Sí — lo expresa con claridad y convicción"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "p2",
        text: "¿Qué tan visible es tu cliente ante los líderes senior de su organización?",
        options: ["Invisible — nadie la conoce más allá de su área", "Conocida como ejecutora confiable, no como estratega", "Tiene algo de visibilidad pero no consistente", "Es conocida y reconocida como estratega en múltiples niveles"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "p3",
        text: "¿Tu cliente ha aprendido a minimizar aspectos de su identidad (calidez, acento, perspectiva cultural) para 'encajar'?",
        options: ["Sí — activamente se reduce para generar menos fricción", "Con frecuencia — especialmente en espacios de poder", "A veces — en situaciones de alta visibilidad", "No — lidera desde su identidad completa"],
        scores: [4, 3, 2, 1],
      },
    ],
  },
  {
    id: "E",
    label: "PILAR E",
    title: "Energía — Inteligencia Energética",
    subtitle: "¿Gestiona su energía como activo estratégico o la está agotando?",
    color: "#9B2335",
    questions: [
      {
        id: "e1",
        text: "¿Tu cliente tiene bloques de tiempo protegidos en su semana para trabajo estratégico (sin reuniones ni correos)?",
        options: ["No — su agenda está completamente controlada por otros", "Rara vez — lo intenta pero siempre cede", "Tiene algo pero es inconsistente", "Sí — protege tiempo estratégico semanalmente"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "e2",
        text: "¿Cómo delega tu cliente responsabilidades a su equipo?",
        options: ["No delega — necesita revisar y controlar todo", "Delega poco — confía con dificultad", "Delega algunas cosas pero retiene demasiado", "Delega bien — libera su energía para lo estratégico"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "e3",
        text: "¿Tu cliente distingue entre estar ocupada y tener rendimiento sostenible?",
        options: ["No — confunde actividad con impacto constantemente", "Lo entiende intelectualmente pero no lo practica", "Lo practica a veces, no de forma sistemática", "Sí — gestiona su agenda desde el impacto estratégico"],
        scores: [4, 3, 2, 1],
      },
    ],
  },
  {
    id: "A",
    label: "PILAR A",
    title: "Autenticidad — Alineación e Identidad",
    subtitle: "¿Lidera desde quien es o desde quien esperan que sea?",
    color: "#4A3728",
    questions: [
      {
        id: "a1",
        text: "¿Qué tan coherentes son los valores declarados de tu cliente con sus acciones bajo presión?",
        options: ["Hay una brecha significativa — actúa diferente bajo presión", "A veces coherente, a veces no — es inconsistente", "Mayormente coherente con algunos puntos ciegos", "Alta coherencia — sus valores guían sus decisiones bajo presión"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "a2",
        text: "¿Tu cliente tiene dificultad para expresar su perspectiva en reuniones con liderazgo senior?",
        options: ["Sí — se minimiza, suaviza ideas o espera que otros hablen", "Con frecuencia — especialmente si percibe resistencia", "A veces — en contextos de alta visibilidad o conflicto", "No — expresa su perspectiva con claridad y convicción"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "a3",
        text: "¿Cómo maneja tu cliente el 'office housework' (trabajo no reconocido asignado desproporcionadamente)?",
        options: ["Lo absorbe todo sin cuestionar — tiene límites muy porosos", "Lo reconoce como problema pero no sabe cómo cambiarlo", "Ha mejorado pero aún le cuesta decir no con claridad", "Tiene límites claros y los mantiene con gracia"],
        scores: [4, 3, 2, 1],
      },
    ],
  },
  {
    id: "K",
    label: "PILAR K",
    title: "Key Results — Impacto Visible",
    subtitle: "¿Sus resultados son conocidos por quienes deciden su futuro?",
    color: "#1B4F8A",
    questions: [
      {
        id: "k1",
        text: "¿Puede tu cliente articular sus 3 resultados de mayor impacto de los últimos 24 meses con datos y contexto organizacional?",
        options: ["No — tiene logros pero no los ha documentado estratégicamente", "Puede listar actividades pero no impacto medible", "Tiene algunos resultados articulados pero incompletos", "Sí — tiene una narrativa de impacto clara y con métricas"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "k2",
        text: "¿Tu cliente ha tenido una conversación directa con su líder sobre su ambición de llegar a VP?",
        options: ["No — no ha nombrado su ambición explícitamente", "Lo ha insinuado pero nunca dicho directamente", "Lo ha mencionado una vez, sin profundizar", "Sí — tiene conversaciones activas sobre su plan de ascenso"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "k3",
        text: "¿Tiene tu cliente un sponsor activo (no solo mentor) que mueva su nombre en conversaciones donde ella no está?",
        options: ["No — avanza completamente en solitario", "Tiene mentores pero ningún sponsor activo", "Tiene relaciones potenciales pero no las ha activado", "Sí — tiene al menos un sponsor activo en su organización"],
        scores: [4, 3, 2, 1],
      },
    ],
  },
];

const getOversProfile = (score) => {
  if (score >= 10) return { label: "Alerta crítica", color: "#C0392B", desc: "Los 3 Overs están activos simultáneamente. Primera prioridad: estabilizar la energía antes de cualquier trabajo estratégico." };
  if (score >= 7) return { label: "Zona de riesgo", color: "#E67E22", desc: "Uno o dos Overs dominantes. Hay espacio para trabajar posicionamiento, pero la energía necesita atención paralela." };
  return { label: "Funcional", color: "#27AE60", desc: "Los Overs no son la barrera principal. El trabajo puede centrarse directamente en posicionamiento y visibilidad." };
};

const getPeakProfile = (scores) => {
  const labels = { P: "Propósito", E: "Energía", A: "Autenticidad", K: "Key Results" };
  const weakest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return { weakest: labels[weakest[0]], score: weakest[1] };
};

const getReadinessLevel = (total) => {
  if (total >= 42) return { level: "Lista para VP", color: "#27AE60", pct: 90, desc: "Posicionamiento sólido. El trabajo es refinar narrativa y activar sponsors." };
  if (total >= 30) return { level: "En construcción estratégica", color: COLORS.gold, pct: 60, desc: "Base importante. Necesita estructura, visibilidad y 1–2 shifts críticos." };
  if (total >= 18) return { level: "Zona de reenfoque", color: "#E67E22", pct: 35, desc: "Sus resultados son más sólidos de lo que su posicionamiento refleja. El gap está en visibilidad y narrativa." };
  return { level: "Inicio del recorrido", color: "#C0392B", pct: 15, desc: "Trabajo profundo de identidad y energía antes de posicionamiento. Gran potencial, camino claro." };
};

function DiagnosticoVisible() {
  const [phase, setPhase] = useState("intro"); // intro | diagnostic | results
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [selected, setSelected] = useState(null);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const emailOk = isValidEmail(email);

  const section = diagnosticSections[currentSection];
  const question = section?.questions[currentQ];
  const totalQuestions = diagnosticSections.reduce((a, s) => a + s.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = answeredCount / totalQuestions;

  const handleSelect = (idx) => setSelected(idx);

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = { ...answers, [question.id]: { score: question.scores[selected], label: question.options[selected], section: section.id } };
    setAnswers(newAnswers);
    setSelected(null);
    if (currentQ < section.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else if (currentSection < diagnosticSections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQ(0);
    } else {
      setPhase("results");
    }
  };

  const calcResults = () => {
    const overScore = ["o1","o2","o3"].reduce((a,id) => a + (answers[id]?.score || 0), 0);
    const peakScores = { P: 0, E: 0, A: 0, K: 0 };
    ["p1","p2","p3"].forEach(id => peakScores.P += answers[id]?.score || 0);
    ["e1","e2","e3"].forEach(id => peakScores.E += answers[id]?.score || 0);
    ["a1","a2","a3"].forEach(id => peakScores.A += answers[id]?.score || 0);
    ["k1","k2","k3"].forEach(id => peakScores.K += answers[id]?.score || 0);
    const totalPeak = Object.values(peakScores).reduce((a,b) => a+b, 0);
    return { overScore, peakScores, totalPeak };
  };

  const restartDiagnostic = () => {
    setPhase("intro");
    setCurrentSection(0);
    setCurrentQ(0);
    setAnswers({});
    setSelected(null);
    setClientName("");
    setEmail("");
    setEmailTouched(false);
  };

  if (phase === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.black, fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: COLORS.gold, color: COLORS.black, fontSize: 11, fontFamily: "monospace", letterSpacing: "0.15em", padding: "6px 16px", marginBottom: "2rem", fontWeight: 700 }}>
            PROTOCOLO DE DIAGNÓSTICO
          </div>
          <h1 style={{ color: COLORS.white, fontSize: "clamp(2.5rem, 8vw, 4rem)", fontWeight: 400, lineHeight: 1, margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>
            Visible
          </h1>
          <p style={{ color: COLORS.gold, fontSize: "0.85rem", letterSpacing: "0.2em", fontFamily: "monospace", marginBottom: "2.5rem", textTransform: "uppercase" }}>
            Marco PEAK · VP Readiness
          </p>
          <p style={{ color: "#AAA", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2.5rem", fontStyle: "italic" }}>
            Este protocolo evalúa los 3 Overs y los 4 pilares del Marco PEAK para identificar exactamente dónde está el gap entre el nivel actual de tu cliente y el nivel VP.
          </p>
          <div style={{ background: "#1A1A1A", border: "1px solid #333", borderRadius: 12, padding: "1.5rem", marginBottom: "1rem", textAlign: "left" }}>
            <p style={{ color: "#888", fontSize: "0.75rem", letterSpacing: "0.1em", fontFamily: "monospace", marginBottom: "0.75rem" }}>NOMBRE DE LA CLIENTE (OPCIONAL)</p>
            <input
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Ej: Ana García"
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${COLORS.gold}`, color: COLORS.white, fontSize: "1.1rem", padding: "0.5rem 0", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ background: "#1A1A1A", border: `1px solid ${emailTouched && !emailOk ? "#C0392B" : "#333"}`, borderRadius: 12, padding: "1.5rem", marginBottom: "2rem", textAlign: "left" }}>
            <p style={{ color: "#888", fontSize: "0.75rem", letterSpacing: "0.1em", fontFamily: "monospace", marginBottom: "0.75rem" }}>
              CORREO ELECTRÓNICO <span style={{ color: COLORS.gold }}>(OBLIGATORIO)</span>
            </p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="tu@correo.com"
              aria-label="Correo electrónico (obligatorio)"
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${emailTouched && !emailOk ? "#C0392B" : COLORS.gold}`, color: COLORS.white, fontSize: "1.1rem", padding: "0.5rem 0", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }}
            />
            {emailTouched && !emailOk && (
              <p style={{ color: "#C0392B", fontSize: "0.75rem", fontFamily: "monospace", margin: "0.6rem 0 0" }}>
                Ingresa un correo electrónico válido para continuar.
              </p>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2.5rem" }}>
            {[["15 preguntas", "5 secciones"], ["Los 3 Overs", "Marco PEAK completo"]].map(([a, b], i) => (
              <div key={i} style={{ background: "#111", border: "1px solid #2A2A2A", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                <div style={{ color: COLORS.gold, fontSize: "0.85rem", fontFamily: "monospace" }}>{a}</div>
                <div style={{ color: "#666", fontSize: "0.75rem", fontFamily: "monospace", marginTop: 2 }}>{b}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => { if (emailOk) { setPhase("diagnostic"); } else { setEmailTouched(true); } }}
            disabled={!emailOk}
            style={{ background: emailOk ? COLORS.gold : "#2A2A2A", color: emailOk ? COLORS.black : "#666", border: "none", padding: "1rem 3rem", fontSize: "0.9rem", fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 700, cursor: emailOk ? "pointer" : "not-allowed", borderRadius: 4, width: "100%", textTransform: "uppercase", transition: "all 0.2s ease" }}
          >
            Iniciar Diagnóstico →
          </button>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const { overScore, peakScores, totalPeak } = calcResults();
    const oversProfile = getOversProfile(overScore);
    const peakProfile = getPeakProfile(peakScores);
    const readiness = getReadinessLevel(totalPeak);
    const peakMax = 12;
    const peakLabels = { P: "Propósito", E: "Energía", A: "Autenticidad", K: "Key Results" };
    const peakColors = { P: "#2D6A4F", E: "#9B2335", A: "#4A3728", K: "#1B4F8A" };

    const priorityShifts = () => {
      const low = Object.entries(peakScores).sort((a,b) => b[1]-a[1]).slice(0,2).map(([k]) => k);
      const shiftMap = {
        P: "Shift 1 & 2 — Claridad estratégica e influencia: tu cliente necesita definir su Llamado Visible y pasar de acumular habilidades a construir influencia.",
        E: "Shift 3 — Disponibilidad ilimitada → acción estratégica: rediseñar la agenda, delegar y proteger energía para lo que posiciona VP.",
        A: "Shift 4 — Reconfiguración de identidad: trabajar la autoexigencia silenciosa y autorizar a tu cliente a ocupar el espacio que ya se ganó.",
        K: "Shift 5 & narrativa — Acompañamiento estratégico: activar sponsors, construir portafolio de impacto y narrativa de 90 segundos."
      };
      return low.map(k => shiftMap[k]);
    };

    return (
      <div style={{ minHeight: "100vh", background: COLORS.black, fontFamily: "'Georgia', serif", padding: "2rem", color: COLORS.white }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ display: "inline-block", background: COLORS.gold, color: COLORS.black, fontSize: 11, fontFamily: "monospace", letterSpacing: "0.15em", padding: "6px 16px", marginBottom: "1.5rem", fontWeight: 700 }}>
              RESULTADOS DEL DIAGNÓSTICO
            </div>
            <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 400, color: COLORS.white, margin: "0 0 0.5rem" }}>
              {clientName ? clientName : "Tu Cliente"}
            </h1>
            {email && (
              <p style={{ color: COLORS.gold, fontFamily: "monospace", fontSize: "0.8rem", letterSpacing: "0.05em", margin: "0 0 0.35rem" }}>{email}</p>
            )}
            <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", letterSpacing: "0.1em" }}>Marco PEAK · VP Readiness · Madelin Santana</p>
          </div>

          {/* VP Readiness Score */}
          <div style={{ background: "#111", border: `1px solid ${readiness.color}33`, borderRadius: 12, padding: "2rem", marginBottom: "1.5rem", textAlign: "center" }}>
            <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "1rem" }}>NIVEL DE PREPARACIÓN VP</p>
            <div style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 400, color: readiness.color, marginBottom: "1rem" }}>{readiness.level}</div>
            <div style={{ background: "#1A1A1A", borderRadius: 100, height: 8, width: "100%", marginBottom: "1rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${readiness.pct}%`, background: readiness.color, borderRadius: 100, transition: "width 1s ease" }} />
            </div>
            <p style={{ color: "#AAA", fontSize: "0.9rem", fontStyle: "italic", lineHeight: 1.6 }}>{readiness.desc}</p>
          </div>

          {/* 3 Overs */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.12em", margin: 0 }}>LOS 3 OVERS</p>
              <span style={{ background: `${oversProfile.color}22`, color: oversProfile.color, fontFamily: "monospace", fontSize: "0.75rem", padding: "3px 10px", borderRadius: 100 }}>{oversProfile.label}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              {[["o1","OW\nORKED"],["o2","OC\nOMMIT"],["o3","OW\nHELM"]].map(([id, lbl]) => {
                const sc = answers[id]?.score || 1;
                const pct = ((sc-1)/3)*100;
                return (
                  <div key={id} style={{ background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                    <div style={{ color: "#666", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.08em", marginBottom: "0.5rem", whiteSpace: "pre-line" }}>OVER{lbl}</div>
                    <div style={{ background: "#1A1A1A", borderRadius: 100, height: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct > 65 ? "#C0392B" : pct > 30 ? COLORS.gold : "#27AE60", borderRadius: 100 }} />
                    </div>
                    <div style={{ color: pct > 65 ? "#C0392B" : pct > 30 ? COLORS.gold : "#27AE60", fontFamily: "monospace", fontSize: "0.75rem", marginTop: 6 }}>
                      {pct > 65 ? "Crítico" : pct > 30 ? "Presente" : "Gestionado"}
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ color: "#AAA", fontSize: "0.85rem", fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>{oversProfile.desc}</p>
          </div>

          {/* PEAK Radar */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "1.25rem" }}>MARCO PEAK — PERFIL DE BRECHA</p>
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {Object.entries(peakScores).map(([key, score]) => {
                const pct = Math.round(((peakMax - score) / (peakMax - 3)) * 100);
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                      <span style={{ color: peakColors[key], fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700 }}>{key} — {peakLabels[key]}</span>
                      <span style={{ color: pct > 60 ? "#C0392B" : pct > 30 ? COLORS.gold : "#27AE60", fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {pct > 60 ? "Brecha alta" : pct > 30 ? "En desarrollo" : "Sólido"}
                      </span>
                    </div>
                    <div style={{ background: "#1A1A1A", borderRadius: 100, height: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct > 60 ? "#C0392B" : pct > 30 ? COLORS.gold : "#27AE60", borderRadius: 100 }} />
                    </div>
                    <div style={{ color: "#555", fontSize: "0.7rem", fontFamily: "monospace", marginTop: 3 }}>
                      {pct > 60 ? "Área de trabajo prioritaria" : pct > 30 ? "Área de fortalecimiento" : "Capitalizar como fortaleza"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Shifts */}
          <div style={{ background: "#0D0D0D", border: `1px solid ${COLORS.gold}44`, borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <p style={{ color: COLORS.gold, fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "1.25rem" }}>SHIFTS PRIORITARIOS PARA ESTA CLIENTE</p>
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {priorityShifts().map((shift, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, background: COLORS.gold, color: COLORS.black, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                  <p style={{ color: "#CCC", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{shift}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Session Plan */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: "1.5rem", marginBottom: "2rem" }}>
            <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "1.25rem" }}>PLAN DE TRABAJO SUGERIDO — 16 SESIONES</p>
            {[
              ["Sesiones 1–4", "PILAR P", "Activar Llamado Visible + claridad de propósito", "#2D6A4F"],
              ["Sesiones 5–8", "PILAR E", "Rediseño energético + núcleo motivador + delegación", "#9B2335"],
              ["Sesiones 9–12", "PILAR A", "Autenticidad en acción: coherencia, presencia y límites", "#4A3728"],
              ["Sesiones 13–16", "PILAR K", "Portafolio de impacto + narrativa estratégica + sponsors", "#1B4F8A"],
            ].map(([ses, pilar, desc, col]) => (
              <div key={ses} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", paddingBottom: "0.85rem", marginBottom: "0.85rem", borderBottom: "1px solid #1E1E1E" }}>
                <div style={{ width: 70, flexShrink: 0 }}>
                  <div style={{ color: "#666", fontFamily: "monospace", fontSize: "0.65rem" }}>{ses}</div>
                  <div style={{ color: col, fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700 }}>{pilar}</div>
                </div>
                <p style={{ color: "#AAA", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <button
              onClick={restartDiagnostic}
              style={{ background: "transparent", border: `1px solid ${COLORS.gold}`, color: COLORS.gold, padding: "0.85rem", fontFamily: "monospace", fontSize: "0.8rem", letterSpacing: "0.08em", cursor: "pointer", borderRadius: 4 }}
            >
              ← Nueva cliente
            </button>
            <button
              onClick={() => window.print?.()}
              style={{ background: COLORS.gold, border: "none", color: COLORS.black, padding: "0.85rem", fontFamily: "monospace", fontSize: "0.8rem", letterSpacing: "0.08em", cursor: "pointer", fontWeight: 700, borderRadius: 4 }}
            >
              Guardar resultados ↗
            </button>
          </div>
          <p style={{ textAlign: "center", color: "#444", fontFamily: "monospace", fontSize: "0.7rem", marginTop: "2rem", letterSpacing: "0.08em" }}>
            VISIBLE · MARCO PEAK · © MADELIN SANTANA 2026
          </p>
        </div>
      </div>
    );
  }

  // Diagnostic phase
  const sectionProgress = diagnosticSections.slice(0, currentSection).reduce((a, s) => a + s.questions.length, 0) + currentQ;
  const totalQ = totalQuestions;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.black, fontFamily: "'Georgia', serif", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "#0D0D0D", borderBottom: "1px solid #1E1E1E", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ color: section.color, fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.12em" }}>{section.label}</span>
          <span style={{ color: "#444", margin: "0 8px", fontFamily: "monospace" }}>·</span>
          <span style={{ color: "#666", fontFamily: "monospace", fontSize: "0.7rem" }}>{section.title}</span>
        </div>
        <span style={{ color: "#555", fontFamily: "monospace", fontSize: "0.7rem" }}>{sectionProgress + 1} / {totalQ}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#1A1A1A" }}>
        <div style={{ height: "100%", width: `${((sectionProgress + 1) / totalQ) * 100}%`, background: section.color, transition: "width 0.3s ease" }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 580, width: "100%" }}>
          {/* Section header */}
          {currentQ === 0 && (
            <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #1E1E1E" }}>
              <div style={{ display: "inline-block", background: section.color, color: "#fff", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.12em", padding: "4px 12px", marginBottom: "0.75rem" }}>{section.label}</div>
              <h2 style={{ color: COLORS.white, fontSize: "1.5rem", fontWeight: 400, margin: "0 0 0.5rem" }}>{section.title}</h2>
              <p style={{ color: "#777", fontSize: "0.9rem", fontStyle: "italic", margin: 0 }}>{section.subtitle}</p>
            </div>
          )}

          {/* Question */}
          <div style={{ marginBottom: "2rem" }}>
            {question.over && (
              <div style={{ display: "inline-block", border: `1px solid ${section.color}`, color: section.color, fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", padding: "3px 10px", marginBottom: "1rem", borderRadius: 2 }}>
                {question.over}
              </div>
            )}
            <p style={{ color: COLORS.white, fontSize: "1.05rem", lineHeight: 1.7, margin: 0 }}>{question.text}</p>
          </div>

          {/* Options */}
          <div style={{ display: "grid", gap: "0.65rem", marginBottom: "2rem" }}>
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  background: selected === i ? `${section.color}15` : "#0D0D0D",
                  border: `1px solid ${selected === i ? section.color : "#2A2A2A"}`,
                  color: selected === i ? COLORS.white : "#AAA",
                  padding: "0.85rem 1rem",
                  textAlign: "left",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  cursor: "pointer",
                  borderRadius: 6,
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ width: 20, height: 20, border: `1.5px solid ${selected === i ? section.color : "#444"}`, borderRadius: "50%", background: selected === i ? section.color : "transparent", flexShrink: 0, display: "inline-block" }} />
                {opt}
              </button>
            ))}
          </div>

          {/* Nav */}
          <button
            onClick={handleNext}
            disabled={selected === null}
            style={{
              background: selected !== null ? section.color : "#1A1A1A",
              color: selected !== null ? COLORS.black : "#444",
              border: "none",
              padding: "1rem",
              width: "100%",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              fontWeight: 700,
              cursor: selected !== null ? "pointer" : "not-allowed",
              borderRadius: 4,
              transition: "all 0.2s ease",
            }}
          >
            {currentSection === diagnosticSections.length - 1 && currentQ === section.questions.length - 1
              ? "Ver Resultados del Diagnóstico →"
              : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<DiagnosticoVisible />);
  