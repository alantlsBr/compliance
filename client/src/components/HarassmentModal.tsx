import React from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";

interface HarassmentCardData {
  title: string;
  icon: string;
  color: string;
  desc: string;
  examples: string[];
}

interface HarassmentModalProps {
  card: HarassmentCardData | null;
  onClose: () => void;
}

// Mapeamento de strings de ícones para componentes Lucide
const iconMap: Record<string, React.ComponentType<any>> = {
  lP: LucideIcons.AlertTriangle,
  uP: LucideIcons.Flame,
  Xw: LucideIcons.Users,
  "$k": LucideIcons.Briefcase,
  Vk: LucideIcons.TrendingUp,
  Lk: LucideIcons.UserCheck,
  vP: LucideIcons.Laptop,
  _P: LucideIcons.ShieldAlert,
};

export default function HarassmentModal({ card, onClose }: HarassmentModalProps) {
  if (!card) return null;

  const IconComponent = iconMap[card.icon] || LucideIcons.AlertCircle;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-4 ${card.color}`}>
            <IconComponent className="w-4 h-4" />
            {card.title}
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            {card.desc}
          </p>

          <h4 className="font-semibold text-foreground mb-3">
            Exemplos:
          </h4>

          <ul className="space-y-3">
            {card.examples.map((example, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span className="leading-relaxed">{example}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
