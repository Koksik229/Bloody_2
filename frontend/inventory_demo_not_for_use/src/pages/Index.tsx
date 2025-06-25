import TopMenu from "@/components/TopMenu";
import EquipmentPanel from "@/components/EquipmentPanel";
import InventoryPanel from "@/components/InventoryPanel";

const Index = () => {
  return (
    <div className="h-screen bg-bw-main-bg flex flex-col overflow-hidden">
      {/* Top Menu - Fixed 60px height */}
      <div className="h-15 flex-shrink-0">
        <TopMenu />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden px-20 py-12 pb-16">
        {/* Left Side - Equipment Panel */}
        <div className="w-123 flex-shrink-0 border-r border-bw-border pr-8">
          <EquipmentPanel />
        </div>

        {/* Right Side - Inventory Panel */}
        <div className="flex-1 pl-8 min-h-0">
          <InventoryPanel />
        </div>
      </div>
    </div>
  );
};

export default Index;
