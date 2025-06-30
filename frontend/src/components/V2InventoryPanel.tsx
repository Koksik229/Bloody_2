import { useState, useEffect } from "react";
import "../styles/inventory.css";
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
  common: "text-gray-100",      // почти белый
  uncommon: "text-green-300",
  rare: "text-sky-300",
  epic: "text-purple-300",
  legendary: "text-yellow-300",
};

const statTranslate: Record<string, string> = {
  dmg_min: 'Мин. урон',
  dmg_max: 'Макс. урон',
  strength: 'Сила',
  agility: 'Ловкость',
  intelligence: 'Интеллект',
  power: 'Мощь',
  intuition: 'Интуиция',
  hp: 'Здоровье',
};

function tr(k: string) {
  const key = k.toLowerCase();
  return statTranslate[key] || key;
}

function getStatLines(it: any): string[] {
  const lines: string[] = [];
  if (it.minDamage && it.maxDamage) lines.push(`${it.minDamage}–${it.maxDamage} урона`);
  if (it.dmg_min && it.dmg_max) lines.push(`${it.dmg_min}–${it.dmg_max} урона`);
  if (it.str_bonus || it.strength) lines.push(`${tr('strength')} +${it.str_bonus ?? it.strength}`);
  if (it.agi_bonus || it.agility) lines.push(`${tr('agility')} +${it.agi_bonus ?? it.agility}`);
  if (it.int_bonus || it.intelligence) lines.push(`${tr('intelligence')} +${it.int_bonus ?? it.intelligence}`);
  if (it.intuition) lines.push(`${tr('intuition')} +${it.intuition}`);
  if (it.base_stats) {
    const map: Record<string, string> = {
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
      intuition: 'Интуиция',
      hp: 'Здоровье',
    };
    // если в base_stats одновременно есть dmg_min и dmg_max, объединим
    if ('dmg_min' in it.base_stats && 'dmg_max' in it.base_stats) {
      lines.push(`${it.base_stats['dmg_min']}–${it.base_stats['dmg_max']} урона`);
    }
    Object.entries(it.base_stats).forEach(([k, v]) => {
      if ((k === 'dmg_min') || (k === 'dmg_max')) return; // уже обработали
      const label = tr(k);
      lines.push(`${label} +${v}`);
    });
  }
  if (it.effects) {
    const effectMap: Record<string, string> = {
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
      intuition: 'Интуиция',
      hp: 'Здоровье',
    };
    Object.entries(it.effects).forEach(([k, v]) => {
      const label = effectMap[k] || tr(k);
      const isPct = k.endsWith('_pct') || label.includes('%');
      lines.push(`${label} +${v}${isPct ? '%' : ''}`);
    });
  }
  return lines;
}

interface Props { onEquip: (item: InventoryItem) => void; refreshKey?: number }
export default function V2InventoryPanel({ onEquip, refreshKey }: Props) {
  const { token } = useAuth();

  async function handleDiscard(id: number) {
    console.log('handleDiscard called', id);
    try {
      const opts: RequestInit = {
        method: 'POST',
        credentials: 'include',
      };
      if (token) {
        opts.headers = { Authorization: `Bearer ${token}` } as any;
      }
      const res = await fetch(`${API}/inventory/items/${id}/discard`, opts);
      if (!res.ok) {
        console.error('discard failed http', res.status);
        return;
      }
      const data = await res.json();
      if (data.status === 'ok') {
        setItems(prev => prev.filter(it => String(it.id) !== String(id)));
      }
    } catch (e) {
      console.error('discard error', e);
    }
  }

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
        const names: string[] = ["Все", ...data.map((c: any) => NAME_MAP[c.name] ?? c.name)];
        const map: Record<string, string[]> = {};
        data.forEach((c: any) => {
          const displayName = NAME_MAP[c.name] ?? c.name;
          map[displayName] = c.groups?.map((g: any) => g.name) || [];
        });
        setCategories(names);
        setSubMap(map);
        console.log('Fetched categories', data);
        // extract items from groups
        const it: InventoryItem[] = [];
        data.forEach((c: any) =>
          c.groups?.forEach((g: any) =>
            g.items?.forEach((item: any) =>
              {
                const catName = NAME_MAP[c.name] ?? c.name;
                it.push({ ...item, category: catName, subcategory: g.name });
              }
            )
          )
        );
        setItems(it);
      });

  }, [token, refreshKey]);

  const [query, setQuery] = useState("");

  const filtered = items.filter((it) => {
    const catOk = activeCat === "Все" || it.category === activeCat;
    const subOk = !activeSub || it.subcategory === activeSub;
    const qOk = query === "" || it.name.toLowerCase().includes(query.toLowerCase());
    return catOk && subOk && qOk;
  });



  const NAME_MAP: Record<string,string> = {
    'подарки/Разное': 'Разное',
    'Подарки/Разное': 'Разное',
    'weapons': 'Оружие',
    'armor': 'Доспехи',
    'equipment': 'Снаряжение',
  };
  function normalizeName(name: string) {
    if (name === 'подарки/Разное') return 'Разное';
    return NAME_MAP[name] ?? name;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Поиск и категории */}
      <div className="mb-4 flex flex-col gap-4">
        {/* Категории + поиск в одной строке */}
        <div className="flex items-center gap-4">
          <div className="inv-cat-list overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                 key={cat}
                 className={cn(
                   "inv-btn",
                   activeCat === cat ? "inv-btn-active" : "inv-btn-inactive"
                 )}
                 onClick={() => {
                   setActiveCat(cat);
                   setActiveSub(null);
                 }}
               >
                 {normalizeName(cat)}
               </button>
            ))}
          </div>
          {/* Поиск */}
          <div className="relative w-64 flex-none ml-auto">
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
          <div className="inv-cat-list overflow-x-auto scrollbar-hide">
            {(subMap[activeCat] || []).map((sub) => (
              <button
                 key={sub}
                 className={cn(
                   "inv-btn",
                   activeSub === sub ? "inv-btn-active" : "inv-btn-inactive"
                 )}
                 onClick={() => setActiveSub(sub === activeSub ? null : sub)}
               >
                 {sub}
               </button>
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
                    <div className={cn('font-semibold', 'text-gray-100', rarityColors[item.rarity] ?? '')}>{item.name}</div>
                    {getStatLines(item).length > 0 && (
                      <div className="text-xs text-gray-200 text-right space-y-0.5 mt-1">
                        {getStatLines(item).map((s,idx)=>(
                          <div key={idx} className="whitespace-nowrap">{s}</div>
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
                  onClick={() => onEquip(item as any)}
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
                      <AlertDialogAction asChild>
                        <Button
                          onClick={() => handleDiscard(item.id.toString())}
                          className="bg-bw-primary-red hover:bg-bw-primary-red/80"
                        >
                          Выбросить
                        </Button>
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
