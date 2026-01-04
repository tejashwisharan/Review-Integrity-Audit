
import React, { useState, useEffect } from 'react';
import { searchPlaces, analyzeBusiness } from './services/gemini';
import { SearchState, AnalysisResult, PlaceCandidate } from './types';
import { Gauge } from './components/Gauge';

const EXAMPLE_QUERIES = [
  "The Ritz London",
  "Sushi NYC",
  "Disneyland",
  "McDonalds Paris"
];

const LOADING_STEPS = [
  "Scanning web feedback...",
  "Analyzing review metadata...",
  "Verifying profile patterns...",
  "Calculating confidence..."
];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [state, setState] = useState<SearchState>({
    isSearching: false,
    isDiscovering: false,
    error: null,
    result: null,
    candidates: []
  });

  useEffect(() => {
    let interval: any;
    if (state.isSearching) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [state.isSearching]);

  const handleDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setState({ ...state, isDiscovering: true, error: null, result: null, candidates: [] });

    try {
      const candidates = await searchPlaces(query);
      setState({ ...state, isDiscovering: false, candidates });
      if (candidates.length === 0) {
        setState({ ...state, isDiscovering: false, error: "No places found. Try a different query." });
      }
    } catch (err: any) {
      setState({ ...state, isDiscovering: false, error: err.message });
    }
  };

  const handleAudit = async (place: PlaceCandidate) => {
    setState({ ...state, isSearching: true, error: null, result: null });

    try {
      const result = await analyzeBusiness(place);
      setState({ ...state, isSearching: false, result, candidates: [] });
    } catch (err: any) {
      setState({ 
        ...state, 
        isSearching: false, 
        error: "Failed to audit this place. Try another." 
      });
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-blue-100 bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <i className="fas fa-shield-halved text-lg"></i>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">TrustScan</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Review Integrity Audit
          </h2>
          <p className="text-slate-500 font-medium">
            Find any business to check if its Google reviews are real.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <form onSubmit={handleDiscovery} className="relative group">
            <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <i className="fas fa-search text-slate-400 ml-4"></i>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search business name and city..."
                className="flex-grow px-4 py-3 text-lg outline-none text-slate-800 rounded-xl"
              />
              <button
                type="submit"
                disabled={state.isDiscovering || state.isSearching || !query.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-sm"
              >
                {state.isDiscovering ? <i className="fas fa-spinner fa-spin"></i> : 'Search'}
              </button>
            </div>
          </form>

          {!state.isDiscovering && !state.isSearching && state.candidates.length === 0 && !state.result && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {EXAMPLE_QUERIES.map((example) => (
                <button
                  key={example}
                  onClick={() => { setQuery(example); handleDiscovery({ preventDefault: () => {} } as any); }}
                  className="text-xs font-semibold bg-white text-slate-500 px-3 py-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200 shadow-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>

        {state.error && (
          <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium flex items-center shadow-sm">
            <i className="fas fa-exclamation-circle mr-3"></i>
            {state.error}
          </div>
        )}

        {state.candidates.length > 0 && !state.isSearching && !state.result && (
          <div className="mt-10 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Select the exact place:</h3>
            {state.candidates.map((place) => (
              <div 
                key={place.id}
                onClick={() => handleAudit(place)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
              >
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition">{place.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{place.address}</p>
                </div>
                <div className="shrink-0 flex items-center text-blue-600 font-bold text-xs bg-blue-50 px-4 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                  Audit <i className="fas fa-chevron-right ml-2"></i>
                </div>
              </div>
            ))}
          </div>
        )}

        {state.isSearching && (
          <div className="mt-20 text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="mb-6">
              <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {LOADING_STEPS[loadingStep]}
            </h3>
          </div>
        )}

        {state.result && !state.isSearching && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-xl shadow-slate-200/50 text-center">
              <button 
                onClick={() => setState({...state, result: null, candidates: []})}
                className="mb-8 text-xs font-bold text-slate-400 hover:text-blue-600 transition"
              >
                <i className="fas fa-arrow-left mr-2"></i> Start new audit
              </button>

              <h3 className="text-2xl font-black text-slate-900 mb-2">{state.result.businessName}</h3>
              <p className="text-sm text-slate-500 mb-12 font-medium">{state.result.address}</p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 mb-12">
                <Gauge 
                  value={state.result.realPercentage} 
                  label="Real Reviews" 
                  color={state.result.realPercentage > 80 ? "#10b981" : state.result.realPercentage > 50 ? "#f59e0b" : "#ef4444"} 
                />
                
                <div className="hidden md:block w-px h-24 bg-slate-100"></div>

                <Gauge 
                  value={state.result.confidenceScore} 
                  label="AI Confidence" 
                  color="#3b82f6" 
                />
              </div>

              {/* Sentiment Breakdown Section */}
              <div className="mt-8 pt-10 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Review Sentiment Feedback</h4>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
                      <i className="fas fa-smile text-lg"></i>
                    </div>
                    <span className="text-lg font-black text-slate-900">{Math.round(state.result.sentimentBreakdown.positive)}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Positive</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-2">
                      <i className="fas fa-meh text-lg"></i>
                    </div>
                    <span className="text-lg font-black text-slate-900">{Math.round(state.result.sentimentBreakdown.neutral)}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Neutral</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-2">
                      <i className="fas fa-frown text-lg"></i>
                    </div>
                    <span className="text-lg font-black text-slate-900">{Math.round(state.result.sentimentBreakdown.negative)}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Negative</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 text-center">
                <p className="text-sm text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
                  The engine identifies that <span className="text-slate-900 font-bold">{Math.round(state.result.realPercentage)}%</span> of this business's feedback follows natural human patterns. The sentiment analysis highlights a predominantly <span className="text-slate-900 font-bold">{state.result.sentimentBreakdown.positive > 50 ? 'positive' : state.result.sentimentBreakdown.negative > 30 ? 'critical' : 'mixed'}</span> customer reception.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-32 py-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        Neural Review Audit Engine V3.1
      </footer>
    </div>
  );
};

export default App;
