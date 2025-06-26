import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Item {
  id: string;
  name: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  stats?: {
    damage?: number;
    armor?: number;
    strength?: number;
    agility?: number;
    intelligence?: number;
  };
  durability?: {
    current: number;
    max: number;
  };
  level?: number;
}

interface ItemSlotProps {
  width: number;
  height: number;
  item?: Item;
  slotType: string;
  className?: string;
}

const rarityColors = {
  common: "border-gray-400",
  uncommon: "border-green-400",
  rare: "border-blue-400",
  epic: "border-purple-400",
  legendary: "border-yellow-400 shadow-yellow-400/30",
};

const ItemSlot = ({
  width,
  height,
  item,
  slotType,
  className,
}: ItemSlotProps) => {
  const slotContent = (
    <div
      className={cn(
        "bg-gradient-to-b from-bw-card-bg to-bw-muted border-2 border-bw-border rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-bw-accent-gold/50 hover:shadow-lg relative overflow-hidden",
        "shadow-[inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.3)]",
        item
          ? [
              "hover:scale-105 transform",
              item.rarity === "legendary" &&
                "border-yellow-400 shadow-yellow-400/30",
              item.rarity === "epic" &&
                "border-purple-400 shadow-purple-400/30",
              item.rarity === "rare" && "border-blue-400 shadow-blue-400/30",
              item.rarity === "uncommon" &&
                "border-green-400 shadow-green-400/30",
            ]
          : "hover:bg-bw-hover",
        className,
      )}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {item ? (
        <div className="w-full h-full flex items-center justify-center p-1">
          <div
            className="text-3xl"
            style={{ fontSize: `${Math.min(width, height) * 0.6}px` }}
          >
            {item.icon}
          </div>
          {item.durability && (
            <div className="absolute bottom-1 left-1 right-1 h-1.5 bg-black/50 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-bw-primary-red to-bw-accent-gold rounded-full"
                style={{
                  width: `${(item.durability.current / item.durability.max) * 100}%`,
                }}
              />
            </div>
          )}
          {item.level && (
            <div className="absolute top-1 right-1 bg-bw-accent-gold text-bw-dark-bg text-xs font-bold rounded px-1">
              {item.level}
            </div>
          )}
        </div>
      ) : (
        <div className="text-bw-muted text-xs opacity-60 text-center px-1">
          {slotType}
        </div>
      )}
    </div>
  );

  if (!item) {
    return slotContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{slotContent}</TooltipTrigger>
      <TooltipContent className="bg-bw-card-bg border-bw-border shadow-lg max-w-xs">
        <div className="p-2">
          <h3
            className={cn("font-semibold", {
              "text-gray-300": item.rarity === "common",
              "text-green-400": item.rarity === "uncommon",
              "text-blue-400": item.rarity === "rare",
              "text-purple-400": item.rarity === "epic",
              "text-yellow-400": item.rarity === "legendary",
            })}
          >
            {item.name}
          </h3>

          {item.level && (
            <p className="text-xs text-bw-muted">Уровень {item.level}</p>
          )}

          {item.stats && (
            <div className="mt-2 space-y-1 text-xs">
              {item.stats.damage && (
                <div className="text-bw-primary-red">
                  Урон: +{item.stats.damage}
                </div>
              )}
              {item.stats.armor && (
                <div className="text-blue-400">Броня: +{item.stats.armor}</div>
              )}
              {item.stats.strength && (
                <div className="text-red-400">Сила: +{item.stats.strength}</div>
              )}
              {item.stats.agility && (
                <div className="text-green-400">
                  Ловкость: +{item.stats.agility}
                </div>
              )}
              {item.stats.intelligence && (
                <div className="text-cyan-400">
                  Интеллект: +{item.stats.intelligence}
                </div>
              )}
            </div>
          )}

          {item.durability && (
            <div className="mt-2 text-xs">
              <div className="text-bw-muted">
                Прочность: {item.durability.current}/{item.durability.max}
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default ItemSlot;
