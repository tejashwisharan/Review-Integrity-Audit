
export interface PlaceCandidate {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  description: string;
}

export interface AnalysisResult {
  businessName: string;
  address: string;
  realPercentage: number;
  confidenceScore: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface SearchState {
  isSearching: boolean;
  error: string | null;
  result: AnalysisResult | null;
  candidates: PlaceCandidate[];
  isDiscovering: boolean;
}
