"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard, AdminIcon, SaveBar, useConfirm } from "@/components/admin/ui";
import {
  updateOrderStatus,
  updateOrderPayment,
  updateOrderAdminNotes,
} from "@/lib/actions/admin";
import {
  ORDER_FLOW,
  ORDER_STATUS,
  PAYMENT_STATUS,
  NEXT_STEP_LABEL,
  nextOrderStatus,
  orderStatusMeta,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/admin/labels";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrderStatusControlsProps {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  adminNotes: string | null;
}

/* Controles guiados del pedido. Tres bloques claros:
   1) Recorrido del pedido — línea de tiempo + UN botón con el próximo paso.
   2) Cobro — el pago en su propia sección, sin mezclar con el envío.
   3) Nota interna — guardado explícito, sin "guardado falso".
   Todo con patrón optimista + revert si la action falla, y confirmaciones
   de marca (useConfirm) en cualquier acción delicada. */
export function OrderStatusControls({
  id,
  status: initialStatus,
  paymentStatus: initialPaymentStatus,
  adminNotes: initialNotes,
}: OrderStatusControlsProps) {
  const confirm = useConfirm();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>(initialPaymentStatus);
  const [pending, startTransition] = useTransition();

  const next = nextOrderStatus(status);
  const nextLabel = NEXT_STEP_LABEL[status];
  const isCancelled = status === "cancelled";
  const isDone = status === "delivered";

  /* ── Avanzar el pedido al próximo paso ──────────────────────── */
  function advance() {
    if (!next) return;
    const prev = status;
    setStatus(next); // optimista
    startTransition(async () => {
      const r = await updateOrderStatus(id, next);
      if (!r.ok) {
        setStatus(prev); // revert
        toast.error(r.error);
      } else {
        toast.success(`Listo: ${ORDER_STATUS[next].label.toLowerCase()}.`);
      }
    });
  }

  /* ── Cancelar pedido (acción aparte, en rojo) ───────────────── */
  async function cancelOrder() {
    const ok = await confirm({
      title: "¿Cancelar este pedido?",
      description:
        "El pedido va a quedar marcado como cancelado. Avisale a la clienta si ya había pagado.",
      confirmLabel: "Sí, cancelar pedido",
      cancelLabel: "No, volver",
      tone: "danger",
      icon: "XCircle",
    });
    if (!ok) return;
    const prev = status;
    setStatus("cancelled");
    startTransition(async () => {
      const r = await updateOrderStatus(id, "cancelled");
      if (!r.ok) {
        setStatus(prev);
        toast.error(r.error);
      } else {
        toast.success("Pedido cancelado.");
      }
    });
  }

  /* ── Cambios de pago ────────────────────────────────────────── */
  async function setPayment(nextPay: PaymentStatus, askConfirm: boolean) {
    if (askConfirm) {
      const danger = nextPay === "refunded" || nextPay === "failed";
      const ok = await confirm({
        title: PAYMENT_CONFIRM[nextPay]?.title ?? "¿Confirmás el cambio?",
        description: PAYMENT_CONFIRM[nextPay]?.description,
        confirmLabel: PAYMENT_CONFIRM[nextPay]?.confirmLabel ?? "Confirmar",
        cancelLabel: "Volver",
        tone: danger ? "danger" : "default",
        icon: PAYMENT_STATUS[nextPay].icon,
      });
      if (!ok) return;
    }
    const prev = paymentStatus;
    setPaymentStatus(nextPay);
    startTransition(async () => {
      const r = await updateOrderPayment(id, nextPay);
      if (!r.ok) {
        setPaymentStatus(prev);
        toast.error(r.error);
      } else {
        toast.success(`Pago: ${PAYMENT_STATUS[nextPay].label.toLowerCase()}.`);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* ── 1) Recorrido del pedido ──────────────────────────────── */}
      <SectionCard
        title="Recorrido del pedido"
        description="Seguí cada paso. Cuando avances, la clienta lo verá reflejado."
        icon="Truck"
      >
        <OrderTimeline status={status} />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isCancelled ? (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-[#922C2C]">
              <AdminIcon name="XCircle" className="h-4 w-4" />
              Este pedido está cancelado.
            </p>
          ) : isDone ? (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-[#3F6B3F]">
              <AdminIcon name="PackageCheck" className="h-4 w-4" />
              ¡Pedido entregado y terminado!
            </p>
          ) : (
            <p className="text-sm text-mute">
              {orderStatusMeta(status).hint}
            </p>
          )}

          {next && nextLabel && !isCancelled && (
            <Button
              type="button"
              size="md"
              onClick={advance}
              disabled={pending}
              className="w-full sm:w-auto"
            >
              <AdminIcon name={ORDER_STATUS[next].icon} className="h-4 w-4" />
              {nextLabel}
            </Button>
          )}
        </div>

        {/* Cancelar: acción separada, en rojo, lejos del botón principal */}
        {!isCancelled && !isDone && (
          <div className="mt-4 border-t border-line pt-4">
            <button
              type="button"
              onClick={cancelOrder}
              disabled={pending}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-[#922C2C] transition-colors hover:bg-blush-50 disabled:opacity-40"
            >
              <AdminIcon name="XCircle" className="h-4 w-4" />
              Cancelar pedido
            </button>
          </div>
        )}
      </SectionCard>

      {/* ── 2) Cobro ─────────────────────────────────────────────── */}
      <PaymentSection
        paymentStatus={paymentStatus}
        pending={pending}
        onSet={setPayment}
      />

      {/* ── 3) Nota interna ──────────────────────────────────────── */}
      <NotesSection id={id} initialNotes={initialNotes ?? ""} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Línea de tiempo: muestra el recorrido normal (ORDER_FLOW) con el
   paso actual destacado. Si el pedido está cancelado, lo mostramos
   como un desvío claro, sin fingir que avanzó.
   ────────────────────────────────────────────────────────────── */
function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#F0C4C4] bg-[#FBE0E0] px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/60 text-[#922C2C]">
          <AdminIcon name="XCircle" className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium text-[#922C2C]">
          Pedido cancelado · no sigue el recorrido normal.
        </p>
      </div>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(status);

  return (
    <ol className="space-y-0">
      {ORDER_FLOW.map((step, i) => {
        const meta = ORDER_STATUS[step];
        const done = i < currentIndex;
        const current = i === currentIndex;
        const isLast = i === ORDER_FLOW.length - 1;

        return (
          <li key={step} className="flex gap-3">
            {/* Columna del ícono + línea conectora */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  done && "border-[#5a8a5a] bg-[#E2EFE0] text-[#3F6B3F]",
                  current && "border-navy bg-navy text-cream shadow-soft",
                  !done &&
                    !current &&
                    "border-line bg-cream-50 text-mute-soft",
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AdminIcon name={meta.icon} className="h-4 w-4" />
                )}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "my-1 w-0.5 flex-1",
                    done ? "bg-[#5a8a5a]" : "bg-line",
                  )}
                />
              )}
            </div>

            {/* Texto del paso */}
            <div className={cn("pb-5 pt-1", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  current ? "text-navy-900" : done ? "text-navy-700" : "text-mute",
                )}
              >
                {meta.label}
                {current && (
                  <span className="ml-2 rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-medium text-navy-800 align-middle">
                    Acá estás
                  </span>
                )}
              </p>
              {current && meta.hint && (
                <p className="mt-0.5 text-xs text-mute">{meta.hint}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ──────────────────────────────────────────────────────────────
   Sección de Cobro: el botón principal cambia según el estado actual.
   "Marcar como pagado" lleva confirmación; los estados delicados
   (rechazado / reembolsado) también.
   ────────────────────────────────────────────────────────────── */
const PAYMENT_CONFIRM: Partial<
  Record<
    PaymentStatus,
    { title: string; description?: string; confirmLabel?: string }
  >
> = {
  paid: {
    title: "¿Marcar el pago como recibido?",
    description:
      "Confirmá sólo si ya tenés la plata. Va a quedar registrado el momento del cobro.",
    confirmLabel: "Sí, ya cobré",
  },
  refunded: {
    title: "¿Marcar como reembolsado?",
    description:
      "Esto deja registrado que le devolviste el dinero a la clienta.",
    confirmLabel: "Sí, lo reembolsé",
  },
  failed: {
    title: "¿Marcar el pago como rechazado?",
    description: "Usalo si el pago no se concretó.",
    confirmLabel: "Sí, fue rechazado",
  },
  in_process: {
    title: "¿Marcar el pago en proceso?",
    description: "El pago todavía se está procesando.",
    confirmLabel: "Sí, en proceso",
  },
};

function PaymentSection({
  paymentStatus,
  pending,
  onSet,
}: {
  paymentStatus: PaymentStatus;
  pending: boolean;
  onSet: (next: PaymentStatus, askConfirm: boolean) => void;
}) {
  const meta = PAYMENT_STATUS[paymentStatus];
  const isPaid = paymentStatus === "paid";
  const isRefunded = paymentStatus === "refunded";

  return (
    <SectionCard
      title="Cobro"
      description="El estado de la plata, separado del recorrido del pedido."
      icon="Wallet"
    >
      {/* Estado actual del pago, bien visible */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full",
            isPaid
              ? "bg-[#E2EFE0] text-[#3F6B3F]"
              : isRefunded
                ? "bg-cream-100 text-navy-700"
                : "bg-[#FBEED1] text-[#876310]",
          )}
        >
          <AdminIcon name={meta.icon} className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-lg text-navy-900">{meta.label}</p>
          {meta.hint && <p className="text-xs text-mute">{meta.hint}</p>}
        </div>
      </div>

      {/* Acción principal: cobrar */}
      {!isPaid && !isRefunded && (
        <Button
          type="button"
          size="md"
          onClick={() => onSet("paid", true)}
          disabled={pending}
          className="mt-4 w-full sm:w-auto"
        >
          <AdminIcon name="CircleCheck" className="h-4 w-4" />
          Marcar como pagado
        </Button>
      )}

      {/* Opciones secundarias del pago */}
      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-2 text-xs text-mute">Otras opciones de cobro</p>
        <div className="flex flex-wrap gap-2">
          {paymentStatus !== "pending" && (
            <SecondaryPayButton
              icon="Clock"
              label="Volver a sin pagar"
              disabled={pending}
              onClick={() => onSet("pending", false)}
            />
          )}
          {paymentStatus !== "in_process" && (
            <SecondaryPayButton
              icon="Hourglass"
              label="Pago en proceso"
              disabled={pending}
              onClick={() => onSet("in_process", true)}
            />
          )}
          {paymentStatus !== "failed" && (
            <SecondaryPayButton
              icon="CircleX"
              label="Pago rechazado"
              danger
              disabled={pending}
              onClick={() => onSet("failed", true)}
            />
          )}
          {isPaid && (
            <SecondaryPayButton
              icon="RotateCcw"
              label="Reembolsar"
              danger
              disabled={pending}
              onClick={() => onSet("refunded", true)}
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function SecondaryPayButton({
  icon,
  label,
  danger,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors disabled:opacity-40",
        danger
          ? "border-[#F0C4C4] text-[#922C2C] hover:bg-blush-50"
          : "border-line text-navy-700 hover:bg-cream-50",
      )}
    >
      <AdminIcon name={icon} className="h-4 w-4" />
      {label}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────
   Nota interna: guardado EXPLÍCITO. Mientras haya cambios sin guardar
   aparece la SaveBar; el toast de éxito sólo sale si la action devuelve
   { ok: true }.
   ────────────────────────────────────────────────────────────── */
function NotesSection({
  id,
  initialNotes,
}: {
  id: string;
  initialNotes: string;
}) {
  const [saved, setSaved] = useState(initialNotes);
  const [draft, setDraft] = useState(initialNotes);
  const [pending, startTransition] = useTransition();

  const dirty = draft !== saved;

  function save() {
    startTransition(async () => {
      const r = await updateOrderAdminNotes(id, draft);
      if (!r.ok) {
        toast.error(r.error);
      } else {
        setSaved(draft);
        toast.success("Nota guardada.");
      }
    });
  }

  return (
    <SectionCard
      title="Nota interna"
      description="Sólo la ves vos. Anotá recordatorios, seguimiento o lo que necesites."
      icon="MessageCircle"
    >
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        placeholder="Ej.: La clienta pidió que avisemos antes de entregar."
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-xs",
            dirty ? "text-[#876310]" : "text-mute-soft",
          )}
        >
          {dirty ? "Tenés cambios sin guardar" : "Todo guardado"}
        </span>
        <Button
          type="button"
          size="sm"
          variant={dirty ? "primary" : "ghost"}
          onClick={save}
          disabled={pending || !dirty}
        >
          {pending ? "Guardando…" : "Guardar nota"}
        </Button>
      </div>

      {/* Barra flotante para que no se pierda una nota a medio escribir */}
      <SaveBar
        visible={dirty}
        saving={pending}
        onSave={save}
        onDiscard={() => setDraft(saved)}
        message="Tenés una nota sin guardar"
        saveLabel="Guardar nota"
      />
    </SectionCard>
  );
}
