import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Shield, Map, ChevronRight, Info, Sword, Brain, Eye, Heart, Crown, Ghost, User, Plus, Minus, ArrowUp, ArrowDown, Check, Upload, Image as ImageIcon, Users, X, Backpack, FileText } from 'lucide-react';

// --- Types ---

type House = {
  id: string;
  name: string;
  homeworld: string;
  traits: string[];
  domains: string[];
  description: string;
  color: string;
  logo: string;
};

type Archetype = {
  id: string;
  name: string;
  description: string;
  primarySkill: string;
  secondarySkill: string;
  coreTrait: string;
  icon: React.ReactNode;
  suggestedAssets: string[]; // Added based on rulebook suggestions
};

type CharacterSheet = {
  id: string;
  house: House | null;
  name: string;
  minorHouseName: string;
  portraitUrl: string | null;
  description: string; // New Field
  archetype: Archetype | null;
  skills: Record<string, number>;
  drives: Record<string, number>;
  talents: string[];
  assets: string[]; // Now fully editable
};

// --- Data ---

const MAJOR_HOUSES: House[] = [
  {
    id: 'atreides',
    name: 'House Atreides',
    homeworld: 'Caladan',
    traits: ['Honorable', 'Popular'],
    domains: ['Farming (Pundi Rice)', 'Military (Tacticians)'],
    description: 'One of the most respected Houses. Known for their code of honor, loyalty, and their lush, water-rich homeworld.',
    color: 'border-green-700',
    logo: '🦅'
  },
  {
    id: 'harkonnen',
    name: 'House Harkonnen',
    homeworld: 'Giedi Prime',
    traits: ['Brutal', 'Cunning'],
    domains: ['Industrial (Mining)', 'Spice Harvesting'],
    description: 'Masters of industrial brutality and manipulation. They rule through fear and maximize profit above all else.',
    color: 'border-orange-700',
    logo: '🐂'
  },
  {
    id: 'corrino',
    name: 'House Corrino',
    homeworld: 'Kaitain',
    traits: ['Imperial', 'Wealthy'],
    domains: ['Military (Sardaukar)', 'Politics'],
    description: 'The Imperial House that has ruled the Known Universe for millennia. They command the deadly Sardaukar.',
    color: 'border-yellow-600',
    logo: '🦁'
  },
  {
    id: 'vernius',
    name: 'House Vernius (Ix)',
    homeworld: 'Ix',
    traits: ['Technological', 'Innovative'],
    domains: ['Technology (Machinery)', 'Shipbuilding'],
    description: 'Masters of machine culture. They push the boundaries of the Butlerian Jihad strictures.',
    color: 'border-purple-600',
    logo: '⚙️'
  },
  {
    id: 'richese',
    name: 'House Richese',
    homeworld: 'Richese',
    traits: ['Technological', 'Traditional'],
    domains: ['Technology (Miniaturization)', 'Manufacturing'],
    description: 'The rivals of Ix. They specialize in miniaturization and optical technology.',
    color: 'border-blue-600',
    logo: '💡'
  }
];

const ARCHETYPES: Archetype[] = [
  {
    id: 'bene_gesserit',
    name: 'The Adept (Bene Gesserit)',
    description: 'A Sister trained in the supreme control of mind and body. You use the Voice and Prana-Bindu.',
    primarySkill: 'Discipline',
    secondarySkill: 'Communicate',
    coreTrait: 'Bene Gesserit Initiate',
    icon: <Eye />,
    suggestedAssets: ["Concealed Dagger", "Truthsayer Drugs", "Archives Access"]
  },
  {
    id: 'mentat',
    name: 'The Mentat',
    description: 'A human computer. You replace thinking machines with pure logic and strategic calculation.',
    primarySkill: 'Understand',
    secondarySkill: 'Discipline',
    coreTrait: 'Mentat',
    icon: <Brain />,
    suggestedAssets: ["Sapho Juice", "Encrypted Data Slate", "Probability Matrix"]
  },
  {
    id: 'swordmaster',
    name: 'The Swordmaster',
    description: 'A warrior trained in the art of the blade and shield. You are a duelist and a bodyguard.',
    primarySkill: 'Battle',
    secondarySkill: 'Move',
    coreTrait: 'Ginaz Graduate',
    icon: <Sword />,
    suggestedAssets: ["Kindjal (Short Sword)", "Personal Shield", "Dueling Leathers"]
  },
  {
    id: 'doctor',
    name: 'The Suk Doctor',
    description: 'A supreme healer with Imperial Conditioning that prevents you from taking human life.',
    primarySkill: 'Understand',
    secondarySkill: 'Discipline',
    coreTrait: 'Suk Doctor',
    icon: <Heart />,
    suggestedAssets: ["Medical Kit", "Poison Snooper", "Laboratory Access"]
  },
  {
    id: 'commander',
    name: 'The Commander / Noble',
    description: 'A leader of men, skilled in diplomacy, command, and social intrigue.',
    primarySkill: 'Communicate',
    secondarySkill: 'Discipline',
    coreTrait: 'Noble Scion',
    icon: <Crown />,
    suggestedAssets: ["Signet Ring", "Dress Uniform", "Loyal Lieutenant"]
  },
  {
    id: 'smuggler',
    name: 'The Smuggler / Spy',
    description: 'A master of the underworld, skilled in obtaining illicit goods and moving unseen.',
    primarySkill: 'Move',
    secondarySkill: 'Communicate',
    coreTrait: 'Criminal Contact',
    icon: <Ghost />,
    suggestedAssets: ["Maula Pistol", "Hidden Compartment", "Blackmail Material"]
  },
  {
    id: 'fremen',
    name: 'The Scout / Desert Warrior',
    description: 'A master of survival and guerrilla warfare. You know the secrets of the desert.',
    primarySkill: 'Battle',
    secondarySkill: 'Move',
    coreTrait: 'Desert Survivalist',
    icon: <User />,
    suggestedAssets: ["Crysknife", "Stillsuit", "Maker Hooks"]
  }
];

