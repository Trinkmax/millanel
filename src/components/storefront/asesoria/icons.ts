import {
  Flower2,
  Candy,
  TreePine,
  Droplets,
  Flame,
  Gem,
  Leaf,
  Venus,
  Mars,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  Infinity as InfinityIcon,
  Zap,
  Heart,
  type LucideIcon,
} from "lucide-react";

/** String → icon map so the quiz definitions (questions.ts / families.ts) stay
 *  plain data and the UI resolves the component here. */
const MAP: Record<string, LucideIcon> = {
  flower: Flower2,
  cake: Candy,
  tree: TreePine,
  droplet: Droplets,
  flame: Flame,
  gem: Gem,
  leaf: Leaf,
  venus: Venus,
  mars: Mars,
  sparkles: Sparkles,
  sun: Sun,
  moon: Moon,
  coffee: Coffee,
  infinity: InfinityIcon,
  zap: Zap,
  heart: Heart,
};

export function quizIcon(key?: string): LucideIcon {
  return (key && MAP[key]) || Sparkles;
}
