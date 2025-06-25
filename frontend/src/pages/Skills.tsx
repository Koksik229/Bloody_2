import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  Plus,
  Minus,
  RotateCcw,
  Save,
  X,
  Zap,
  Target,
  Shield,
  Heart,
  Sword,
  Eye,
  Map,
  Package,
  User,
  Settings,
  Fish,
  Trees,
  Hammer,
  Axe,
  Pickaxe,
  Scissors,
  Crown,
  HelpCircle,
  RotateCcwSquare,
} from "lucide-react";

interface Attribute {
  id: string;
  name: string;
  icon: React.ReactNode;
  base: number;
  gear: number;
  buff: number;
  description: string;
  bonusDescription: string;
}

interface CombatSkill {
  id: string;
  name: string;
  icon: React.ReactNode;
  base: number;
  gear: number;
  buff: number;
  description: string;
  bonusDescription: string;
}

interface PassiveBuff {
  id: string;
  name: string;
  description: string;
  remainingTime: number;
  maxTime: number;
  value: string;
}

interface ProfessionalSkill {
  id: string;
  name: string;
  icon: React.ReactNode;
  currentXP: number;
  maxXP: number;
  level: number;
  description: string;
}

interface PlayerState {
  xpMilestones?: number[];
  level: number;
  currentXP: number;
  nextLevelXP: number;
  attributePoints: number;
  specialPoints: number;
  nickname: string;
  race: string;
  avatar: string;
}

const SKILL_POINT_VALUE = 5; // каждая спец-очка даёт +5 к уровню умения

