"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn, requestPasswordReset } from "@/lib/actions/auth";

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";

  // Email se mantiene en estado para reutilizarlo al pedir el reset.
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [resetting, startReset] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    const formData = new FormData(e.currentTarget);
    formData.set("next", next);
    startTransition(async () => {
      const result = await signIn(formData);
      // signIn redirige en éxito; sólo vuelve algo si falló.
      if (result && !result.ok) {
        setError(result.error);
      }
    });
  }

  // "¿Olvidaste tu contraseña?": le mandamos el enlace al email cargado.
  function onForgotPassword() {
    setError(null);
    setResetMessage(null);
    if (!email || !email.includes("@")) {
      setError("Escribí tu email arriba y volvé a tocar el enlace.");
      return;
    }
    startReset(async () => {
      const result = await requestPasswordReset(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setResetMessage(
        "Te enviamos un correo con un enlace para crear una nueva contraseña. Revisá tu bandeja de entrada (y el correo no deseado).",
      );
    });
  }

  const busy = pending || resetting;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm normal-case tracking-normal">
          Tu email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            disabled={busy}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cintia@email.com"
            className="pl-10 h-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label
            htmlFor="password"
            className="text-sm normal-case tracking-normal"
          >
            Tu contraseña
          </Label>
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={busy}
            className="text-sm text-navy-700 hover:text-navy underline underline-offset-4 decoration-line hover:decoration-navy transition-colors disabled:opacity-50"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={busy}
            placeholder="••••••••"
            className="pl-10 pr-12 h-12"
          />
          {/* Ojo para mostrar/ocultar la contraseña (≥44px) */}
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={busy}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            aria-pressed={showPassword}
            className="absolute right-1 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-lg text-mute hover:text-navy hover:bg-navy/5 transition-colors disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Aviso de error (en español, viene de signIn/requestPasswordReset) */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}
        {resetMessage && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2 rounded-xl border border-sky-300/50 bg-sky/40 px-3.5 py-3 text-sm text-navy-900"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-navy-700" />
            <p>{resetMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={busy}
        aria-busy={pending}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Entrando…
          </>
        ) : (
          <>
            Entrar al panel
            <ArrowRight className={cn("h-4 w-4")} />
          </>
        )}
      </Button>
    </form>
  );
}
