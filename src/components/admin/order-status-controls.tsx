"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  updateOrderStatus,
  updateOrderPayment,
  updateOrderAdminNotes,
} from "@/lib/actions/admin";
import type { Enums } from "@/lib/supabase/types";
import { toast } from "sonner";

type OrderStatus = Enums<"order_status">;
type PaymentStatus = Enums<"payment_status">;

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "in_process",
  "paid",
  "failed",
  "refunded",
];

interface OrderStatusControlsProps {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  adminNotes: string | null;
}

export function OrderStatusControls({
  id,
  status: initialStatus,
  paymentStatus: initialPaymentStatus,
  adminNotes: initialNotes,
}: OrderStatusControlsProps) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>(initialPaymentStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, startTransition] = useTransition();

  async function saveStatus(next: OrderStatus) {
    setStatus(next);
    startTransition(async () => {
      const r = await updateOrderStatus(id, next);
      if (!r.ok) {
        toast.error(r.error);
        setStatus(initialStatus);
      } else {
        toast.success("Estado actualizado");
      }
    });
  }

  async function savePayment(next: PaymentStatus) {
    setPaymentStatus(next);
    startTransition(async () => {
      const r = await updateOrderPayment(id, next);
      if (!r.ok) {
        toast.error(r.error);
        setPaymentStatus(initialPaymentStatus);
      } else {
        toast.success("Pago actualizado");
      }
    });
  }

  function saveNotes() {
    startTransition(async () => {
      await updateOrderAdminNotes(id, notes);
      toast.success("Notas guardadas");
    });
  }

  return (
    <Card>
      <CardContent className="p-6 !pt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="eyebrow">Estado del pedido</label>
          <Select value={status} onValueChange={(v) => saveStatus(v as OrderStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="eyebrow">Estado del pago</label>
          <Select value={paymentStatus} onValueChange={(v) => savePayment(v as PaymentStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-3">
          <label className="eyebrow">Notas internas (solo admin)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Comentario interno, datos de seguimiento, etc."
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={saveNotes}
              disabled={pending}
            >
              <Save className="h-3.5 w-3.5" />
              Guardar nota
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
