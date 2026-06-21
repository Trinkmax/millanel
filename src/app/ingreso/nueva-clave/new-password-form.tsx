"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/lib/actions/auth";

export function NewPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las dos contraseñas no coinciden. Revisalas.");
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(password);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      setDone(true);
      toast.success("¡Listo! Tu nueva contraseña quedó guardada.");
      // Pequeña pausa para que se vea el estado de éxito antes de entrar.
      router.replace("/admin");
    });
  }

  const busy = pending || done;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm normal-case tracking-normal"
        >
          Nueva contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
          <Input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            autoFocus
            required
            disabled={busy}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Al menos 6 caracteres"
            className="pl-10 pr-12 h-12"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            disabled={busy}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={show}
            className="absolute right-1 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-lg text-mute hover:text-navy hover:bg-navy/5 transition-colors disabled:opacity-50"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirm"
          className="text-sm normal-case tracking-normal"
        >
          Repetí la contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
          <Input
            id="confirm"
            name="confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            disabled={busy}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Escribila de nuevo"
            className="pl-10 h-12"
          />
        </div>
      </div>

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
      </AnimatePresence>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={busy}
        aria-busy={pending}
      >
        {done ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Entrando al panel…
          </>
        ) : pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando…
          </>
        ) : (
          <>
            Guardar y entrar
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
