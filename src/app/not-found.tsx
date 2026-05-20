import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MillanelMark } from "@/components/brand/millanel-mark";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream-50 flex items-center justify-center p-6 paper-grain">
      <div className="max-w-md text-center space-y-6">
        <MillanelMark size={56} className="text-navy-300 mx-auto" />
        <p className="num-eyebrow text-mute text-2xl">404</p>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight text-navy-900">
          Esta página{" "}
          <em className="italic font-normal text-navy-700">se perfumó</em>{" "}
          y voló.
        </h1>
        <p className="text-mute">
          No encontramos lo que buscabas. Volvé al inicio o seguí navegando.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/productos">
              Ver catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
