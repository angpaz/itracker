
export interface iPhoneListing {
  id: string;
  title: string;
  price: string;
  priceNum: number;
  location: string;
  url: string;
  timePosted: string;
  storageGb?: string;
  batteryHealth?: string;
  isVb?: boolean; 
  condition?: string;
  imageUrl?: string;
  dealScore?: 'Great' | 'Good' | 'Fair' | 'Poor';
  agentComment?: string;
  arbitragePotential?: string;
  // Professional Alpha Metrics
  riskScore: number; // 0-100 (100 is high risk)
  profitPotential: number; // Estimated EUR profit
  sellerInsights?: string; // Account age, response behavior mentioned in text
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
}

export interface MarketAnalysis {
  averagePrice: number;
  backMarketPrice: number;
  arbitrageSpread: number;
  listings: iPhoneListing[];
  sources: GroundingSource[];
  summary: string;
  agentRecommendation: string;
  marketTrend: 'rising' | 'falling' | 'stable';
}

export type iPhoneModel = 
  | 'iPhone 16 Pro Max'
  | 'iPhone 16 Pro'
  | 'iPhone 16'
  | 'iPhone 15 Pro Max'
  | 'iPhone 15 Pro'
  | 'iPhone 15'
  | 'iPhone 14'
  | 'iPhone 13';
