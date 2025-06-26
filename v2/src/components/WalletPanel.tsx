import { Coins } from "lucide-react";

interface WalletPanelProps {
  gold: number;
  silver: number;
  copper: number;
}

const WalletPanel = ({ gold, silver, copper }: WalletPanelProps) => {
  return (
    <div className="bg-gradient-to-r from-bw-card-bg to-bw-muted border border-bw-border rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-bw-text-on-dark font-semibold text-sm">Кошелек</h3>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-bw-dark-bg px-3 py-1 rounded-md">
            <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg"></div>
            <span className="text-yellow-400 font-bold text-sm">
              {gold.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-bw-dark-bg px-3 py-1 rounded-md">
            <div className="w-3 h-3 bg-gray-300 rounded-full shadow-lg"></div>
            <span className="text-gray-300 font-bold text-sm">
              {silver.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-bw-dark-bg px-3 py-1 rounded-md">
            <div className="w-3 h-3 bg-amber-600 rounded-full shadow-lg"></div>
            <span className="text-amber-600 font-bold text-sm">
              {copper.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPanel;
