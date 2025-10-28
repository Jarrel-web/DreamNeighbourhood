// contexts/SearchContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Property } from '../types/property';

// Define the amenity types
export type AmenityType = 'supermarket' | 'school' | 'MRT Station' | 'hospital' | 'hawker' | 'sports';

export type RankedAmenity = { 
  type: AmenityType; 
  rank: number; 
  maxDistance: number; 
};

export interface SearchState {
  properties: Property[];
  initialProperties: Property[];
  currentBackendResults: Property[];
  searchText: string;
  selectedTown: string;
  maxPrice: number | null;
  minRooms: number | null;
  minArea: number | null;
  rankedAmenities: RankedAmenity[];
  availableAmenities: AmenityType[];
  page: number;
  totalResults: number;
  totalPages: number;
  hasSearched: boolean; // Add this to track if we've performed a search
}

interface SearchContextType {
  searchState: SearchState;
  setSearchState: (state: Partial<SearchState>) => void;
  clearSearchState: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Default initial state
const defaultSearchState: SearchState = {
  properties: [],
  initialProperties: [],
  currentBackendResults: [],
  searchText: "",
  selectedTown: "",
  maxPrice: null,
  minRooms: null,
  minArea: null,
  rankedAmenities: [],
  availableAmenities: ['supermarket', 'school', 'MRT Station', 'hospital', 'hawker', 'sports'],
  page: 1,
  totalResults: 0,
  totalPages: 1,
  hasSearched: false, // Initialize as false
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchState>(defaultSearchState);

  const updateSearchState = (newState: Partial<SearchState>) => {
    setSearchState(prev => ({ ...prev, ...newState }));
  };

  const clearSearchState = () => {
    setSearchState(defaultSearchState);
  };

  return (
    <SearchContext.Provider value={{ 
      searchState, 
      setSearchState: updateSearchState,
      clearSearchState 
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};