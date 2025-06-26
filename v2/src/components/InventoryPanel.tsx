import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import { Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  quantity?: number;
}

const categories = [
  "Все",
  "Оружие",
  "Броня",
  "Аксессуары",
  "Зелья",
  "Материалы",
];

const subcategories: Record<string, string[]> = {
  Оружие: ["Мечи", "Топоры", "Луки", "Посохи"],
  Броня: ["Шлемы", "Нагрудники", "Перчатки", "Сапоги"],
  Аксессуары: ["Кольца", "Амулеты", "Пояса"],
  Зелья: ["Лечение", "Мана", "Бафы"],
  Материалы: ["Руды", "Ткани", "Драгоценности"],
};

const sampleItems: InventoryItem[] = [
  {
    id: "sword_002",
    name: "Огненный меч",
    icon: "🔥⚔️",
    rarity: "epic",
    category: "Оружие",
    subcategory: "Мечи",
    description: "Легендарный клинок дракона",
    stats: {
      minDamage: 58,
      maxDamage: 72,
      strength: 12,
      stamina: 3,
      agility: 5,
      intelligence: 2,
      spirit: 4,
      armor: 8,
      characteristic1: 7,
      characteristic2: 9,
    },
    requiredLevel: 25,
  },
  {
    id: "helm_002",
    name: "Шлем дракона",
    icon: "🐲",
    rarity: "legendary",
    category: "Броня",
    subcategory: "Шлемы",
    description: "Древний шлем из чешуи дракона",
    stats: {
      armor: 45,
      intelligence: 8,
      spirit: 6,
      strength: 4,
      agility: 3,
      stamina: 7,
      characteristic1: 12,
      characteristic2: 8,
      characteristic3: 6,
      characteristic4: 5,
    },
    requiredLevel: 30,
  },
  {
    id: "potion_001",
    name: "Зелье лечения",
    icon: "🧪",
    rarity: "common",
    category: "Зелья",
    subcategory: "Лечение",
    description: "Восстанавливает здоровье",
    quantity: 5,
    requiredLevel: 1,
  },
  {
    id: "ring_002",
    name: "Кольцо ловкости",
    icon: "💍",
    rarity: "rare",
    category: "Аксессуары",
    subcategory: "Кольца",
    description: "Эльфийское кольцо ловкости",
    stats: {
      agility: 9,
      intelligence: 3,
      spirit: 2,
      strength: 1,
      characteristic1: 4,
      characteristic2: 6,
      characteristic3: 3,
      characteristic4: 5,
      characteristic5: 2,
      characteristic6: 7,
    },
    requiredLevel: 18,
  },
  {
    id: "bow_001",
    name: "Эльфийский лук",
    icon: "🏹",
    rarity: "uncommon",
    category: "Оружие",
    subcategory: "Луки",
    description: "Лук из священного дерева",
    stats: {
      minDamage: 28,
      maxDamage: 42,
      agility: 6,
      intelligence: 2,
      stamina: 4,
      spirit: 3,
      characteristic1: 5,
      characteristic2: 8,
      characteristic3: 4,
      characteristic4: 6,
    },
    requiredLevel: 12,
  },
  {
    id: "boots_001",
    name: "Сапоги странника",
    icon: "👢",
    rarity: "uncommon",
    category: "Броня",
    subcategory: "Сапоги",
    description: "Прочные кожаные сапоги",
    stats: {
      armor: 12,
      agility: 4,
      stamina: 5,
      strength: 3,
      characteristic1: 6,
      characteristic2: 4,
      characteristic3: 7,
      characteristic4: 5,
      characteristic5: 3,
      characteristic6: 8,
    },
    requiredLevel: 8,
  },
  {
    id: "staff_001",
    name: "Посох мудреца",
    icon: "🔮",
    rarity: "rare",
    category: "Оружие",
    subcategory: "Посохи",
    description: "Мистический посох силы",
    stats: {
      minDamage: 15,
      maxDamage: 35,
      intelligence: 11,
      spirit: 8,
      stamina: 2,
      agility: 3,
      characteristic1: 9,
      characteristic2: 7,
      characteristic3: 5,
      characteristic4: 6,
    },
    requiredLevel: 20,
  },
  {
    id: "gem_001",
    name: "Рубин силы",
    icon: "💎",
    rarity: "epic",
    category: "Материалы",
    subcategory: "Драгоценности",
    description: "Редкий драгоценный камень",
    quantity: 3,
    requiredLevel: 15,
  },
];