const SKILL_DESCRIPTIONS: Record<string, string> = {
  Battle: "Physical conflict, strategy, tactics, and weapon proficiency.",
  Communicate: "Social interaction, persuasion, charm, deceit, and etiquette.",
  Discipline: "Willpower, focus, self-control, and resisting pain or fear.",
  Move: "Agility, athletics, stealth, and piloting vehicles.",
  Understand: "Intellect, knowledge, deductive reasoning, and technical skills."
};

const DRIVE_DESCRIPTIONS: Record<string, string> = {
  Duty: "Your sense of responsibility to your House, your superiors, and your obligations.",
  Faith: "Your reliance on religion, superstition, destiny, or the spirit of your people.",
  Justice: "Your drive to right wrongs, seek fairness, and punish the guilty.",
  Power: "Your desire for control, influence, authority, and dominance over others.",
  Truth: "Your dedication to facts, logic, unlocking secrets, and seeing reality clearly."
};

// --- Components ---

const HouseCard: React.FC<{ house: House; selected: boolean; onSelect: (h: House) => void }> = ({ house, selected, onSelect }) => (
  <div 
    onClick={() => onSelect(house)}
    className={`
      cursor-pointer transition-all duration-300 p-6 border-2 rounded-lg bg-opacity-80 bg-stone-900
      ${selected ? `${house.color} bg-stone-800 scale-105 shadow-xl shadow-amber-900/20` : 'border-stone-700 hover:border-stone-500'}
    `}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="text-4xl">{house.logo}</div>
      {selected && <div className="text-amber-500"><Shield size={24} fill="currentColor" /></div>}
    </div>
    <h3 className="text-xl font-serif font-bold text-amber-100 mb-1">{house.name}</h3>
    <div className="text-stone-400 text-sm mb-4 uppercase tracking-wider">{house.homeworld}</div>
    <p className="text-stone-300 text-sm mb-4 leading-relaxed">{house.description}</p>
  </div>
);