interface SkillsProps { onBack?: () => void }
const Skills: React.FC<SkillsProps> = ({ onBack }) => {
    // Base URL of backend API (without trailing slash)
  // Base URL from env (may already include /api/v1)
  const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
  // Если BASE уже заканчивается на /api/v1 не дублируем
  const API_ROOT = /\/api\/v1$/.test(RAW_BASE) ? RAW_BASE : `${RAW_BASE}/api/v1`;
  const SKILLS_ENDPOINT = `${API_ROOT}/skills`;
  const PRO_SKILLS_ENDPOINT = `${API_ROOT}/professional-skills`;
  const PROFILE_ENDPOINT = `${API_ROOT}/me`;
  const { toast } = useToast();

  // --- Load player profile (level, experience) ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(PROFILE_ENDPOINT, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setPlayerState((prev) => ({
          ...prev,
          level: data.level ?? prev.level,
          currentXP: data.experience ?? prev.currentXP,
          nextLevelXP: data.next_level_experience ?? prev.nextLevelXP,
          attributePoints: data.points?.attributes ?? prev.attributePoints,
          xpMilestones: data.ap_breakpoints ?? prev.xpMilestones,
          specialPoints: data.points?.attributes_special ?? prev.specialPoints,
          nickname: data.nickname ?? prev.nickname,
          race: data.race?.name ?? prev.race,
        }));
      } catch (e) {
        console.error("Failed loading profile", e);
      }
    };
    fetchProfile();
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("attributes");
  const [professionalSkills, setProfessionalSkills] = useState<ProfessionalSkill[]>([]);

  const [playerState, setPlayerState] = useState<PlayerState>({
    level: 15,
    currentXP: 7500,
    nextLevelXP: 10000,
    attributePoints: 5,
    specialPoints: 2,
    nickname: "BloodWarrior",
    race: "Эльф",
    avatar: "/placeholder.svg",
  });

  const [attributes, setAttributes] = useState<Attribute[]>([
    {
      id: "strength",
      name: "Сила",
      icon: <Sword className="w-6 h-6" />,
      base: 0,
      gear: 0,
      buff: 0,
      description: "Физическая мощь и урон в ближнем бою",
      bonusDescription: "+1 Сила = +0.5 урона за удар",
    },
    {
      id: "agility",
      name: "Ловкость",
      icon: <Target className="w-6 h-6" />,
      base: 0,
      gear: 0,
      buff: 0,
      description: "Скорость, точность и шанс критического удара",
      bonusDescription: "+1 Ловкость = +0.3% шанс крита, +0.1% уклонение",
    },
    {
      id: "power",
      name: "Мощь",
      icon: <Zap className="w-6 h-6" />,
      base: 0,
      gear: 0,
      buff: 0,
      description: "Магическая сила и урон заклинаний",
      bonusDescription: "+1 Мощь = +0.8 урона заклинаний, +2 маны",
    },
    {
      id: "intuition",
      name: "Интуиция",
      icon: <Eye className="w-6 h-6" />,
      base: 0,
      gear: 0,
      buff: 1,
      description: "Восприятие, удача и получение опыта",
      bonusDescription: "+1 Интуиция = +1% получение опыта, +0.2% редкий дроп",
    },
  ]);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(SKILLS_ENDPOINT, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) throw new Error("Failed to load attributes");
        const data = await res.json();
        if (data?.attributes) {
          setAttributes((prev) =>
            prev.map((attr) => ({
              ...attr,
              base: data.attributes[attr.id as keyof typeof data.attributes] ?? attr.base,
            }))
          );
          if (data.points?.attributes !== undefined) {
            setPlayerState((prev) => ({ ...prev, attributePoints: data.points.attributes }));
          }
        }
          // combat skills
          if (data?.combat_skills) {
            const skillsArr: CombatSkill[] = Object.entries(data.combat_skills).map(([key, value]) => {
              const meta = COMBAT_SKILL_META[key] ?? {
                name: key,
                icon: <Star className="w-5 h-5" />,
                description: "",
                bonusDescription: "",
              };
              return {
                id: key,
                name: meta.name,
                icon: meta.icon,
                base: value as number,
                gear: 0,
                buff: 0,
                description: meta.description,
                bonusDescription: meta.bonusDescription,
              };
            });
            setCombatSkills(skillsArr);
          }
          if (data.points?.attributes_special !== undefined) {
            setPlayerState((prev) => ({
              ...prev,
              specialPoints: data.points.attributes_special,
            }));
          }
      } catch (e) {
        console.error(e);
        toast({ title: "Не удалось загрузить атрибуты", variant: "destructive" });
      }
    };
    fetchAttributes();
  }, []);

  
  // --- Load professional skills ---
  useEffect(() => {
    const fetchProfessionalSkills = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(PRO_SKILLS_ENDPOINT, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;

        // словарь соответствия кода умения и иконки
        const ICONS: Record<string, React.ReactNode> = {
          fishing: <Fish className="w-5 h-5" />,
          woodcutting: <Axe className="w-5 h-5" />,
          hunting: <Target className="w-5 h-5" />,
          blacksmithing: <Hammer className="w-5 h-5" />,
          mining: <Pickaxe className="w-5 h-5" />,
          tailoring: <Scissors className="w-5 h-5" />,
          herbalism: <Trees className="w-5 h-5" />,
        };

        const skillsArr: ProfessionalSkill[] = data.map((s: any) => ({
          id: s.code,
          name: s.name,
          icon: ICONS[s.code] ?? <Hammer className="w-5 h-5" />,
          currentXP: s.current_xp ?? 0,
          maxXP: s.next_level_xp ?? Math.max(s.current_xp ?? 1, 1),
          level: s.level ?? 1,
          description: s.description ?? "",
        }));
        setProfessionalSkills(skillsArr);
      } catch (err) {
        console.error("Failed loading professional skills", err);
      }
    };
    fetchProfessionalSkills();
  }, []);

  // карта метаданных (иконка, название, описание)
  const COMBAT_SKILL_META: Record<string, { name: string; icon: React.ReactNode; description: string; bonusDescription: string }> = {
    weapon_skill: {
      name: "Владение оружием",
      icon: <Sword className="w-5 h-5" />,
      description: "Мастерство владения оружием ближнего боя",
      bonusDescription: "+1 уровень = +0.4% шанс попадания, +0.2% урона",
    },
    parry: {
      name: "Парирование",
      icon: <Shield className="w-5 h-5" />,
      description: "Отражение атак противника",
      bonusDescription: "+1 уровень = +0.3% шанс парирования",
    },
    shield_block: {
      name: "Блок щитом",
      icon: <Shield className="w-5 h-5" />,
      description: "Блокирование ударов щитом",
      bonusDescription: "+1 уровень = +0.5% шанс блока, +0.1 снижение урона",
    },
  };

  const [combatSkills, setCombatSkills] = useState<CombatSkill[]>([]);



  const [passiveBuffs, setPassiveBuffs] = useState<PassiveBuff[]>([
    {
      id: "battle-fury",
      name: "Battle Fury",
      description: "+15% damage for 10 minutes",
      remainingTime: 420,
      maxTime: 600,
      value: "+15% DMG",
    },
    {
      id: "mage-armor",
      name: "Mage Armor",
      description: "+20 magic resistance",
      remainingTime: 1200,
      maxTime: 1800,
      value: "+20 MR",
    },
    {
      id: "swift-feet",
      name: "Swift Feet",
      description: "+10% movement speed",
      remainingTime: 180,
      maxTime: 300,
      value: "+10% SPD",
    },
  ]);

  useEffect(() => {
    const fetchProfessionalSkills = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(PRO_SKILLS_ENDPOINT, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        const skillsArr: ProfessionalSkill[] = data.map((s: any) => ({
          id: s.code,
          name: s.name,
          icon: <Hammer className="w-5 h-5" />, // TODO: подобрать иконку по коду
          currentXP: s.current_xp,
          maxXP: s.next_level_xp ?? s.current_xp,
          level: s.level,
          description: s.description ?? "",
        }));
        setProfessionalSkills(skillsArr);
      } catch (e) {
        console.error("Failed loading professional skills", e);
      }
    };
    fetchProfessionalSkills();
  }, []);


  const handleAttributeChange = (attributeId: string, delta: number) => {
    if (!isEditing) setIsEditing(true);

    const currentChange = changes[attributeId] || 0;
    const newChange = currentChange + delta;
    const remainingPoints =
      playerState.attributePoints -
      Object.values(changes).reduce((sum, change) => sum + change, 0);

    if (delta > 0 && remainingPoints <= 0) {
      toast({
        title: "Недостаточно очков",
        description: "У вас нет доступных очков атрибутов",
        variant: "destructive",
      });
      return;
    }

    if (newChange < 0) return; // Cannot reduce below base

    setChanges((prev) => ({
      ...prev,
      [attributeId]: newChange,
    }));
  };

  const handleSkillChange = (skillId: string, delta: number) => {
    if (!isEditing) setIsEditing(true);

    const currentChange = changes[skillId] || 0;
    const newChange = currentChange + delta;
    const remainingPoints =
      playerState.specialPoints -
      Object.values(changes)
        .filter(
          (_, index) => index >= attributes.length, // Skills come after attributes in changes object
        )
        .reduce((sum, change) => sum + change, 0);

    if (delta > 0 && remainingPoints <= 0) {
      toast({
        title: "Недостаточно специальных очков",
        description: "У вас нет доступных специальных очков",
        variant: "destructive",
      });
      return;
    }

    if (newChange < 0) return;

    setChanges((prev) => ({
      ...prev,
      [skillId]: newChange,
    }));
  };

  const handleSave = async () => {
    // --- Attributes ---
    // вычисляем изменения только для базовых атрибутов
    const attributeDeltas: Record<string, number> = {};
    let spent = 0;
    attributes.forEach((attr) => {
      const delta = changes[attr.id] ?? 0;
      if (delta !== 0) {
        attributeDeltas[attr.id] = attr.base + delta;
        spent += delta;
      }
    });

    if (spent > playerState.attributePoints) {
      toast({ title: "Недостаточно очков", variant: "destructive" });
      return;
    }

    let confirmUnused = false;
    const remaining = playerState.attributePoints - spent;
    if (remaining > 0) {
      confirmUnused = !window.confirm(`Останется ${remaining} нераспределённых очков. Сохранить?`);
    }
    if (confirmUnused) return;

        // --- Combat skills ---
    const combatDeltas: Record<string, number> = {};
    let spentSpecial = 0;
    combatSkills.forEach((skill) => {
      const delta = changes[skill.id] ?? 0;
      if (delta !== 0) {
        combatDeltas[skill.id] = skill.base + delta * SKILL_POINT_VALUE;
        spentSpecial += delta;
      }
    });

    // validate points
    if (spent === 0 && spentSpecial === 0) {
      toast({ title: "Нет изменений" });
      return;
    }
    if (spentSpecial > playerState.specialPoints) {
      toast({ title: "Недостаточно спец-очков", variant: "destructive" });
      return;
    }

    const remainingAttr = playerState.attributePoints - spent;
    const remainingSpec = playerState.specialPoints - spentSpecial;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(SKILLS_ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          attributes: Object.keys(attributeDeltas).length ? attributeDeltas : undefined,
          combat_skills: Object.keys(combatDeltas).length ? combatDeltas : undefined,
          points: {
            attributes: remainingAttr,
            attributes_special: remainingSpec,
          },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setAttributes((prev) =>
        prev.map((attr) => ({
          ...attr,
          base: attr.base + (changes[attr.id] || 0),
        })),
      );
      setAttributes((prev) => prev.map(attr => ({
          ...attr,
          base: attr.base + (changes[attr.id] || 0),
        })));
      setCombatSkills((prev) => prev.map(skill => ({
          ...skill,
          base: skill.base + (changes[skill.id] || 0) * SKILL_POINT_VALUE,
        })));
      setPlayerState((prev) => ({ ...prev, attributePoints: remainingAttr, specialPoints: remainingSpec }));
      setChanges({});
      setIsEditing(false);
      toast({ title: "Атрибуты сохранены" });
    } catch (e) {
      console.error(e);
      toast({ title: "Ошибка при сохранении", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Отменяем все локальные изменения
    setChanges({});
    setIsEditing(false);
    toast({
      title: "Изменения отменены",
      description: "Все несохранённые изменения сброшены",
    });
  };

  const handleCancel = () => {
    setChanges({});
    setIsEditing(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTotalAttributeValue = (attr: Attribute) => {
    return attr.base + (changes[attr.id] || 0) + attr.gear + attr.buff;
  };

  const getTotalSkillValue = (skill: CombatSkill) => {
    return skill.base + (changes[skill.id] || 0) * SKILL_POINT_VALUE + skill.gear + skill.buff;
  };

  const getRemainingAttributePoints = () => {
    const usedPoints = Object.entries(changes)
      .filter(([key]) => attributes.some((attr) => attr.id === key))
      .reduce((sum, [, value]) => sum + value, 0);
    return playerState.attributePoints - usedPoints;
  };

  const getRemainingSpecialPoints = () => {
    const usedPoints = Object.entries(changes)
      .filter(([key]) => combatSkills.some((skill) => skill.id === key))
      .reduce((sum, [, value]) => sum + value, 0);
    return playerState.specialPoints - usedPoints;
  };

  // Auto-decrease buff timers
  useEffect(() => {
    const interval = setInterval(() => {
      setPassiveBuffs((prev) =>
        prev
          .map((buff) => ({
            ...buff,
            remainingTime: Math.max(0, buff.remainingTime - 1),
          }))
          .filter((buff) => buff.remainingTime > 0),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const xpPercentage = playerState.nextLevelXP ? (playerState.currentXP / playerState.nextLevelXP) * 100 : 0;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-bw-dark-bg">
        {/* Header */}
        <div className="bg-bw-card-bg border-b border-bw-border py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-bw-text-on-dark">
                BloodyWorld
              </h1>
              <nav className="flex items-center space-x-4">
                <button className="bw-button text-bw-dark-bg">
                  <Map className="w-4 h-4 mr-2" />
                  Локации
                </button>
                <button className="bw-button bw-button-primary">
                  <Star className="w-4 h-4 mr-2" />
                  Навыки
                </button>
                <button className="bw-button text-bw-dark-bg">
                  <Package className="w-4 h-4 mr-2" />
                  Инвентарь
                </button>
                <button className="bw-button text-bw-dark-bg">
                  <User className="w-4 h-4 mr-2" />
                  Персонаж
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-bw-text-on-dark">
                <span className="text-bw-accent-gold inline-flex items-center">
                  Уровень {playerState.level}
                </span>
              </div>
              <button className="bw-button text-bw-dark-bg">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Skills Header Block */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="bw-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-bw-accent-gold rounded flex items-center justify-center px-4 h-8">
                  <button
            onClick={() => onBack?.()}
            className="w-8 h-8 bg-bw-accent-gold rounded flex items-center justify-center text-xs text-bw-dark-bg font-semibold"
          >
            Вернуться
          </button>
                </div>
                <h2 className="flex-1 text-center text-2xl font-bold text-bw-text-on-dark">
                  Навыки
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                {(Object.keys(changes).length > 0 || isEditing) && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="bw-button text-bw-dark-bg"
                    disabled={isLoading}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Сбросить
                  </Button>
                )}
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-bw-text-on-dark mb-2">
                <span>Опыт</span>
                <span>
                  {playerState.currentXP?.toLocaleString() ?? 0} / {playerState.nextLevelXP?.toLocaleString() ?? "—"}
                </span>
              </div>
              <div className="bw-progress relative h-3">
                <div
                  className="bw-progress-bar animate-progress-fill"
                  style={{ width: `${xpPercentage}%` }}
                />
                {playerState.xpMilestones?.map((bp, idx) =>
                  idx === 0 || !playerState.nextLevelXP ? null : (
                    <Tooltip key={bp} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute top-0 h-full w-1 bg-bw-accent-gold cursor-pointer"
                          style={{ left: `${(bp / playerState.nextLevelXP) * 100}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bw-tooltip text-xs">
                        ап {idx} • опыт {bp}
                      </TooltipContent>
                    </Tooltip>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Sidebar (3 columns) */}
            <div className="xl:col-span-3 space-y-6">
              {/* Character Mini Profile */}
              <div className="bw-card-bloody p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-bw-muted rounded-full mx-auto mb-3 flex items-center justify-center">
                    <User className="w-8 h-8 text-bw-text-on-dark" />
                  </div>
                  <h3 className="font-bold text-bw-text-on-dark">
                    {playerState.nickname}
                  </h3>
                  <p className="text-sm text-bw-accent-gold flex items-center justify-center">
                    {playerState.race}
                  </p>
                  <p className="text-sm text-gray-400">
                    Уровень {playerState.level}
                  </p>
                </div>
              </div>

              {/* Circular Progress Diagram */}
              <div className="bw-card p-6">
                <h4 className="font-bold text-bw-text-on-dark mb-4">
                  Ваш боевой рейтинг
                </h4>
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="circular-progress">
                        <svg
                          width="64"
                          height="64"
                          className="transform -rotate-90"
                        >
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            className="progress-ring"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            className="progress-value"
                            strokeDasharray={`${(attributes.reduce((sum, attr) => sum + attr.base, 0) / (attributes.reduce((sum, attr) => sum + attr.base, 0) + combatSkills.reduce((sum, skill) => sum + skill.base, 0))) * 176} 176`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-bw-text-on-dark">
                            {Math.round(
                              (attributes.reduce(
                                (sum, attr) => sum + attr.base,
                                0,
                              ) /
                                (attributes.reduce(
                                  (sum, attr) => sum + attr.base,
                                  0,
                                ) +
                                  combatSkills.reduce(
                                    (sum, skill) => sum + skill.base,
                                    0,
                                  ))) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bw-tooltip">
                      <p>Соотношение характеристик и боевых навыков</p>
                      <p className="text-bw-accent-gold">
                        Характеристики:{" "}
                        {Math.round(
                          (attributes.reduce(
                            (sum, attr) => sum + attr.base,
                            0,
                          ) /
                            (attributes.reduce(
                              (sum, attr) => sum + attr.base,
                              0,
                            ) +
                              combatSkills.reduce(
                                (sum, skill) => sum + skill.base,
                                0,
                              ))) *
                            100,
                        )}
                        %
                      </p>
                      <p className="text-blue-400">
                        Боевые:{" "}
                        {Math.round(
                          (combatSkills.reduce(
                            (sum, skill) => sum + skill.base,
                            0,
                          ) /
                            (attributes.reduce(
                              (sum, attr) => sum + attr.base,
                              0,
                            ) +
                              combatSkills.reduce(
                                (sum, skill) => sum + skill.base,
                                0,
                              ))) *
                            100,
                        )}
                        %
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Full Reset Button */}
              <div className="bw-card p-4 mt-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="w-full bw-button flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-900/20">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Полный сброс
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bw-tooltip max-w-xs">
                    <p className="font-medium">Полный сброс характеристик</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Полностью сбросит ваши вкачанные характеристики и умения,
                      все очки будут доступны.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Center Column (6 columns) */}
            <div className="xl:col-span-6">
              <div className="bw-card-bloody p-6">
                <div className="bw-tabs-list mb-6">
                  <button
                    onClick={() => setActiveTab("attributes")}
                    className="bw-tab-trigger"
                    data-state={
                      activeTab === "attributes" ? "active" : "inactive"
                    }
                  >
                    <Sword className="w-4 h-4 tab-icon" />
                    Характеристики
                  </button>
                  <button
                    onClick={() => setActiveTab("combat")}
                    className="bw-tab-trigger"
                    data-state={activeTab === "combat" ? "active" : "inactive"}
                  >
                    <Shield className="w-4 h-4 tab-icon" />
                    Умения
                  </button>
                  <button
                    onClick={() => setActiveTab("professional")}
                    className="bw-tab-trigger"
                    data-state={
                      activeTab === "professional" ? "active" : "inactive"
                    }
                  >
                    <Hammer className="w-4 h-4 tab-icon" />
                    Способности
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === "attributes" && (
                    <div className="bw-tab-content">
                      <h3 className="text-lg font-bold text-bw-text-on-dark mb-4">
                        Базовые характеристики
                      </h3>
                      <div className="space-y-1">
                        {attributes.map((attr) => (
                          <div
                            key={attr.id}
                            className={`attribute-row ${getRemainingAttributePoints() > 0 ? "upgradeable-skill" : ""}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-bw-accent-gold">
                                {attr.icon}
                              </div>
                              <div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="font-medium text-bw-text-on-dark cursor-help">
                                      {attr.name}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bw-tooltip max-w-xs">
                                    <p className="font-medium">{attr.name}</p>
                                    <p className="text-sm text-gray-300 mt-1">
                                      {attr.description}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="attribute-breakdown">
                                      {attr.base + (changes[attr.id] || 0)} +{" "}
                                      {attr.gear} + {attr.buff}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bw-tooltip">
                                    <p className="font-medium">
                                      {attr.description}
                                    </p>
                                    <p className="text-bw-accent-gold text-sm mt-1">
                                      {attr.bonusDescription}
                                    </p>
                                    <div className="mt-2 text-xs">
                                      <div>
                                        База:{" "}
                                        {attr.base + (changes[attr.id] || 0)}
                                      </div>
                                      <div>Снаряжение: +{attr.gear}</div>
                                      <div>Баффы: +{attr.buff}</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="attribute-value text-bw-text-on-dark">
                                {getTotalAttributeValue(attr)}
                                {changes[attr.id] && (
                                  <span className="text-bw-accent-gold text-sm ml-1">
                                    (+{changes[attr.id]})
                                  </span>
                                )}
                              </div>
                              <div className="attribute-controls">
                                <button
                                  className="attribute-button"
                                  onClick={() =>
                                    handleAttributeChange(attr.id, -1)
                                  }
                                  disabled={!changes[attr.id] || isLoading}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <button
                                  className="attribute-button"
                                  onClick={() =>
                                    handleAttributeChange(attr.id, 1)
                                  }
                                  disabled={
                                    getRemainingAttributePoints() <= 0 ||
                                    isLoading
                                  }
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "combat" && (
                    <div className="bw-tab-content">
                      <h3 className="text-lg font-bold text-bw-text-on-dark mb-4">
                        Боевые навыки
                      </h3>
                      <div className="space-y-1">
                        {combatSkills.map((skill) => (
                          <div
                            key={skill.id}
                            className={`attribute-row ${getRemainingSpecialPoints() > 0 ? "upgradeable-skill" : ""}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-bw-accent-gold">
                                {skill.icon}
                              </div>
                              <div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="font-medium text-bw-text-on-dark cursor-help">
                                      {skill.name}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bw-tooltip max-w-xs">
                                    <p className="font-medium">{skill.name}</p>
                                    <p className="text-sm text-gray-300 mt-1">
                                      {skill.description}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="attribute-breakdown">
                                      {skill.base + (changes[skill.id] || 0) * SKILL_POINT_VALUE} +{" "}
                                      {skill.gear} + {skill.buff}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bw-tooltip">
                                    <p className="font-medium">
                                      {skill.description}
                                    </p>
                                    <p className="text-bw-accent-gold text-sm mt-1">
                                      {skill.bonusDescription}
                                    </p>
                                    <div className="mt-2 text-xs">
                                      <div>
                                        База:{" "}
                                        {skill.base + (changes[skill.id] || 0) * SKILL_POINT_VALUE}
                                      </div>
                                      <div>Снаряжение: +{skill.gear}</div>
                                      <div>Баффы: +{skill.buff}</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="attribute-value text-bw-text-on-dark">
                                {getTotalSkillValue(skill)}
                                {changes[skill.id] && (
                                  <span className="text-bw-accent-gold text-sm ml-1">
                                    (+{(changes[skill.id] || 0) * SKILL_POINT_VALUE})
                                  </span>
                                )}
                              </div>
                              <div className="attribute-controls">
                                <button
                                  className="attribute-button"
                                  onClick={() =>
                                    handleSkillChange(skill.id, -1)
                                  }
                                  disabled={!changes[skill.id] || isLoading}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <button
                                  className="attribute-button"
                                  onClick={() => handleSkillChange(skill.id, 1)}
                                  disabled={
                                    getRemainingSpecialPoints() <= 0 ||
                                    isLoading
                                  }
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "professional" && (
                    <div className="bw-tab-content">
                      <h3 className="text-lg font-bold text-bw-text-on-dark mb-4">
                        Профессиональные навыки
                      </h3>
                      <div className="space-y-3">
                        {professionalSkills.map((skill) => (
                          <div
                            key={skill.id}
                            className="bg-bw-muted p-4 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="text-bw-accent-gold">
                                  {skill.icon}
                                </div>
                                <div>
                                  <div className="font-medium text-bw-text-on-dark">
                                    {skill.name}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {skill.description}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-bw-accent-gold">
                                  Уровень {skill.level}
                                </div>
                                <div className="text-sm text-gray-400 tabular-nums">
                                  {skill.currentXP}/{skill.maxXP}
                                </div>
                              </div>
                            </div>
                            <div className="bw-progress h-2">
                              <div
                                className="bw-progress-bar"
                                style={{
                                  width: `${(skill.currentXP / skill.maxXP) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar (3 columns) */}
            <div className="xl:col-span-3 space-y-6">
              {isEditing && (
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  className="w-full bw-button bw-button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-spinner w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Сохранить изменения
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full bw-button text-bw-dark-bg"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Отмена
                </Button>
              </div>
            )}
            {/* Available Points */}
              <div className="bw-card-bloody p-6">
                <h4 className="font-bold text-bw-text-on-dark mb-4">
                  Доступные очки
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-bw-text-on-dark">
                      Характеристики:
                    </span>
                    <Badge className="bg-bw-accent-gold text-bw-dark-bg">
                      {getRemainingAttributePoints()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-bw-text-on-dark">Специальные:</span>
                    <Badge className="bg-bw-accent-gold text-bw-dark-bg">
                      {getRemainingSpecialPoints()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Passive Bonuses */}
              <div className="bw-card-bloody p-6">
                <h4 className="font-bold text-bw-text-on-dark mb-4">
                  Пассивные бонусы
                </h4>
                <div className="space-y-3">
                  {passiveBuffs.map((buff) => (
                    <div
                      key={buff.id}
                      className="flex items-center justify-between p-2 bg-bw-muted rounded"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-bw-text-on-dark">
                          {buff.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {buff.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-bw-accent-gold">
                          {buff.value}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTime(buff.remainingTime)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {passiveBuffs.length === 0 && (
                    <div className="text-sm text-gray-400 text-center py-4">
                      Нет активных баффов
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Skills;
