import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Search, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
// NOTE: динамически загружаем категории и предметы из API
// Позднее sampleItems будут заменены реальными данными, приходящими из API.

interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  category: string;
  subcategory: string;
  description: string;
  stats?: {
    minDamage?: number;
    maxDamage?: number;
    armor?: number;
    strength?: number;
    agility?: number;
    intelligence?: number;
    stamina?: number;
    spirit?: number;
    characteristic1?: number;
    characteristic2?: number;
    characteristic3?: number;
    characteristic4?: number;
    characteristic5?: number;
    characteristic6?: number;
  };
  level?: number;
  requiredLevel?: number;
  durability_cur?: number;
  durability_max?: number;
  quantity?: number;
}

const rarityColors = {
  common: "text-gray-300",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
};


const statTranslate: Record<string,string> = {
  dmg_min: 'Мин. урон',
  dmg_max: 'Макс. урон',
  strength: 'Сила',
  agility: 'Ловкость',
  intelligence: 'Интеллект',
  power: 'Мощь',
};

function tr(k: string){return statTranslate[k] || k;}

function getStatLines(it: any): string[] {
  const lines: string[] = [];
  if (it.minDamage && it.maxDamage) lines.push(`${it.minDamage}–${it.maxDamage} урона`);
  if (it.dmg_min && it.dmg_max) lines.push(`${it.dmg_min}–${it.dmg_max} урона`);
  if (it.str_bonus || it.strength) lines.push(`${tr('strength')} +${it.str_bonus ?? it.strength}`);
  if (it.agi_bonus || it.agility) lines.push(`${tr('agility')} +${it.agi_bonus ?? it.agility}`);
  if (it.int_bonus || it.intelligence) lines.push(`${tr('intelligence')} +${it.int_bonus ?? it.intelligence}`);
  if (it.intuition) lines.push(`${tr('intuition')} +${it.intuition}`);
  if (it.base_stats) {
    const map: Record<string,string> = {
      armor: 'Броня',
      stamina: 'Выносливость',
      evasion: 'Уклонение',
      block: 'Блок',
      dmg_min: 'Мин. урон',
      dmg_max: 'Макс. урон',
      strength: 'Сила',
      agility: 'Ловкость',
      intelligence: 'Интеллект',
      power: 'Мощь',
      hp: 'Здоровье',
    };
    // если в base_stats одновременно есть dmg_min и dmg_max, объединим
    if ('dmg_min' in it.base_stats && 'dmg_max' in it.base_stats) {
      lines.push(`${it.base_stats['dmg_min']}–${it.base_stats['dmg_max']} урона`);
    }
    Object.entries(it.base_stats).forEach(([k,v]) => {
      if ((k==='dmg_min')||(k==='dmg_max')) return; // уже обработали
      const label = tr(k);
      lines.push(`${label} +${v}`);
    });
  }
  if (it.effects) {
    const effectMap: Record<string,string> = {
      fire_damage: 'Урон огнём',
      cold_damage: 'Урон льдом',
      poison: 'Яд',
      strength_pct: 'Сила',
      agility_pct: 'Ловкость',
      intelligence_pct: 'Интеллект',
      strength: 'Сила',
      agility: 'Ловкость',
      intelligence: 'Интеллект',
      power: 'Мощь',
      hp: 'Здоровье',
    };
    Object.entries(it.effects).forEach(([k,v]) => {
      const label = effectMap[k] || tr(k);
      const isPct = k.endsWith('_pct') || label.includes('%');
      lines.push(`${label} +${v}${isPct ? '%' : ''}`);
    });
  }
  return lines;
}

