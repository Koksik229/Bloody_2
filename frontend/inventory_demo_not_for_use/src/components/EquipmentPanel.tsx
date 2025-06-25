import WalletPanel from "./WalletPanel";

const EquipmentPanel = () => {
  return (
    <div className="h-full bg-bw-dark-bg p-8 overflow-y-auto rounded-xl">
      <div className="max-w-md mx-auto space-y-8">
        {/* Wallet Panel */}
        <WalletPanel gold={12547} silver={834} copper={267} />

        {/* Avatar Placeholder */}
        <div className="space-y-6">
          <h3 className="text-bw-text-on-dark font-semibold text-lg text-center">
            Персонаж
          </h3>

          {/* Avatar Area */}
          <div className="flex justify-center">
            <div
              className="bg-gradient-to-b from-bw-muted to-bw-card-bg border-2 border-bw-border rounded-xl shadow-lg flex items-center justify-center"
              style={{ width: "300px", height: "200px" }}
            >
              <div className="text-center space-y-2">
                <div className="text-8xl">👤</div>
                <p className="text-bw-muted text-sm">Место для аватара</p>
              </div>
            </div>
          </div>

          {/* Equipment Placeholder */}
          <div className="space-y-4">
            <h4 className="text-bw-text-on-dark font-medium text-center">
              Экипировка
            </h4>
            <div className="bg-bw-card-bg border border-bw-border rounded-lg p-6 text-center">
              <p className="text-bw-muted">Слоты экипировки</p>
              <p className="text-bw-muted text-xs mt-2">
                Здесь будут отображаться слоты для экипировки
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPanel;
