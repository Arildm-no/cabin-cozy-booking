import { createContext, useContext, useState, ReactNode } from 'react';

type Location = 'Blefjell' | 'Gårdbo';

interface LocationContextType {
  selectedLocation: Location;
  setSelectedLocation: (location: Location) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [selectedLocation, setSelectedLocation] = useState<Location>('Blefjell');

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  );
};