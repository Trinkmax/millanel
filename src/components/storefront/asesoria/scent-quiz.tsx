"use client";

import { useReducer, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import {
  QUESTIONS,
  TOTAL_STEPS,
  OCCASION_INTENSITY,
  type QuestionId,
} from "@/lib/asesoria/questions";
import { scoreCandidates, currentSeason } from "@/lib/asesoria/score";
import { EMPTY_ANSWERS } from "@/lib/asesoria/types";
import type {
  QuizAnswers,
  QuizCandidate,
  InspiredOption,
  InspiredRef,
  Gender,
  ScentFamily,
  OccasionAnswer,
  Personality,
} from "@/lib/asesoria/types";
import { QuizIntro } from "./quiz-intro";
import { QuizStep } from "./quiz-step";
import { ResultReveal } from "./result-reveal";
import { EASE_OUT_SOFT } from "@/lib/motion";

type Phase = "intro" | "question" | "reveal";

interface State {
  phase: Phase;
  index: number;
  dir: 1 | -1;
  answers: QuizAnswers;
}

const INITIAL: State = { phase: "intro", index: 0, dir: 1, answers: EMPTY_ANSWERS };

type Action =
  | { type: "start" }
  | { type: "setGift"; value: boolean }
  | { type: "answer"; id: QuestionId; value: string }
  | { type: "setInspired"; ref: InspiredRef | null }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" }
  | { type: "hydrate"; answers: QuizAnswers };

function applyAnswer(a: QuizAnswers, id: QuestionId, value: string): QuizAnswers {
  switch (id) {
    case "gender":
      return { ...a, gender: value as Gender };
    case "likes":
      return { ...a, likes: value as ScentFamily };
    case "occasion":
      return {
        ...a,
        occasion: value as OccasionAnswer,
        intensity: OCCASION_INTENSITY[value as OccasionAnswer],
      };
    case "personality":
      return { ...a, personality: value as Personality };
    default:
      return a;
  }
}

function reducer(s: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { ...s, phase: "question", index: 0, dir: 1 };
    case "setGift":
      return { ...s, answers: { ...s.answers, isGift: action.value } };
    case "answer":
      return { ...s, answers: applyAnswer(s.answers, action.id, action.value) };
    case "setInspired":
      return { ...s, answers: { ...s.answers, inspiredBy: action.ref } };
    case "next":
      if (s.index < TOTAL_STEPS - 1) return { ...s, index: s.index + 1, dir: 1 };
      return { ...s, phase: "reveal" };
    case "back":
      if (s.phase === "reveal") return { ...s, phase: "question", index: TOTAL_STEPS - 1, dir: -1 };
      if (s.index > 0) return { ...s, index: s.index - 1, dir: -1 };
      return { ...s, phase: "intro" };
    case "restart":
      return { ...INITIAL, answers: EMPTY_ANSWERS };
    case "hydrate":
      return { phase: "reveal", index: TOTAL_STEPS - 1, dir: 1, answers: action.answers };
    default:
      return s;
  }
}

function isAnswered(id: QuestionId, a: QuizAnswers): boolean {
  switch (id) {
    case "gender":
      return !!a.gender;
    case "likes":
      return !!a.likes;
    case "occasion":
      return !!a.occasion;
    case "personality":
      return !!a.personality;
    case "inspired":
      return true; // optional
  }
}