const rarityColors = {
  common: "text-gray-300",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
};

const InventoryPanel = () => {
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [selectedSubcategory, setSelectedSubcategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState(sampleItems);

  const filteredItems = items.filter((item) => {
    // Category filter
    if (selectedCategory !== "Все" && selectedCategory !== item.category)
      return false;
    if (
      selectedSubcategory !== "Все" &&
      selectedSubcategory !== item.subcategory
    )
      return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.subcategory.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleDiscardItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const currentSubcategories =
    selectedCategory === "Все"
      ? []
      : ["Все", ...(subcategories[selectedCategory] || [])];

  return (
    <div className="h-full bg-gradient-to-br from-bw-dark-bg via-bw-card-bg to-bw-dark-bg p-8 flex flex-col rounded-xl">
      <div className="w-full space-y-3 flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-bw-card-bg to-bw-muted border border-bw-border rounded-2xl p-4 shadow-xl flex-shrink-0">
          <h2 className="text-bw-accent-gold text-xl font-bold text-center">
            ⚔️ Инвентарь
          </h2>
        </div>

        {/* Categories and Search Combined */}
        <div className="bg-bw-card-bg border border-bw-border rounded-2xl p-3 shadow-lg flex-shrink-0">
          <div className="flex gap-4 items-center">
            {/* Categories - Left Side */}
            <div className="flex-1">
              <h3 className="text-bw-text-on-dark font-medium mb-2 text-sm">
                Категории
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedSubcategory("Все");
                    }}
                    className={cn(
                      "text-xs transition-all duration-200 h-6 px-2",
                      selectedCategory === category
                        ? "bg-bw-accent-gold text-bw-dark-bg hover:bg-bw-accent-gold/90 shadow-sm"
                        : "text-bw-text-on-dark hover:bg-bw-hover border border-bw-border hover:border-bw-accent-gold/50",
                    )}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search - Right Side */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bw-muted h-4 w-4" />
              <Input
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-bw-input border-bw-border text-bw-text-on-dark placeholder:text-bw-muted rounded-lg h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Subcategories - Compact */}
        {currentSubcategories.length > 0 && (
          <div className="bg-bw-card-bg border border-bw-border rounded-xl p-3 shadow-lg flex-shrink-0">
            <h3 className="text-bw-text-on-dark font-medium mb-2 text-sm">
              Подкатегории
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {currentSubcategories.map((subcategory) => (
                <Button
                  key={subcategory}
                  variant={
                    selectedSubcategory === subcategory ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setSelectedSubcategory(subcategory)}
                  className={cn(
                    "text-xs transition-all duration-200 h-6 px-2",
                    selectedSubcategory === subcategory
                      ? "bg-bw-muted text-bw-text-on-dark hover:bg-bw-hover border border-bw-accent-gold shadow-sm"
                      : "text-bw-muted hover:bg-bw-hover border border-bw-border hover:border-bw-accent-gold/30",
                  )}
                >
                  {subcategory}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="bg-bw-card-bg border border-bw-border rounded-2xl p-4 shadow-lg flex flex-col flex-1 min-h-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-bw-text-on-dark font-semibold flex items-center gap-2">
              <span>🎒</span> Предметы
            </h3>
            <div className="bg-bw-accent-gold text-bw-dark-bg px-2 py-1 rounded-full text-xs font-bold">
              {filteredItems.length}
            </div>
          </div>

          <ScrollArea className="flex-1 bw-scrollbar h-0">
            <div className="grid grid-cols-2 gap-3 pr-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-r from-bw-muted to-bw-card-bg border border-bw-border rounded-lg p-3 hover:border-bw-accent-gold/60 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex gap-3 items-start">
                    {/* Item Icon - Left Side */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={cn(
                          "bg-gradient-to-br from-bw-dark-bg to-bw-muted border-2 rounded-lg flex items-center justify-center shadow-lg relative",
                          {
                            "border-gray-400": item.rarity === "common",
                            "border-green-400": item.rarity === "uncommon",
                            "border-blue-400": item.rarity === "rare",
                            "border-purple-400": item.rarity === "epic",
                            "border-yellow-400": item.rarity === "legendary",
                          },
                        )}
                        style={{
                          width: "90px",
                          height: "120px",
                        }}
                      >
                        <span className="text-5xl">{item.icon}</span>

                        {/* Durability bar for equipment */}
                        {(item.category === "Оружие" ||
                          item.category === "Броня") && (
                          <div className="absolute bottom-1 left-1 right-1 h-1 bg-black/50 rounded-full">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full"
                              style={{ width: "78%" }}
                            />
                          </div>
                        )}
                      </div>
                      {item.quantity && (
                        <div className="absolute -top-1 -right-1 bg-bw-accent-gold text-bw-dark-bg text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      )}
                    </div>

                    {/* Item Details - Text Based Stats */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Header */}
                      <div>
                        <h4
                          className={cn(
                            "font-bold text-sm",
                            rarityColors[item.rarity],
                          )}
                        >
                          {item.name}
                        </h4>
                        {item.requiredLevel && (
                          <div className="text-xs text-bw-muted">
                            Требуемый уровень: {item.requiredLevel}
                          </div>
                        )}
                      </div>

                      {/* Stats - Text Format */}
                      {item.stats && (
                        <div className="space-y-0.5 text-xs">
                          {item.stats.minDamage && item.stats.maxDamage && (
                            <div className="flex gap-4">
                              <span className="text-bw-primary-red">
                                Минимальный урон: {item.stats.minDamage}
                              </span>
                              <span className="text-bw-primary-red">
                                Максимальный урон: {item.stats.maxDamage}
                              </span>
                            </div>
                          )}
                          {item.stats.armor && (
                            <div className="text-blue-400">
                              Броня: +{item.stats.armor}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                            {item.stats.strength && (
                              <span className="text-red-400">
                                Сила: +{item.stats.strength}
                              </span>
                            )}
                            {item.stats.agility && (
                              <span className="text-green-400">
                                Ловкость: +{item.stats.agility}
                              </span>
                            )}
                            {item.stats.intelligence && (
                              <span className="text-cyan-400">
                                Интеллект: +{item.stats.intelligence}
                              </span>
                            )}
                            {item.stats.stamina && (
                              <span className="text-orange-400">
                                Выносливость: +{item.stats.stamina}
                              </span>
                            )}
                            {item.stats.spirit && (
                              <span className="text-purple-400">
                                Дух: +{item.stats.spirit}
                              </span>
                            )}
                            {item.stats.characteristic1 && (
                              <span className="text-bw-muted">
                                Характеристика 1: +{item.stats.characteristic1}
                              </span>
                            )}
                            {item.stats.characteristic2 && (
                              <span className="text-bw-muted">
                                Характеристика 2: +{item.stats.characteristic2}
                              </span>
                            )}
                            {item.stats.characteristic3 && (
                              <span className="text-bw-muted">
                                Характеристика 3: +{item.stats.characteristic3}
                              </span>
                            )}
                            {item.stats.characteristic4 && (
                              <span className="text-bw-muted">
                                Характеристика 4: +{item.stats.characteristic4}
                              </span>
                            )}
                            {item.stats.characteristic5 && (
                              <span className="text-bw-muted">
                                Характеристика 5: +{item.stats.characteristic5}
                              </span>
                            )}
                            {item.stats.characteristic6 && (
                              <span className="text-bw-muted">
                                Характеристика 6: +{item.stats.characteristic6}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Right Side */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-bw-accent-gold to-yellow-300 hover:from-yellow-300 hover:to-bw-accent-gold text-bw-dark-bg font-bold shadow-md h-6 text-xs px-3 w-16"
                      >
                        Надеть
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-bw-primary-red text-bw-primary-red hover:bg-bw-primary-red hover:text-white h-6 w-16 p-0 text-xs"
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
                              Вы уверены, что хотите выбросить "{item.name}"?
                              Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-bw-muted text-bw-text-on-dark hover:bg-bw-hover">
                              Отмена
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDiscardItem(item.id)}
                              className="bg-bw-primary-red hover:bg-bw-primary-red/80"
                            >
                              Выбросить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;
