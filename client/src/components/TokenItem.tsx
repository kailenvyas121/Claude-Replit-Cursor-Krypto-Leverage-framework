import { Badge } from "@/components/ui/badge";
import { Cryptocurrency } from "@shared/schema";
import { useState } from "react";
import TokenDetailModal from "./TokenDetailModal";

interface TokenItemProps {
  token: Cryptocurrency;
}

export default function TokenItem({ token }: TokenItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const price = parseFloat(token.currentPrice?.toString() || '0');
  const change = parseFloat(token.priceChangePercentage24h?.toString() || '0');
  const isPositive = change >= 0;

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(2)}`;
  };

  return (
    <>
      <div 
        className="p-3 bg-slate-800/50 rounded border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer hover:bg-slate-800/70"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {token.symbol.charAt(0)}
            </div>
            <div>
              <span className="font-medium text-white">{token.symbol}</span>
              <div className="text-xs text-slate-400 truncate max-w-20">
                {token.name}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-mono text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {formatPrice(price)}
            </div>
            <Badge 
              variant="secondary" 
              className={`text-xs ${isPositive ? 'bg-green-900/20 text-green-400 border-green-400/20' : 'bg-red-900/20 text-red-400 border-red-400/20'}`}
            >
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </div>
      
      <TokenDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={token}
      />
    </>
  );
}