const ArchetypeCard: React.FC<{ archetype: Archetype; selected: boolean; onSelect: (a: Archetype) => void }> = ({ archetype, selected, onSelect }) => (
  <div 
    onClick={() => onSelect(archetype)}
    className={`
      cursor-pointer transition-all duration-300 p-6 border-2 rounded-lg bg-opacity-80 bg-stone-900 flex flex-col h-full
      ${selected ? `border-amber-500 bg-stone-800 scale-105 shadow-xl shadow-amber-900/20` : 'border-stone-700 hover:border-stone-500'}
    `}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-full ${selected ? 'bg-amber-900 text-amber-100' : 'bg-stone-800 text-stone-500'}`}>
        {archetype.icon}
      </div>
    </div>
    <h3 className="text-lg font-serif font-bold text-amber-100 mb-2">{archetype.name}</h3>
    <p className="text-stone-400 text-sm mb-4 flex-grow">{archetype.description}</p>
  </div>
);

const SkillDistributor: React.FC<{ 
  skills: Record<string, number>; 
  onChange: (skills: Record<string, number>) => void;
  pointsAvailable: number;
}> = ({ skills, onChange, pointsAvailable }) => {
  
  const handleIncrement = (skill: string) => {
    if (pointsAvailable > 0 && skills[skill] < 8) {
      onChange({ ...skills, [skill]: skills[skill] + 1 });
    }
  };

  const handleDecrement = (skill: string) => {
    if (skills[skill] > 4) {
       onChange({ ...skills, [skill]: skills[skill] - 1 });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
      <div className="bg-stone-900 p-4 rounded border border-amber-900 mb-4 text-center">
        <span className="text-stone-400 uppercase tracking-widest text-sm">Points Remaining</span>
        <div className="text-4xl font-mono text-amber-500 font-bold">{pointsAvailable}</div>
      </div>
      {Object.entries(skills).map(([skill, val]) => (
        <div key={skill} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-stone-800 p-4 rounded border border-stone-700 gap-4">
          <div className="flex-1">
            <div className="text-lg font-serif text-stone-200">{skill}</div>
            <div className="text-sm text-stone-500">{SKILL_DESCRIPTIONS[skill]}</div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button 
              onClick={() => handleDecrement(skill)}
              className="p-2 bg-stone-900 rounded hover:bg-stone-700 text-stone-400 disabled:opacity-50"
              disabled={val <= 4} 
            >
              <Minus size={20} />
            </button>
            
            <div className="w-12 text-center">
              <span className="text-2xl font-mono font-bold text-amber-100">{val}</span>
            </div>

            <button 
              onClick={() => handleIncrement(skill)}
              className="p-2 bg-stone-900 rounded hover:bg-amber-900 text-amber-500 disabled:opacity-50 disabled:text-stone-600"
              disabled={pointsAvailable === 0 || val >= 8}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const DriveRanker: React.FC<{
  drives: Record<string, number>;
  onChange: (drives: Record<string, number>) => void;
}> = ({ drives, onChange }) => {
  const [rankedDrives, setRankedDrives] = useState<string[]>(Object.keys(drives));
  const SCORES = [8, 7, 6, 5, 4];

  useEffect(() => {
    const newDrives: Record<string, number> = {};
    rankedDrives.forEach((drive, index) => {
      newDrives[drive] = SCORES[index];
    });
    onChange(newDrives);
  }, [rankedDrives]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...rankedDrives];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setRankedDrives(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === rankedDrives.length - 1) return;
    const newOrder = [...rankedDrives];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    setRankedDrives(newOrder);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {rankedDrives.map((drive, index) => (
        <div key={drive} className="flex flex-col sm:flex-row items-center bg-stone-800 p-3 rounded border border-stone-700 gap-4">
          <div className="flex flex-row sm:flex-col gap-1">
            <button 
              onClick={() => moveUp(index)} 
              disabled={index === 0}
              className="text-stone-500 hover:text-amber-400 disabled:opacity-20 p-1"
            >
              <ArrowUp size={20} />
            </button>
            <button 
              onClick={() => moveDown(index)}
              disabled={index === rankedDrives.length - 1}
              className="text-stone-500 hover:text-amber-400 disabled:opacity-20 p-1"
            >
              <ArrowDown size={20} />
            </button>
          </div>
          
          <div className="flex-grow text-center sm:text-left w-full">
            <div className="text-lg font-serif text-stone-200">{drive}</div>
            <div className="text-sm text-stone-500 mb-1">{DRIVE_DESCRIPTIONS[drive]}</div>
            <div className="text-xs text-amber-700 uppercase tracking-wider font-bold">
              {index === 0 ? "Primary Motivation" : index === 4 ? "Lowest Priority" : "Influence"}
            </div>
          </div>

          <div className="text-3xl font-mono font-bold text-amber-500 w-16 text-center bg-stone-900 p-2 rounded">
            {SCORES[index]}
          </div>
        </div>
      ))}
    </div>
  );
};

const AssetSelector: React.FC<{
  assets: string[];
  archetype: Archetype | null;
  onChange: (assets: string[]) => void;
}> = ({ assets, archetype, onChange }) => {
  
  const handleAssetChange = (index: number, value: string) => {
    const newAssets = [...assets];
    newAssets[index] = value;
    onChange(newAssets);
  };

  const addAsset = (value: string) => {
    // Find first empty slot
    const emptyIndex = assets.findIndex(a => a === "");
    if (emptyIndex !== -1) {
      handleAssetChange(emptyIndex, value);
    }
  };

  // Initialize 3 empty slots if not present
  useEffect(() => {
    if (assets.length !== 3) {
      onChange(["", "", ""]);
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="grid grid-cols-1 gap-4">
        {[0, 1, 2].map(index => (
          <div key={index} className="bg-stone-800 p-4 rounded border border-stone-700">
            <label className="text-xs uppercase text-stone-500 tracking-widest mb-2 block">Asset {index + 1} {index === 0 && "(Tangible Required)"}</label>
            <input 
              type="text" 
              value={assets[index] || ""}
              onChange={(e) => handleAssetChange(index, e.target.value)}
              className="w-full bg-stone-900 border border-stone-600 rounded p-3 text-amber-100 focus:border-amber-500 focus:outline-none"
              placeholder={index === 0 ? "e.g. Crysknife, Maula Pistol" : "e.g. Blackmail Material, Contact"}
            />
          </div>
        ))}
      </div>

      {archetype && (
        <div className="bg-stone-900 p-4 rounded border border-amber-900/30">
          <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Backpack size={16} /> Suggested Gear for {archetype.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {archetype.suggestedAssets.map(asset => (
              <button
                key={asset}
                onClick={() => addAsset(asset)}
                className="px-3 py-1 bg-stone-800 hover:bg-amber-900/50 border border-stone-600 hover:border-amber-500 rounded text-sm text-stone-300 transition-colors"
              >
                + {asset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AgentDetailsForm: React.FC<{
  name: string;
  minorHouse: string;
  portraitUrl: string | null;
  description: string;
  onNameChange: (n: string) => void;
  onMinorHouseChange: (h: string) => void;
  onDescriptionChange: (d: string) => void;
  onImageUpload: (file: File) => void;
}> = ({ name, minorHouse, portraitUrl, description, onNameChange, onMinorHouseChange, onDescriptionChange, onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Portrait Upload */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              w-48 h-48 rounded-full border-4 border-stone-700 flex items-center justify-center cursor-pointer overflow-hidden
              hover:border-amber-500 transition-colors bg-stone-800 group relative shadow-xl
            `}
          >
            {portraitUrl ? (
              <img src={portraitUrl} alt="Portrait" className="w-full h-full object-cover" />
            ) : (
              <div className="text-stone-500 flex flex-col items-center group-hover:text-amber-400">
                <ImageIcon size={48} />
                <span className="text-xs mt-2 uppercase tracking-widest">Upload Portrait</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="text-white" />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        {/* Fields */}
        <div className="w-full space-y-4">
          <div>
             <label className="block text-xs uppercase text-stone-500 tracking-widest mb-1">Agent Name</label>
             <input 
               type="text" 
               value={name}
               onChange={(e) => onNameChange(e.target.value)}
               className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-xl font-serif text-amber-100 focus:border-amber-500 focus:outline-none"
               placeholder="e.g. Paul Atreides"
             />
          </div>
          <div>
             <label className="block text-xs uppercase text-stone-500 tracking-widest mb-1">Minor House Name</label>
             <input 
               type="text" 
               value={minorHouse}
               onChange={(e) => onMinorHouseChange(e.target.value)}
               className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-lg text-stone-300 focus:border-amber-500 focus:outline-none"
               placeholder="e.g. House Fenring"
             />
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 tracking-widest mb-1">Biography / Description</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-300 focus:border-amber-500 focus:outline-none min-h-[100px]"
              placeholder="Describe your agent's appearance, history, or personality..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};


const CharacterSheetView = ({ sheet }: { sheet: CharacterSheet }) => (
  <div className="bg-stone-900 border-l-4 border-amber-700 p-4 h-full shadow-2xl w-full md:w-80 flex-shrink-0 overflow-y-auto">
    <h2 className="text-xl font-serif text-amber-500 mb-6 border-b border-stone-700 pb-2">Agent Record</h2>
    
    {sheet.portraitUrl && (
      <div className="mb-6 flex justify-center">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-amber-600">
          <img src={sheet.portraitUrl} alt={sheet.name} className="w-full h-full object-cover" />
        </div>
      </div>
    )}

    <div className="space-y-6">
      {/* Identity */}
      <div>
        <label className="text-xs uppercase text-stone-500 tracking-widest block mb-1">Identity</label>
        <div className="text-stone-100 font-bold text-lg">{sheet.name || "Unknown Agent"}</div>
        <div className="text-stone-400 text-sm">{sheet.minorHouseName || "Unknown House"}</div>
        {sheet.description && (
          <div className="text-xs text-stone-500 mt-2 italic line-clamp-3">{sheet.description}</div>
        )}
      </div>

      {/* Allegiance */}
      <div>
        <label className="text-xs uppercase text-stone-500 tracking-widest block mb-1">Allegiance</label>
        <div className="text-stone-200 font-bold flex items-center gap-2">
           {sheet.house ? <span className="text-xl">{sheet.house.logo}</span> : <Shield size={16} />}
           {sheet.house?.name || "Undecided"}
        </div>
      </div>

      {/* Archetype */}
      <div>
        <label className="text-xs uppercase text-stone-500 tracking-widest block mb-1">Archetype</label>
        <div className="text-stone-200 font-bold">{sheet.archetype?.name || "Undecided"}</div>
      </div>

      {/* Assets */}
      {sheet.assets.some(a => a) && (
        <div>
          <label className="text-xs uppercase text-stone-500 tracking-widest block mb-2 border-b border-stone-800 pb-1">Assets (Gear)</label>
          <ul className="space-y-1">
            {sheet.assets.map((asset, i) => asset && (
              <li key={i} className="text-sm text-amber-100 flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span> {asset}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      <div>
        <label className="text-xs uppercase text-stone-500 tracking-widest mb-2 block border-b border-stone-800 pb-1">Skills</label>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(sheet.skills).map(([skill, val]) => {
             const isPrimary = sheet.archetype?.primarySkill === skill;
             const isSecondary = sheet.archetype?.secondarySkill === skill;
             
             let color = "text-stone-400";
             if (isPrimary) color = "text-amber-400 font-bold";
             if (isSecondary) color = "text-amber-200 font-semibold";

             return (
              <div key={skill} className="flex justify-between items-center bg-stone-800 px-3 py-1.5 rounded border border-stone-700">
                <span className={`text-sm ${color}`}>{skill}</span>
                <span className="text-stone-100 font-mono bg-stone-950 px-2 py-0.5 rounded text-sm">{val}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drives */}
      <div>
        <label className="text-xs uppercase text-stone-500 tracking-widest mb-2 block border-b border-stone-800 pb-1">Drives</label>
        <div className="space-y-1">
          {Object.entries(sheet.drives)
            .sort(([,a], [,b]) => b - a)
            .map(([drive, val]) => (
            <div key={drive} className="flex justify-between bg-stone-800 px-3 py-1.5 rounded border border-stone-700">
              <span className="text-stone-400 text-sm">{drive}</span>
              <span className={`font-mono text-sm font-bold ${val >= 7 ? 'text-amber-400' : 'text-stone-500'}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Gallery: React.FC<{ agents: CharacterSheet[], onSelect: (id: string) => void, onCreateNew: () => void }> = ({ agents, onSelect, onCreateNew }) => (
  <div className="animate-fadeIn">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-serif text-stone-100">Agent Gallery</h2>
      <button onClick={onCreateNew} className="btn-primary flex items-center gap-2">
        <Plus size={20} /> Commission New Agent
      </button>
    </div>

    {agents.length === 0 ? (
      <div className="text-center py-20 bg-stone-900/50 rounded-lg border border-dashed border-stone-700">
        <Ghost size={48} className="mx-auto text-stone-600 mb-4" />
        <p className="text-stone-400">No agents commissioned yet.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div 
            key={agent.id}
            onClick={() => onSelect(agent.id)}
            className="bg-stone-900 border border-stone-700 rounded-lg p-4 hover:border-amber-500 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-stone-800 overflow-hidden border-2 border-stone-600 group-hover:border-amber-500 flex-shrink-0">
                {agent.portraitUrl ? (
                  <img src={agent.portraitUrl} alt={agent.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-3 text-stone-500" />
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-amber-100 truncate">{agent.name || "Unknown"}</h3>
                <p className="text-xs text-stone-400 truncate">{agent.minorHouseName}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-700 font-bold">
                   <span>{agent.house?.logo}</span>
                   <span className="truncate">{agent.house?.name}</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-stone-500 uppercase tracking-wider bg-stone-950 p-2 rounded text-center">
              {agent.archetype?.name}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AgentDetailModal: React.FC<{ agent: CharacterSheet, onClose: () => void }> = ({ agent, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
    <div className="bg-stone-900 w-full max-w-4xl h-[90vh] rounded-lg border border-amber-700 shadow-2xl flex overflow-hidden relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-amber-500">
        <X size={24} />
      </button>
      
      {/* Left Column - Visuals */}
      <div className="w-1/3 bg-stone-950 p-8 flex flex-col items-center text-center border-r border-stone-800">
        <div className="w-48 h-48 rounded-full border-4 border-amber-600 overflow-hidden mb-6 shadow-lg shadow-amber-900/20">
           {agent.portraitUrl ? (
             <img src={agent.portraitUrl} alt={agent.name} className="w-full h-full object-cover" />
           ) : (
             <User className="w-full h-full p-8 text-stone-700" />
           )}
        </div>
        <h2 className="text-2xl font-serif text-amber-100 mb-1">{agent.name}</h2>
        <p className="text-stone-400 mb-4">{agent.minorHouseName}</p>
        
        <div className="bg-stone-900 p-4 rounded w-full border border-stone-800 mb-6">
          <div className="text-xs text-stone-500 uppercase mb-1">Allegiance</div>
          <div className="flex items-center justify-center gap-2 font-bold text-stone-200">
            <span className="text-xl">{agent.house?.logo}</span>
            {agent.house?.name}
          </div>
        </div>

        {/* Biography in Sidebar for Modal */}
        <div className="w-full text-left">
           <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Biography</h3>
           <p className="text-sm text-stone-400 italic">{agent.description || "No records found."}</p>
        </div>
      </div>

      {/* Right Column - Stats */}
      <div className="w-2/3 p-8 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-amber-900/30 rounded text-amber-500">
            {agent.archetype?.icon}
          </div>
          <div>
            <div className="text-xs text-stone-500 uppercase">Archetype</div>
            <div className="text-xl font-serif text-stone-100">{agent.archetype?.name}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 border-b border-stone-800 pb-2">Skills</h3>
            <div className="space-y-2">
              {Object.entries(agent.skills).map(([skill, val]) => (
                <div key={skill} className="flex justify-between items-center">
                  <span className="text-stone-400">{skill}</span>
                  <span className="font-mono text-stone-100 bg-stone-800 px-2 py-1 rounded min-w-[2rem] text-center">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 border-b border-stone-800 pb-2">Drives</h3>
            <div className="space-y-2">
              {Object.entries(agent.drives).sort(([,a], [,b]) => b - a).map(([drive, val]) => (
                <div key={drive} className="flex justify-between items-center">
                  <span className="text-stone-400">{drive}</span>
                  <span className={`font-mono px-2 py-1 rounded min-w-[2rem] text-center ${val >= 7 ? 'text-amber-400 font-bold' : 'text-stone-500'}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 border-b border-stone-800 pb-2">Assets & Gear</h3>
           <div className="grid grid-cols-1 gap-2">
            {agent.assets.filter(a => a).length > 0 ? agent.assets.map((asset, i) => asset && (
              <div key={i} className="bg-stone-800 p-3 rounded flex items-center gap-3">
                 <Backpack size={16} className="text-stone-500" />
                 <span className="text-stone-200">{asset}</span>
              </div>
            )) : <span className="text-stone-600 italic">No assets recorded.</span>}
           </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main App ---

const App = () => {
  const [view, setView] = useState<'creator' | 'gallery'>('creator');
  const [stage, setStage] = useState<'house' | 'archetype' | 'skills' | 'drives' | 'assets' | 'details' | 'complete'>('house');
  
  // State for Saved Agents
  const [savedAgents, setSavedAgents] = useState<CharacterSheet[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const INITIAL_SHEET: CharacterSheet = {
    id: '',
    house: null,
    name: '',
    minorHouseName: '',
    portraitUrl: null,
    description: '',
    archetype: null,
    skills: { Battle: 4, Communicate: 4, Discipline: 4, Move: 4, Understand: 4 },
    drives: { Duty: 4, Faith: 4, Justice: 4, Power: 4, Truth: 4 },
    talents: [],
    assets: ["", "", ""]
  };

  const [sheet, setSheet] = useState<CharacterSheet>(INITIAL_SHEET);

  // Calculations
  const [pointsUsed, setPointsUsed] = useState(0);
  const MAX_POINTS = 5;

  useEffect(() => {
    if (sheet.archetype) {
      const currentTotal = Object.values(sheet.skills).reduce((a, b) => a + b, 0);
      const baseTotal = 23; // 5*4 base + 3 archetype bonus
      setPointsUsed(currentTotal - baseTotal);
    }
  }, [sheet.skills, sheet.archetype]);

  // Handlers
  const handleHouseSelect = (house: House) => setSheet(prev => ({ ...prev, house }));
  const handleArchetypeSelect = (archetype: Archetype) => {
    const newSkills = { Battle: 4, Communicate: 4, Discipline: 4, Move: 4, Understand: 4 };
    newSkills[archetype.primarySkill as keyof typeof newSkills] = 6;
    newSkills[archetype.secondarySkill as keyof typeof newSkills] = 5;
    setSheet(prev => ({ ...prev, archetype, skills: newSkills }));
  };
  const handleSkillsChange = (newSkills: Record<string, number>) => setSheet(prev => ({ ...prev, skills: newSkills }));
  const handleDrivesChange = (newDrives: Record<string, number>) => setSheet(prev => ({ ...prev, drives: newDrives }));
  const handleAssetsChange = (newAssets: string[]) => setSheet(prev => ({ ...prev, assets: newAssets }));
  
  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setSheet(prev => ({ ...prev, portraitUrl: url }));
  };

  // Navigation
  const nextStage = (next: typeof stage) => setStage(next);

  const saveAgent = () => {
    const newAgent = { ...sheet, id: Date.now().toString() };
    setSavedAgents(prev => [...prev, newAgent]);
    setStage('complete');
  };

  const resetCreator = () => {
    setSheet(INITIAL_SHEET);
    setStage('house');
    setView('creator');
  };

  const pointsRemaining = MAX_POINTS - pointsUsed;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const renderStageIndicator = (key: string, label: string) => {
    const stages = ['house', 'archetype', 'skills', 'drives', 'assets', 'details', 'complete'];
    const currentIndex = stages.indexOf(stage);
    const targetIndex = stages.indexOf(key);
    const isActive = stage === key;
    const isPast = currentIndex > targetIndex;
    
    return (
      <div className={`flex items-center gap-2 ${isActive ? 'text-amber-500 font-bold' : isPast ? 'text-amber-700' : 'text-stone-800'}`}>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-500' : isPast ? 'bg-amber-700' : 'bg-stone-800'}`}></div>
        <span className="hidden lg:block text-xs uppercase tracking-wider">{label}</span>
      </div>
    );
  };

  const selectedAgent = savedAgents.find(a => a.id === selectedAgentId);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-stone-950 text-stone-200 font-sans selection:bg-amber-900 selection:text-amber-100">
      
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        {/* Header */}
        <header className="p-6 border-b border-stone-800 z-10 bg-stone-950 bg-opacity-90 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-serif text-amber-500 tracking-wide">DUNE: ADVENTURES IN THE IMPERIUM</h1>
            <p className="text-stone-400 mt-1 flex items-center gap-2 text-sm">
              <Map size={16} /> Character Creation Protocol
            </p>
          </div>
          
          {view === 'creator' && (
            <div className="flex gap-4">
              {renderStageIndicator('house', 'House')}
              {renderStageIndicator('archetype', 'Role')}
              {renderStageIndicator('skills', 'Skills')}
              {renderStageIndicator('drives', 'Drives')}
              {renderStageIndicator('assets', 'Gear')}
              {renderStageIndicator('details', 'Details')}
            </div>
          )}

          <div>
             {view === 'creator' ? (
               <button onClick={() => setView('gallery')} className="flex items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors text-sm uppercase tracking-widest">
                 <Users size={18} /> Agent Gallery
               </button>
             ) : (
               <button onClick={() => setView('creator')} className="flex items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors text-sm uppercase tracking-widest">
                 <Plus size={18} /> Creator
               </button>
             )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 z-10">
          <div className="max-w-6xl mx-auto">
            
            {view === 'gallery' ? (
              <Gallery 
                agents={savedAgents} 
                onSelect={setSelectedAgentId} 
                onCreateNew={resetCreator} 
              />
            ) : (
              <>
                {stage === 'house' && (
                  <div className="animate-fadeIn space-y-6">
                    <div className="bg-stone-900 p-6 rounded-lg border border-amber-900/30">
                      <h2 className="text-2xl font-serif text-stone-100 mb-4">1. House Allegiance</h2>
                      <p className="text-stone-400">You serve a <strong>Minor House</strong>. Choose the <strong>Major House</strong> of the Landsraad to which you owe allegiance.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {MAJOR_HOUSES.map(house => (
                        <HouseCard key={house.id} house={house} selected={sheet.house?.id === house.id} onSelect={handleHouseSelect} />
                      ))}
                    </div>
                  </div>
                )}

                {stage === 'archetype' && (
                  <div className="animate-fadeIn space-y-6">
                    <div className="bg-stone-900 p-6 rounded-lg border border-amber-900/30">
                      <h2 className="text-2xl font-serif text-stone-100 mb-4">2. Choose Archetype</h2>
                      <p className="text-stone-400">Your role defines your training and primary capabilities.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {ARCHETYPES.map(archetype => (
                        <ArchetypeCard key={archetype.id} archetype={archetype} selected={sheet.archetype?.id === archetype.id} onSelect={handleArchetypeSelect} />
                      ))}
                    </div>
                  </div>
                )}

                {stage === 'skills' && (
                  <div className="animate-fadeIn space-y-6">
                    <div className="bg-stone-900 p-6 rounded-lg border border-amber-900/30">
                      <h2 className="text-2xl font-serif text-stone-100 mb-2">3. Distribute Skill Points</h2>
                      <p className="text-stone-400">You have <strong>5 points</strong> to add to your base skills. No skill may exceed 8.</p>
                    </div>
                    <SkillDistributor skills={sheet.skills} onChange={handleSkillsChange} pointsAvailable={pointsRemaining} />
                  </div>
                )}

                {stage === 'drives' && (
                  <div className="animate-fadeIn space-y-6">
                    <div className="bg-stone-900 p-6 rounded-lg border border-amber-900/30">
                      <h2 className="text-2xl font-serif text-stone-100 mb-2">4. Rank Your Drives</h2>
                      <p className="text-stone-400">Order your Drives from most important (8) to least important (4).</p>
                    </div>
                    <DriveRanker drives={sheet.drives} onChange={handleDrivesChange} />
                  </div>
                )}

                {stage === 'assets' && (
                  <div className="animate-fadeIn space-y-6">
                    <div className="bg-stone-900 p-6 rounded-lg border border-amber-900/30">
                      <h2 className="text-2xl font-serif text-stone-100 mb-2">5. Assets & Gear</h2>
                      <p className="text-stone-400">You begin with 3 Assets. One must be tangible (physical equipment). Others can be intangible (connections, secrets).</p>
                    </div>
                    <AssetSelector 
                      assets={sheet.assets} 
                      archetype={sheet.archetype} 
                      onChange={handleAssetsChange} 
                    />
                  </div>
                )}

                {stage === 'details' && (
                  <div className="animate-fadeIn space-y-6">
                    <div className="bg-stone-900 p-6 rounded-lg border border-amber-900/30">
                      <h2 className="text-2xl font-serif text-stone-100 mb-2">6. Personal Details</h2>
                      <p className="text-stone-400">Establish your identity within the records of the Imperium.</p>
                    </div>
                    <AgentDetailsForm 
                      name={sheet.name} 
                      minorHouse={sheet.minorHouseName}
                      portraitUrl={sheet.portraitUrl}
                      description={sheet.description}
                      onNameChange={(val) => setSheet(prev => ({ ...prev, name: val }))}
                      onMinorHouseChange={(val) => setSheet(prev => ({ ...prev, minorHouseName: val }))}
                      onDescriptionChange={(val) => setSheet(prev => ({ ...prev, description: val }))}
                      onImageUpload={handleImageUpload}
                    />
                  </div>
                )}

                {stage === 'complete' && (
                  <div className="animate-fadeIn flex flex-col items-center justify-center h-full space-y-8 pt-10">
                    <div className="bg-stone-900 p-8 rounded-lg border border-green-500/30 max-w-xl text-center shadow-2xl">
                      <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h2 className="text-3xl font-serif text-amber-100 mb-2">Agent Commissioned</h2>
                      <p className="text-stone-400 mb-6">
                        Your record has been sealed within the House archives.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <button onClick={() => setView('gallery')} className="btn-secondary">
                          View Gallery
                        </button>
                        <button onClick={resetCreator} className="btn-primary">
                          Create Another
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </main>

        {/* Footer */}
        {view === 'creator' && stage !== 'complete' && (
          <footer className="p-6 border-t border-stone-800 bg-stone-950 z-20 flex justify-between items-center">
            <div className="text-stone-500 text-sm flex items-center gap-2">
              <Info size={16} />
              <span>
                {stage === 'skills' ? "Points must be distributed." : 
                stage === 'drives' ? "Rankings reflect motivation." :
                "Proceed with caution."}
              </span>
            </div>
            
            {stage === 'house' && (
              <button onClick={() => nextStage('archetype')} disabled={!sheet.house} className="btn-primary">
                CONFIRM ALLEGIANCE <ChevronRight size={20} />
              </button>
            )}
            {stage === 'archetype' && (
              <button onClick={() => nextStage('skills')} disabled={!sheet.archetype} className="btn-primary">
                CONFIRM ARCHETYPE <ChevronRight size={20} />
              </button>
            )}
            {stage === 'skills' && (
              <button onClick={() => nextStage('drives')} disabled={pointsRemaining !== 0} className="btn-primary">
                CONFIRM SKILLS <ChevronRight size={20} />
              </button>
            )}
            {stage === 'drives' && (
              <button onClick={() => nextStage('assets')} className="btn-primary">
                CONFIRM DRIVES <ChevronRight size={20} />
              </button>
            )}
            {stage === 'assets' && (
              <button onClick={() => nextStage('details')} className="btn-primary">
                CONFIRM ASSETS <ChevronRight size={20} />
              </button>
            )}
            {stage === 'details' && (
              <button onClick={saveAgent} disabled={!sheet.name || !sheet.minorHouseName} className="btn-primary">
                COMMISSION AGENT <ChevronRight size={20} />
              </button>
            )}
          </footer>
        )}
      </div>

      {/* Sidebar (Only visible in creator mode) */}
      {view === 'creator' && <CharacterSheetView sheet={sheet} />}
      
      {/* Modal for Gallery Detail View */}
      {selectedAgent && (
        <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgentId(null)} />
      )}

      <style>{`
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          border-radius: 0.25rem;
          font-weight: bold;
          letter-spacing: 0.05em;
          transition: all 0.2s;
          background-color: #d97706;
          color: #1c1917;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #b45309;
          transform: scale(1.05);
          box-shadow: 0 4px 6px -1px rgba(180, 83, 9, 0.5);
        }
        .btn-primary:disabled {
          background-color: #292524;
          color: #57534e;
          cursor: not-allowed;
        }
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          border-radius: 0.25rem;
          font-weight: bold;
          letter-spacing: 0.05em;
          transition: all 0.2s;
          background-color: #292524;
          color: #d6d3d1;
          border: 1px solid #44403c;
        }
        .btn-secondary:hover {
          background-color: #44403c;
          color: #ffffff;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Safety check for root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Failed to find the root element");
} else {
  const root = createRoot(rootElement);
  root.render(<App />);
}