export function ScentQuiz({
  candidates,
  inspiredOptions,
}: {
  candidates: QuizCandidate[];
  inspiredOptions: InspiredOption[];
}) {
  const reduce = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const season = useMemo(() => currentSeason(), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  // Hydrate a shared result from the URL hash.
  useEffect(() => {
    try {
      const h = window.location.hash;
      if (h.startsWith("#r=")) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(h.slice(3)))));
        if (decoded && typeof decoded === "object") {
          dispatch({ type: "hydrate", answers: { ...EMPTY_ANSWERS, ...decoded } });
        }
      }
    } catch {
      /* ignore malformed hash */
    }
  }, []);

  const result = useMemo(
    () =>
      state.phase === "reveal"
        ? scoreCandidates(candidates, state.answers, { season, limit: 4 })
        : null,
    [state.phase, state.answers, candidates, season],
  );

  // Persist a shareable result in the hash (back-button friendly).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (state.phase === "reveal") {
      try {
        const payload = btoa(unescape(encodeURIComponent(JSON.stringify(state.answers))));
        window.history.replaceState(null, "", `#r=${payload}`);
      } catch {
        /* noop */
      }
    } else if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [state.phase, state.answers]);

  const onChoice = useCallback(
    (id: QuestionId, value: string) => {
      dispatch({ type: "answer", id, value });
      clearTimer();
      timer.current = setTimeout(() => dispatch({ type: "next" }), reduce ? 0 : 300);
    },
    [reduce],
  );

  const onInspired = useCallback(
    (ref: InspiredRef | null) => {
      dispatch({ type: "setInspired", ref });
      clearTimer();
      timer.current = setTimeout(() => dispatch({ type: "next" }), reduce ? 0 : 220);
    },
    [reduce],
  );

  // Keyboard: ← back, number keys pick an option.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (state.phase !== "question") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const q = QUESTIONS[state.index];
      if (e.key === "ArrowLeft") {
        dispatch({ type: "back" });
      } else if (q.kind === "choice" && /^[1-9]$/.test(e.key)) {
        const opt = q.options?.[Number(e.key) - 1];
        if (opt) onChoice(q.id, opt.value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, state.index, onChoice]);

  useEffect(() => () => clearTimer(), []);

  // Move focus to the step heading when it changes (a11y).
  useEffect(() => {
    if (state.phase === "question") {
      requestAnimationFrame(() => {
        document.getElementById("quiz-step-title")?.focus();
      });
    }
  }, [state.phase, state.index]);

  const stepNum = state.index + 1;
  const progress =
    state.phase === "reveal" ? 1 : state.phase === "question" ? stepNum / TOTAL_STEPS : 0;

  const variants = {
    enter: (dir: number) =>
      reduce ? { opacity: 0 } : { opacity: 0, x: dir * 44, filter: "blur(4px)" },
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (dir: number) =>
      reduce ? { opacity: 0 } : { opacity: 0, x: dir * -44, filter: "blur(4px)" },
  };

  const activeKey =
    state.phase === "question" ? `q-${state.index}` : state.phase;

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Progress + back (hidden on intro) */}
      <AnimatePresence>
        {state.phase !== "intro" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mb-8 flex max-w-xl items-center gap-4 md:mb-10"
          >
            <button
              type="button"
              onClick={() => dispatch({ type: "back" })}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-pearl text-navy transition-colors hover:border-navy-300 hover:bg-cream-100"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="num-eyebrow text-[11px] text-navy-700">
                  {state.phase === "reveal"
                    ? "Resultado"
                    : `Paso ${String(stepNum).padStart(2, "0")} · de ${String(TOTAL_STEPS).padStart(2, "0")}`}
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-line">
                <motion.div
                  className="h-full rounded-full bg-navy"
                  animate={{ scaleX: progress }}
                  initial={false}
                  style={{ transformOrigin: "left" }}
                  transition={{ duration: reduce ? 0 : 0.5, ease: EASE_OUT_SOFT }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated phase content */}
      <motion.div
        drag={state.phase === "question" && !reduce ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (state.phase !== "question") return;
          const q = QUESTIONS[state.index];
          if (info.offset.x > 90 || info.velocity.x > 500) {
            dispatch({ type: "back" });
          } else if (
            (info.offset.x < -90 || info.velocity.x < -500) &&
            isAnswered(q.id, state.answers)
          ) {
            dispatch({ type: "next" });
          }
        }}
      >
        <AnimatePresence mode="wait" custom={state.dir} initial={false}>
          <motion.div
            key={activeKey}
            custom={state.dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.15 : 0.32, ease: EASE_OUT_SOFT }}
          >
            {state.phase === "intro" && (
              <QuizIntro
                isGift={state.answers.isGift}
                onToggleGift={(v) => dispatch({ type: "setGift", value: v })}
                onStart={() => dispatch({ type: "start" })}
                candidateCount={candidates.length}
              />
            )}

            {state.phase === "question" && (
              <QuizStep
                question={QUESTIONS[state.index]}
                answers={state.answers}
                inspiredOptions={inspiredOptions}
                onChoice={onChoice}
                onInspired={onInspired}
              />
            )}

            {state.phase === "reveal" && result && (
              <ResultReveal
                result={result}
                answers={state.answers}
                onRestart={() => dispatch({ type: "restart" })}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
