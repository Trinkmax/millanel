"use client";

import { OptionTile } from "./option-tile";
import { InspiredSearch } from "./inspired-search";
import { cn } from "@/lib/utils";
import type { QuestionDef, QuestionId } from "@/lib/asesoria/questions";
import type { InspiredOption, InspiredRef, QuizAnswers } from "@/lib/asesoria/types";

function currentValue(id: QuestionId, a: QuizAnswers): string | null {
  switch (id) {
    case "gender":
      return a.gender;
    case "likes":
      return a.likes;
    case "occasion":
      return a.occasion;
    case "personality":
      return a.personality;
    default:
      return null;
  }
}

export function QuizStep({
  question,
  answers,
  inspiredOptions,
  onChoice,
  onInspired,
}: {
  question: QuestionDef;
  answers: QuizAnswers;
  inspiredOptions: InspiredOption[];
  onChoice: (id: QuestionId, value: string) => void;
  onInspired: (ref: InspiredRef | null) => void;
}) {
  // Map step to thematic image path
  const imageSrc = `/images/asesoria/step-${question.id}.png`;

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-14 items-center">
      {/* Left Column: Thematic Step Image */}
      <div className="md:col-span-5 relative aspect-[4/3] md:aspect-[3/4] w-full overflow-hidden rounded-[24px] shadow-medium border border-line">
        <img
          src={imageSrc}
          alt={question.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/20 to-transparent pointer-events-none" />
      </div>

      {/* Right Column: Question Content */}
      <div className="md:col-span-7 space-y-6 text-left">
        <header>
          <p className="eyebrow text-navy-700">{question.eyebrow}</p>
          <h2
            id="quiz-step-title"
            tabIndex={-1}
            className="mt-3 font-display text-3xl md:text-4xl leading-[1.08] tracking-tight text-navy-900 focus:outline-none"
          >
            {question.title}{" "}
            {question.titleEm && (
              <em className="italic font-normal text-navy-700">{question.titleEm}</em>
            )}
          </h2>
          {question.subtitle && (
            <p className="mt-3 max-w-md text-sm md:text-base text-mute leading-relaxed">
              {question.subtitle}
            </p>
          )}
        </header>

        <div>
          {question.kind === "inspired" ? (
            <InspiredSearch
              options={inspiredOptions}
              value={answers.inspiredBy}
              onSelect={(ref) => onInspired(ref)}
              onSkip={() => onInspired(null)}
            />
          ) : (
            <div
              role="radiogroup"
              aria-labelledby="quiz-step-title"
              className={cn(
                "grid gap-3 md:gap-4",
                question.columns === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-2 sm:grid-cols-3",
              )}
            >
              {question.options!.map((opt, i) => (
                <OptionTile
                  key={opt.value}
                  option={opt}
                  selected={currentValue(question.id, answers) === opt.value}
                  index={i}
                  onSelect={() => onChoice(question.id, opt.value)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
