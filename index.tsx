
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Shield, Map, ChevronRight, Info } from 'lucide-react';

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

type CharacterSheet = {
  house: House | null;
  name: string;
  archetype: string | null;
  skills: Record<string, number>;
  drives: Record<string, number>;
  talents: string[];
  assets: string[];
};

// --- Data (Based on Source Material) ---

const MAJOR_HOUSES: House[] = [
  {
    id: 'atreides',
    name: 'House Atreides',
    homeworld: 'Caladan',
    traits: ['Honorable', 'Popular'],
    domains: ['Farming (Pundi Rice)', 'Military (Tacticians)'],
    description: 'One of the most respected Houses. Known for their code of honor, loyalty, and their lush, water-rich homeworld. They prefer diplomacy and skilled warfare over treachery.',
    color: 'border-green-700',
    logo: '🦅'
  },
  {
    id: 'harkonnen',
    name: 'House Harkonnen',
    homeworld: 'Giedi Prime',
    traits: ['Brutal', 'Cunning'],
    domains: ['Industrial (Mining)', 'Spice Harvesting'],
    description: 'Masters of industrial brutality and manipulation. They rule through fear and maximize profit above all else. They currently hold the governorship of Arrakis.',
    color: 'border-orange-700',
    logo: '🐂'
  },
  {
    id: 'corrino',
    name: 'House Corrino',
    homeworld: 'Kaitain',
    traits: ['Imperial', 'Wealthy'],
    domains: ['Military (Sardaukar)', 'Politics'],
    description: 'The Imperial House that has ruled the Known Universe for millennia. They command the deadly Sardaukar terror troops and sit upon the Golden Lion Throne.',
    color: 'border-yellow-600',
    logo: '🦁'
  },
  {
    id: 'vernius',
    name: 'House Vernius (Ix)',
    homeworld: 'Ix',
    traits: ['Technological', 'Innovative'],
    domains: ['Technology (Machinery)', 'Shipbuilding'],
    description: 'Masters of machine culture. They push the boundaries of the Butlerian Jihad strictures, creating the most advanced technology in the Imperium.',
    color: 'border-purple-600',
    logo: '⚙️'
  },
  {
    id: 'richese',
    name: 'House Richese',
    homeworld: 'Richese',
    traits: ['Technological', 'Traditional'],
    domains: ['Technology (Miniaturization)', 'Manufacturing'],
    description: 'The rivals of Ix. They specialize in miniaturization and optical technology. They once held Arrakis but lost it due to economic maneuvering.',
    color: 'border-blue-600',
    logo: '💡'
  }
];

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
    
    <p className="text-stone-300 text-sm mb-4 leading-relaxed">
      {house.description}
    </p>

    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-amber-600 font-bold uppercase">Traits:</span>
        <span className="text-stone-300">{house.traits.join(', ')}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-amber-600 font-bold uppercase">Domains:</span>
        <span className="text-stone-300">{house.domains.join(', ')}</span>
      </div>
    </div>
  </div>
);

