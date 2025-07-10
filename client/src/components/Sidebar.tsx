import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, Crown, Gem, Coins, Circle, DotIcon, Flame } from "lucide-react";
import { Cryptocurrency } from "@shared/schema";
import TokenItem from "./TokenItem";

interface SidebarProps {
  cryptocurrencies: Cryptocurrency[];
  expandedTiers: Set<string>;
  onToggleTier: (tier: string) => void;
}

const tierConfig = {
  mega: {
    name: "Mega Cap",
    description: "$100B+ Market Cap",
    icon: Crown,
    gradient: "from-purple-600 to-purple-700",
    hoverGradient: "from-purple-700 to-purple-800",
  },
  large: {
    name: "Large Cap",
    description: "$10B-$100B",
    icon: Gem,
    gradient: "from-blue-600 to-blue-700",
    hoverGradient: "from-blue-700 to-blue-800",
  },
  largeMedium: {
    name: "Large Medium",
    description: "$5B-$10B",
    icon: Coins,
    gradient: "from-green-600 to-green-700",
    hoverGradient: "from-green-700 to-green-800",
  },
  smallMedium: {
    name: "Small Medium",
    description: "$1B-$5B",
    icon: Circle,
    gradient: "from-orange-600 to-orange-700",
    hoverGradient: "from-orange-700 to-orange-800",
  },
  small: {
    name: "Small Cap",
    description: "$100M-$1B",
    icon: DotIcon,
    gradient: "from-red-600 to-red-700",
    hoverGradient: "from-red-700 to-red-800",
  },
  micro: {
    name: "Micro/Shit Coins",
    description: "$10M-$100M",
    icon: Flame,
    gradient: "from-gray-600 to-gray-700",
    hoverGradient: "from-gray-700 to-gray-800",
  },
};

export default function Sidebar({ cryptocurrencies, expandedTiers, onToggleTier }: SidebarProps) {
  const groupedCryptos = cryptocurrencies.reduce((acc, crypto) => {
    if (!acc[crypto.tier]) {
      acc[crypto.tier] = [];
    }
    acc[crypto.tier].push(crypto);
    return acc;
  }, {} as Record<string, Cryptocurrency[]>);

  const getHoverClasses = (tier: string) => {
    const baseClasses = "w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r text-white transition-all duration-200 hover:scale-105 hover:shadow-lg";
    
    switch (tier) {
      case 'mega':
        return `${baseClasses} from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800`;
      case 'large':
        return `${baseClasses} from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800`;
      case 'largeMedium':
        return `${baseClasses} from-green-600 to-green-700 hover:from-green-700 hover:to-green-800`;
      case 'smallMedium':
        return `${baseClasses} from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800`;
      case 'small':
        return `${baseClasses} from-red-600 to-red-700 hover:from-red-700 hover:to-red-800`;
      case 'micro':
        return `${baseClasses} from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800`;
      default:
        return `${baseClasses} from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800`;
    }
  };

  const renderTierSection = (tier: string) => {
    const config = tierConfig[tier as keyof typeof tierConfig];
    if (!config) return null;

    const tokens = groupedCryptos[tier] || [];
    const isExpanded = expandedTiers.has(tier);
    const Icon = config.icon;

    return (
      <div key={tier} className="mb-4">
        <button
          onClick={() => onToggleTier(tier)}
          className={getHoverClasses(tier)}
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5 text-yellow-400" />
            <div className="text-left">
              <h3 className="font-semibold">{config.name}</h3>
              <p className="text-xs opacity-75">{config.description}</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform" />
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-2 space-y-2 pl-4">
            {tokens.map((token) => (
              <TokenItem key={token.id} token={token} />
            ))}
            {tokens.length === 0 && (
              <div className="p-3 bg-slate-800/50 rounded border border-slate-600 text-slate-400 text-sm">
                No tokens available
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-80 bg-slate-900/80 backdrop-blur-sm border-r border-slate-700 h-screen">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-white">Market Cap Tiers</h2>
          
          {Object.keys(tierConfig).map(renderTierSection)}
        </div>
      </ScrollArea>
    </aside>
  );
}
