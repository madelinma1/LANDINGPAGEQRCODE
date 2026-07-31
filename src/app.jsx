
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
    subtitle: "Identifica dónde se está drenando tu energía",
    color: COLORS.gold,
    questions: [
      {
        id: "o1",
        over: "OVERWORKED",
        text: "¿Con qué frecuencia trabajas más de lo necesario por miedo a que el resultado no sea perfecto?",
        options: ["Casi siempre — es mi patrón dominante", "Con frecuencia — especialmente en proyectos visibles", "A veces — en momentos de presión", "Rara vez — tengo esto bajo control"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "o2",
        over: "OVERCOMMITTED",
        text: "¿Dices sí a responsabilidades que no están en tu descripción de puesto (office housework)?",
        options: ["Sí, constantemente y lo resiento", "Sí, lo hago pero empiezo a cuestionarlo", "A veces, en situaciones específicas", "No, tengo límites claros en esto"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "o3",
        over: "OVERWHELMED",
        text: "¿Cómo describes tu estado energético al final de una semana típica?",
        options: ["Agotada — siento que no alcanzo nada importante", "Ocupada — mucho movimiento, poco impacto estratégico", "Funcional — entrego pero sin energía para más", "Enfocada — gestiono bien mis prioridades"],
        scores: [4, 3, 2, 1],
      },
    ],
  },
  {
    id: "P",
    label: "PILAR P",
    title: "Propósito — Llamado Visible",
    subtitle: "¿Tienes claridad sobre quién eres y para qué quieres el nivel siguiente?",
    color: "#2D6A4F",
    questions: [
      {
        id: "p1",
        text: "¿Puedes articular en 1–2 oraciones por qué específicamente quieres llegar a VP (más allá del título)?",
        options: ["No — no lo he pensado con claridad", "Vagamente — hablo de 'querer más impacto' sin especificar", "En desarrollo — tengo una idea pero no está pulida", "Sí — lo expreso con claridad y convicción"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "p2",
        text: "¿Qué tan visible eres ante los líderes senior de tu organización?",
        options: ["Invisible — nadie me conoce más allá de mi área", "Conocida como ejecutora confiable, no como estratega", "Tengo algo de visibilidad pero no consistente", "Soy conocida y reconocida como estratega en múltiples niveles"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "p3",
        text: "¿Has aprendido a minimizar aspectos de tu identidad (calidez, acento, perspectiva cultural) para 'encajar'?",
        options: ["Sí — activamente me reduzco para generar menos fricción", "Con frecuencia — especialmente en espacios de poder", "A veces — en situaciones de alta visibilidad", "No — lidero desde mi identidad completa"],
        scores: [4, 3, 2, 1],
      },
    ],
  },
  {
    id: "E",
    label: "PILAR E",
    title: "Energía — Inteligencia Energética",
    subtitle: "¿Gestionas tu energía como activo estratégico o la estás agotando?",
    color: "#9B2335",
    questions: [
      {
        id: "e1",
        text: "¿Tienes bloques de tiempo protegidos en tu semana para trabajo estratégico (sin reuniones ni correos)?",
        options: ["No — mi agenda está completamente controlada por otros", "Rara vez — lo intento pero siempre cedo", "Tengo algo pero es inconsistente", "Sí — protejo tiempo estratégico semanalmente"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "e2",
        text: "¿Cómo delegas responsabilidades a tu equipo?",
        options: ["No delego — necesito revisar y controlar todo", "Delego poco — confío con dificultad", "Delego algunas cosas pero retengo demasiado", "Delego bien — libero mi energía para lo estratégico"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "e3",
        text: "¿Distingues entre estar ocupada y tener rendimiento sostenible?",
        options: ["No — confundo actividad con impacto constantemente", "Lo entiendo intelectualmente pero no lo practico", "Lo practico a veces, no de forma sistemática", "Sí — gestiono mi agenda desde el impacto estratégico"],
        scores: [4, 3, 2, 1],
      },
    ],
  },
  {
    id: "A",
    label: "PILAR A",
    title: "Autenticidad — Alineación e Identidad",
    subtitle: "¿Lideras desde quien eres o desde quien esperan que seas?",
    color: "#4A3728",
    questions: [
      {
        id: "a1",
        text: "¿Qué tan coherentes son tus valores declarados con tus acciones bajo presión?",
        options: ["Hay una brecha significativa — actúo diferente bajo presión", "A veces coherente, a veces no — soy inconsistente", "Mayormente coherente con algunos puntos ciegos", "Alta coherencia — mis valores guían mis decisiones bajo presión"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "a2",
        text: "¿Tienes dificultad para expresar tu perspectiva en reuniones con liderazgo senior?",
        options: ["Sí — me minimizo, suavizo ideas o espero que otros hablen", "Con frecuencia — especialmente si percibo resistencia", "A veces — en contextos de alta visibilidad o conflicto", "No — expreso mi perspectiva con claridad y convicción"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "a3",
        text: "¿Cómo manejas el 'office housework' (trabajo no reconocido asignado desproporcionadamente)?",
        options: ["Lo absorbo todo sin cuestionar — tengo límites muy porosos", "Lo reconozco como problema pero no sé cómo cambiarlo", "He mejorado pero aún me cuesta decir no con claridad", "Tengo límites claros y los mantengo con gracia"],
        scores: [4, 3, 2, 1],
      },
    ],
  },
  {
    id: "K",
    label: "PILAR K",
    title: "Key Results — Impacto Visible",
    subtitle: "¿Tus resultados son conocidos por quienes deciden tu futuro?",
    color: "#1B4F8A",
    questions: [
      {
        id: "k1",
        text: "¿Puedes articular tus 3 resultados de mayor impacto de los últimos 24 meses con datos y contexto organizacional?",
        options: ["No — tengo logros pero no los he documentado estratégicamente", "Puedo listar actividades pero no impacto medible", "Tengo algunos resultados articulados pero incompletos", "Sí — tengo una narrativa de impacto clara y con métricas"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "k2",
        text: "¿Has tenido una conversación directa con tu líder sobre tu ambición de llegar a VP?",
        options: ["No — no he nombrado mi ambición explícitamente", "Lo he insinuado pero nunca dicho directamente", "Lo he mencionado una vez, sin profundizar", "Sí — tengo conversaciones activas sobre mi plan de ascenso"],
        scores: [4, 3, 2, 1],
      },
      {
        id: "k3",
        text: "¿Tienes un sponsor activo (no solo mentor) que mueva tu nombre en conversaciones donde tú no estás?",
        options: ["No — avanzo completamente en solitario", "Tengo mentores pero ningún sponsor activo", "Tengo relaciones potenciales pero no las he activado", "Sí — tengo al menos un sponsor activo en mi organización"],
        scores: [4, 3, 2, 1],
      },
    ],
  },
];

const getOversProfile = (score) => {
  if (score >= 10) return { label: "Alerta crítica", color: "#C0392B", desc: "Los 3 Overs están activos simultáneamente. Primera prioridad: estabilizar tu energía antes de cualquier trabajo estratégico." };
  if (score >= 7) return { label: "Zona de riesgo", color: "#E67E22", desc: "Uno o dos Overs dominantes. Hay espacio para trabajar posicionamiento, pero tu energía necesita atención paralela." };
  return { label: "Funcional", color: "#27AE60", desc: "Los Overs no son tu barrera principal. El trabajo puede centrarse directamente en posicionamiento y visibilidad." };
};

const getPeakProfile = (scores) => {
  const labels = { P: "Propósito", E: "Energía", A: "Autenticidad", K: "Key Results" };
  const weakest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return { weakest: labels[weakest[0]], score: weakest[1] };
};

const getReadinessLevel = (total) => {
  if (total >= 42) return { level: "Lista para VP", color: "#27AE60", pct: 90, desc: "Posicionamiento sólido. El trabajo es refinar narrativa y activar sponsors." };
  if (total >= 30) return { level: "En construcción estratégica", color: COLORS.gold, pct: 60, desc: "Base importante. Necesitas estructura, visibilidad y 1–2 shifts críticos." };
  if (total >= 18) return { level: "Zona de reenfoque", color: "#E67E22", pct: 35, desc: "Tus resultados son más sólidos de lo que tu posicionamiento refleja. El gap está en visibilidad y narrativa." };
  return { level: "Inicio del recorrido", color: "#C0392B", pct: 15, desc: "Trabajo profundo de identidad y energía antes de posicionamiento. Gran potencial, camino claro." };
};

function DiagnosticoVisible() {
  const [phase, setPhase] = useState("intro"); // intro | diagnostic | results
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [clientName, setClientName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [selected, setSelected] = useState(null);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const emailOk = isValidEmail(email);
  const nameOk = clientName.trim().length > 0;
  const canStart = nameOk && emailOk;

  // Google Sheet endpoint (Apps Script Web App). Fire-and-forget logging.
  const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbxHvDaqUPspRZxX5gM603WfJLGneVxEFRl-9n249lH9RM06aqmf4JrjQ4MkQdnuIVyC6Q/exec";
  const logToSheet = (payload) => {
    if (!SHEET_ENDPOINT) return;
    try {
      fetch(SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (e) { /* never block the UI on logging */ }
  };

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
      const { overScore, peakScores, totalPeak } = calcResults(newAnswers);
      logToSheet({
        evento: "Completó",
        nombre: clientName,
        email: email,
        overs: overScore,
        p: peakScores.P, e: peakScores.E, a: peakScores.A, k: peakScores.K,
        totalPeak: totalPeak,
        nivel: getReadinessLevel(totalPeak).level,
      });
      setPhase("results");
    }
  };

  const calcResults = (src = answers) => {
    const overScore = ["o1","o2","o3"].reduce((a,id) => a + (src[id]?.score || 0), 0);
    const peakScores = { P: 0, E: 0, A: 0, K: 0 };
    ["p1","p2","p3"].forEach(id => peakScores.P += src[id]?.score || 0);
    ["e1","e2","e3"].forEach(id => peakScores.E += src[id]?.score || 0);
    ["a1","a2","a3"].forEach(id => peakScores.A += src[id]?.score || 0);
    ["k1","k2","k3"].forEach(id => peakScores.K += src[id]?.score || 0);
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
    setNameTouched(false);
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
            Este protocolo evalúa los 3 Overs y los 4 pilares del Marco PEAK para identificar exactamente dónde está el gap entre tu nivel actual y el nivel VP.
          </p>
          <div style={{ background: "#1A1A1A", border: `1px solid ${nameTouched && !nameOk ? "#C0392B" : "#333"}`, borderRadius: 12, padding: "1.5rem", marginBottom: "1rem", textAlign: "left" }}>
            <p style={{ color: "#888", fontSize: "0.75rem", letterSpacing: "0.1em", fontFamily: "monospace", marginBottom: "0.75rem" }}>
              TU NOMBRE <span style={{ color: COLORS.gold }}>(OBLIGATORIO)</span>
            </p>
            <input
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              placeholder="Ej: Ana García"
              aria-label="Tu nombre (obligatorio)"
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${nameTouched && !nameOk ? "#C0392B" : COLORS.gold}`, color: COLORS.white, fontSize: "1.1rem", padding: "0.5rem 0", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }}
            />
            {nameTouched && !nameOk && (
              <p style={{ color: "#C0392B", fontSize: "0.75rem", fontFamily: "monospace", margin: "0.6rem 0 0" }}>
                Ingresa tu nombre para continuar.
              </p>
            )}
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
            onClick={() => {
              if (canStart) {
                logToSheet({ evento: "Inició", nombre: clientName, email: email });
                setPhase("diagnostic");
              } else {
                setNameTouched(true);
                setEmailTouched(true);
              }
            }}
            disabled={!canStart}
            style={{ background: canStart ? COLORS.gold : "#2A2A2A", color: canStart ? COLORS.black : "#666", border: "none", padding: "1rem 3rem", fontSize: "0.9rem", fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 700, cursor: canStart ? "pointer" : "not-allowed", borderRadius: 4, width: "100%", textTransform: "uppercase", transition: "all 0.2s ease" }}
          >
            Iniciar Diagnóstico →
          </button>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.black, fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", color: COLORS.white }}>
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: COLORS.gold, color: COLORS.black, fontSize: 11, fontFamily: "monospace", letterSpacing: "0.15em", padding: "6px 16px", marginBottom: "2rem", fontWeight: 700 }}>
            PROTOCOLO COMPLETADO
          </div>
          <div style={{ width: 72, height: 72, borderRadius: "50%", border: `2px solid ${COLORS.gold}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem", color: COLORS.gold, fontSize: "2rem" }}>
            ✓
          </div>
          <h1 style={{ color: COLORS.white, fontSize: "clamp(1.8rem, 6vw, 2.75rem)", fontWeight: 400, lineHeight: 1.1, margin: "0 0 1rem", letterSpacing: "-0.02em" }}>
            Diagnóstico completado
          </h1>
          <p style={{ color: "#AAA", fontSize: "1.05rem", lineHeight: 1.7, fontStyle: "italic", marginBottom: "2.5rem" }}>
            {clientName ? `Gracias, ${clientName}. ` : "Gracias. "}
            Tus respuestas han sido registradas. Madelin Santana revisará tu
            diagnóstico y se pondrá en contacto contigo.
          </p>
          <button
            onClick={restartDiagnostic}
            style={{ background: "transparent", border: `1px solid ${COLORS.gold}`, color: COLORS.gold, padding: "0.85rem 2rem", fontFamily: "monospace", fontSize: "0.8rem", letterSpacing: "0.08em", cursor: "pointer", borderRadius: 4 }}
          >
            Iniciar nuevo diagnóstico
          </button>
          <p style={{ textAlign: "center", color: "#444", fontFamily: "monospace", fontSize: "0.7rem", marginTop: "2.5rem", letterSpacing: "0.08em" }}>
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
