import React, { useEffect, useState } from 'react';
import '../styles/ShopSidebar.css';

interface ItemGroup {
  id: number;
  code: string;
  name: string;
}

interface ItemCategory {
  id: number;
  code: string;
  name: string;
  groups: ItemGroup[];
}

interface Props {
  onSelectGroup?: (groupCode: string) => void;
}

const ShopSidebar: React.FC<Props> = ({ onSelectGroup }) => {
  const [cats, setCats] = useState<ItemCategory[]>([]);

  useEffect(() => {
    fetch('/api/v1/shop/categories')
      .then((r) => r.json())
      .then(setCats)
      .catch((e) => console.error('shop categories fetch', e));
  }, []);

  return (
    <div className="shop-sidebar">
      {cats.map((cat) => (
        <div key={cat.id} className="shop-block">
          <div className={`shop-icon icon-${cat.code}`} />
          <div className="shop-groups">
            {cat.groups.map((g) => (
              <span
                key={g.id}
                className="shop-group-link"
                onClick={() => onSelectGroup?.(g.code)}
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShopSidebar;
