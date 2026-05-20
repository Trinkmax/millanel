"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { SITE } from "@/lib/constants";

const TOPICS = [
  "Consulta sobre un producto",
  "Pedido mayorista",
  "Devolución / cambio",
  "Otro",
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");

  function buildUrl() {
    const text = [
      `Hola Cintia, soy ${name || "[tu nombre]"}.`,
      `Motivo: ${topic}.`,
      "",
      message || "[mensaje]",
      "",
      `Tel: ${phone}`,
    ].join("\n");
    return `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.open(buildUrl(), "_blank", "noopener");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nombre" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Tu nombre"
          />
        </FormField>
        <FormField label="Teléfono / WhatsApp">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="3854 12-3456"
          />
        </FormField>
      </div>
      <FormField label="¿Cómo te ayudamos?">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex h-11 w-full rounded-[8px] border border-line bg-pearl px-3.5 py-2 text-[15px] text-foreground focus-visible:outline-none focus-visible:border-navy-400 focus-visible:ring-2 focus-visible:ring-navy-100"
        >
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Tu mensaje" required>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="Contános en qué podemos ayudarte..."
        />
      </FormField>
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <Button type="button" variant="ghost" asChild className="flex-1">
          <a href={`mailto:${SITE.contact.email}`}>
            <Send className="h-4 w-4" />
            O escribinos por email
          </a>
        </Button>
        <Button type="submit" variant="whatsapp" className="flex-1" size="lg">
          <WhatsAppIcon size={16} />
          Enviar por WhatsApp
        </Button>
      </div>
      <p className="text-xs text-mute italic text-center">
        Al enviar abrimos WhatsApp con tu mensaje listo para revisar y enviar.
      </p>
    </form>
  );
}