export default function V2InventoryPanel() {
  const { token } = useAuth();

  const [categories, setCategories] = useState<string[]>(["Все"]);
  const [subMap, setSubMap] = useState<Record<string, string[]>>({});
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeCat, setActiveCat] = useState("Все");
  const [activeSub, setActiveSub] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`${API}/inventory/categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        const names: string[] = ["Все", ...data.map((c: any) => c.name)];
        const map: Record<string, string[]> = {};
        data.forEach((c: any) => {
          map[c.name] = c.groups?.map((g: any) => g.name) || [];
        });
        setCategories(names);
        setSubMap(map);
        console.log('Fetched categories', data);
        // extract items from groups
        const it: InventoryItem[] = [];
        data.forEach((c: any) =>
          c.groups?.forEach((g: any) =>
            g.items?.forEach((item: any) =>
              it.push({ ...item, category: c.name, subcategory: g.name })
            )
          )
        );
        setItems(it);
      });

  }, [token]);

  const [query, setQuery] = useState("");

  const filtered = items.filter((it) => {
    const catOk = activeCat === "Все" || it.category === activeCat;
    const subOk = !activeSub || it.subcategory === activeSub;
    const qOk = query === "" || it.name.toLowerCase().includes(query.toLowerCase());
    return catOk && subOk && qOk;
  });

  function handleDiscard(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Поиск и категории */}
      <div className="mb-4 flex flex-col gap-4">
        {/* Категории + поиск в одной строке */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                className={cn(
                  "px-3 py-1 text-xs rounded-full",
                  activeCat === cat
                    ? "bg-bw-accent-gold text-bw-dark-bg"
                    : "bg-bw-card-bg border border-bw-border hover:bg-bw-hover"
                )}
                onClick={() => {
                  setActiveCat(cat);
                  setActiveSub(null);
                }}
              >
                {cat}
              </Button>
            ))}
          </div>
          {/* Поиск */}
          <div className="relative w-64 max-w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Поиск..."
              className="pl-9 bg-bw-card-bg border-bw-border placeholder:text-gray-400 w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        {activeCat !== "Все" && (
          <div className="flex gap-2 flex-wrap">
            {(subMap[activeCat] || []).map((sub) => (
              <Button
                key={sub}
                variant={activeSub === sub ? "default" : "outline"}
                size="sm"
                className={cn(
                  "px-3 py-1 text-xs",
                  activeSub === sub && "bg-bw-primary-red text-white"
                )}
                onClick={() => setActiveSub(sub === activeSub ? null : sub)}
              >
                {sub}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Список предметов */}
      <ScrollArea className="flex-1">
        <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-4 pr-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-r from-bw-card-bg to-bw-dark-bg border border-bw-border rounded-lg p-4 flex flex-col gap-2"
            >
              <div className="flex items-start gap-3">
                {item.icon ? (
                  item.icon.startsWith("/") || item.icon.includes(".") ? (
                    <img src={item.icon} alt={item.name} className="w-24 h-24 -ml-2 object-contain rounded" />
                  ) : (
                    <span className="text-5xl -ml-2 leading-none">{item.icon}</span>
                  )
                ) : null}
                <div>
                  <div className="flex justify-between gap-2 items-start w-full">
                    <div className={cn('font-semibold', rarityColors[item.rarity])}>{item.name}</div>
                    {getStatLines(item).length > 0 && (
                      <div className="text-xs text-gray-200 text-right space-y-0.5 mt-1">
                        {getStatLines(item).map((s,idx)=>(
                          <div key={idx}>{s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                      Требуемый уровень: {item.requiredLevel && item.requiredLevel > 0 ? item.requiredLevel : 1}
                    </div>
                  {item.durability_max && (
                    <div className="text-xs text-gray-400">
                      Прочность {item.durability_cur ?? 0} / {item.durability_max}
                    </div>
                  )}

                </div>
              </div>
              {item.description && (
                <div className="text-sm text-bw-muted">
                  {item.description}
                </div>
              )}

              <div className="flex items-center justify-between mt-auto">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-bw-accent-gold to-yellow-300 hover:from-yellow-300 hover:to-bw-accent-gold text-bw-dark-bg font-bold shadow-md h-6 text-xs px-3"
                >
                  Надеть
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-bw-primary-red text-bw-primary-red hover:bg-bw-primary-red hover:text-white h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-bw-card-bg border-bw-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-bw-text-on-dark">
                        Выбросить предмет?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-bw-muted">
                        Вы уверены, что хотите выбросить "{item.name}"? Это действие
                        нельзя отменить.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-bw-muted text-bw-text-on-dark hover:bg-bw-hover">
                        Отмена
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDiscard(item.id)}
                        className="bg-bw-primary-red hover:bg-bw-primary-red/80"
                      >
                        Выбросить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {items.length === 0 ? (
            <div className="text-center text-sm text-gray-400 col-span-full">Загрузка...</div>
          ) : filtered.length === 0 && (
            <div className="text-center text-sm text-gray-400 col-span-full">
              Нет предметов
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
