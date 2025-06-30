import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const API = (import.meta as any).env.VITE_API_URL || "http://localhost:8000";

interface Monster {
  id: number;
  name: string;
  icon: string;
}

export default function MonsterGallery() {
  const [monsters, setMonsters] = useState<Monster[]>([]);

  useEffect(() => {
    fetch(`${API}/bestiary/monsters`)
      .then((r) => r.json())
      .then(setMonsters)
      .catch(console.error);
  }, []);

  return (
    <div className="flex gap-6 justify-center items-start mt-4 flex-wrap">
      {monsters.map((m) => (
        <div key={m.id} className="flex flex-col items-center w-48">
          <div className="text-center font-semibold mb-2 text-gray-100">
            {m.name}
          </div>
          <img
            src={`/icons/${m.icon}`}
            alt={m.name}
            className="h-72 object-contain mb-2 rounded"
          />
          <Button onClick={() => console.log("attack", m.id)} className="bg-bw-primary-red hover:bg-bw-primary-red/80 w-full">
            Напасть
          </Button>
        </div>
      ))}
    </div>
  );
}
