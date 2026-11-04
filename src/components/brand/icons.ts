import {
  Baby, BadgeCheck, Building2, CalendarDays, FileCheck, FileText, Gavel, Heart, House,
  KeyRound, Landmark, PenLine, Scale, ScrollText, ShieldCheck, Signature, Stamp, Users,
  type LucideIcon,
} from "lucide-react";
import type { ICON_KEYS } from "@/lib/tenant/schema";

/** O JSON referencia ícones por chave estável; aqui mapeamos para componentes. */
export const ICONS: Record<(typeof ICON_KEYS)[number], LucideIcon> = {
  "file-text": FileText,
  scroll: ScrollText,
  stamp: Stamp,
  pen: PenLine,
  house: House,
  baby: Baby,
  heart: Heart,
  gavel: Gavel,
  landmark: Landmark,
  signature: Signature,
  key: KeyRound,
  scale: Scale,
  users: Users,
  badge: BadgeCheck,
  shield: ShieldCheck,
  building: Building2,
  "file-check": FileCheck,
  calendar: CalendarDays,
};
