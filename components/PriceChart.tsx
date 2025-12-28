
import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';
import { iPhoneListing } from '../types';

interface PriceChartProps {
  listings: iPhoneListing[];
  avgPrice: number;
  onPointClick?: (listing: iPhoneListing) => void;
}

const PriceChart: React.FC<PriceChartProps> = ({ listings, avgPrice, onPointClick }) => {
  if (listings.length === 0) return null;

  const data = listings.map(l => ({
    price: l.priceNum,
    profit: l.profitPotential,
    name: l.title.slice(0, 15),
    id: l.id,
    original: l
  }));

  const handlePointClick = (data: any) => {
    if (onPointClick && data && data.original) {
      onPointClick(data.original);
    }
  };

  return (
    <div className="bg-[#121214] rounded-xl border border-zinc-800 p-4 h-full min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Sniper Radar (Price vs Profit)</span>
      </div>
      
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
            <XAxis 
              type="number" 
              dataKey="price" 
              name="Price" 
              unit="€" 
              stroke="#52525b"
              fontSize={10}
              domain={['dataMin - 50', 'dataMax + 50']}
            />
            <YAxis 
              type="number" 
              dataKey="profit" 
              name="Profit" 
              unit="€" 
              stroke="#52525b"
              fontSize={10}
            />
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#000', border: '1px solid #27272a', borderRadius: '4px', fontSize: '10px' }}
            />
            <Scatter 
              name="Listings" 
              data={data} 
              onClick={handlePointClick}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.profit > 100 ? '#10b981' : entry.profit > 0 ? '#3b82f6' : '#ef4444'} 
                  className="animate-pulse hover:opacity-80 transition-opacity"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[8px] text-zinc-600 mt-2 text-center">Click a dot to open deep-dive analysis.</p>
    </div>
  );
};

export default PriceChart;
