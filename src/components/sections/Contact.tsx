import { Mail, MessageCircle, Phone } from "lucide-react";
import type { SectionOf } from "@/lib/tenant/schema";
import type { SectionProps } from "./shared";

export function Contact({ section }: SectionProps<SectionOf<"contact">>) {
  const { title, text, phone, whatsapp, email } = section.data;
  const channels = [
    whatsapp && { icon: MessageCircle, label: "WhatsApp", value: "Iniciar conversa", href: `https://wa.me/${whatsapp}` },
    phone && { icon: Phone, label: "Telefone", value: phone, href: `tel:${phone.replace(/\D/g, "")}` },
    email && { icon: Mail, label: "E-mail", value: email, href: `mailto:${email}` },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string }[];

  return (
    <section id={section.id} className="scroll-mt-24 bg-primary px-4 py-16 text-on-primary sm:px-6 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-heading text-3xl font-semibold md:text-5xl">{title}</h2>
          {text && <p className="mt-4 text-lg opacity-85">{text}</p>}
        </div>
        <ul className="grid gap-3">
          {channels.map(({ icon: Icon, label, value, href }) => (
            <li key={label}>
              <a
                href={href}
                className="flex items-center gap-4 rounded-brand border border-on-primary/20 p-5 transition hover:bg-on-primary/10"
              >
                <Icon className="size-6 text-accent" />
                <span>
                  <span className="block text-sm opacity-75">{label}</span>
                  <span className="font-semibold break-all">{value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