const CharacterSheetView = ({ sheet }: { sheet: CharacterSheet }) => (
  <div className="bg-stone-900 border-l-4 border-amber-700 p-4 h-full shadow-2xl w-full md:w-80 flex-shrink-0 overflow-y-auto">
    <h2 className="text-xl font-serif text-amber-500 mb-6 border-b border-stone-700 pb-2">Agent Record</h2>
    
    <div className="space-y-6">
      <div>
        <label className="text-xs uppercase text-stone-500 tracking-widest">Allegiance</label>
        <div className="text-stone-200 font-bold">{sheet.house?.name || "Undecided"}</div>
      </div>

      <div>
        <label className="text-xs uppercase text-stone-500 tracking-widest">Archetype</label>
        <div className="text-stone-200">{sheet.archetype || "Undecided"}</div>
      </div>

      <div>
        <label className="text-xs uppercase text-stone-500 tracking-widest mb-2 block">Skills</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(sheet.skills).map(([skill, val]) => (
            <div key={skill} className="flex justify-between bg-stone-800 px-2 py-1 rounded border border-stone-700">
              <span className="text-stone-400 text-xs">{skill}</span>
              <span className="text-amber-400 font-mono">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase text-stone-500 tracking-widest mb-2 block">Drives</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(sheet.drives).map(([drive, val]) => (
            <div key={drive} className="flex justify-between bg-stone-800 px-2 py-1 rounded border border-stone-700">
              <span className="text-stone-400 text-xs">{drive}</span>
              <span className="text-amber-400 font-mono">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [stage, setStage] = useState<'house' | 'archetype'>('house');
  const [sheet, setSheet] = useState<CharacterSheet>({
    house: null,
    name: '',
    archetype: null,
    skills: { Battle: 4, Communicate: 4, Discipline: 4, Move: 4, Understand: 4 },
    drives: { Duty: 4, Faith: 4, Justice: 4, Power: 4, Truth: 4 },
    talents: [],
    assets: []
  });

  const handleHouseSelect = (house: House) => {
    setSheet(prev => ({ ...prev, house }));
  };

  const confirmHouse = () => {
    if (sheet.house) {
      alert(`You have pledged allegiance to ${sheet.house.name}. In a real session, we would now proceed to Archetype selection based on the Core Rulebook.`);
    }
  };

  // Basic mount animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-stone-950 text-stone-200 font-sans selection:bg-amber-900 selection:text-amber-100">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }}
        />

        {/* Header */}
        <header className="p-6 border-b border-stone-800 z-10 bg-stone-950 bg-opacity-90">
          <h1 className="text-3xl font-serif text-amber-500 tracking-wide">DUNE: ADVENTURES IN THE IMPERIUM</h1>
          <p className="text-stone-400 mt-1 flex items-center gap-2">
            <Map size={16} /> Character Creation Protocol
          </p>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 z-10">
          <div className="max-w-4xl mx-auto">
            
            {stage === 'house' && (
              <div className="animate-fadeIn">
                <div className="bg-stone-900 p-6 rounded-lg border border-amber-900/30 mb-8">
                  <h2 className="text-2xl font-serif text-stone-100 mb-4 flex items-center gap-3">
                    <span className="bg-amber-700 text-stone-950 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">1</span>
                    House Allegiance
                  </h2>
                  <p className="text-stone-300 mb-4 text-lg">
                    "A beginning is the time for taking the most delicate care that the balances are correct."
                  </p>
                  <p className="text-stone-400">
                    You have chosen to serve a <strong>Minor House</strong>. This House owes allegiance to a <strong>Major House</strong> of the Landsraad. 
                    This choice determines your starting allies, your potential enemies, and the flavor of your adventures.
                    <br/><br/>
                    <span className="text-amber-500 font-bold">Select your Major House patron below:</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                  {MAJOR_HOUSES.map(house => (
                    <HouseCard 
                      key={house.id} 
                      house={house} 
                      selected={sheet.house?.id === house.id}
                      onSelect={handleHouseSelect}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Footer Actions */}
        <footer className="p-6 border-t border-stone-800 bg-stone-950 z-20 flex justify-between items-center">
          <div className="text-stone-500 text-sm flex items-center gap-2">
            <Info size={16} />
            <span>Selecting a patron grants +1 Reputation within their sphere of influence.</span>
          </div>
          <button 
            onClick={confirmHouse}
            disabled={!sheet.house}
            className={`
              flex items-center gap-2 px-8 py-3 rounded font-bold tracking-wider transition-all
              ${sheet.house 
                ? 'bg-amber-600 text-stone-900 hover:bg-amber-500 hover:scale-105 shadow-lg shadow-amber-900/50' 
                : 'bg-stone-800 text-stone-600 cursor-not-allowed'}
            `}
          >
            CONFIRM ALLEGIANCE <ChevronRight size={20} />
          </button>
        </footer>
      </div>

      {/* Sidebar Character Sheet */}
      <CharacterSheetView sheet={sheet} />

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
