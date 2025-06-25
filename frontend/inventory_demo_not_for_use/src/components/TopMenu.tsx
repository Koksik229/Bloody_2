import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TopMenu = () => {
  return (
    <div className="h-full bg-gradient-to-r from-bw-dark-bg to-bw-card-bg border-b-2 border-bw-accent-gold/30 shadow-lg">
      <div className="h-full flex items-center justify-between px-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-bw-text-on-dark hover:bg-bw-hover/50 transition-all duration-200 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Назад</span>
        </Button>

        <div className="flex bg-bw-card-bg rounded-lg p-1 border border-bw-border">
          <Button
            variant="ghost"
            size="sm"
            className="text-bw-text-on-dark hover:bg-bw-hover transition-all duration-200 rounded-md"
          >
            Навыки
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-bw-accent-gold text-bw-dark-bg hover:bg-bw-accent-gold/90 transition-all duration-200 rounded-md font-semibold shadow-md"
          >
            Инвентарь
          </Button>
        </div>

        <div className="w-20"></div>
      </div>
    </div>
  );
};

export default TopMenu;
