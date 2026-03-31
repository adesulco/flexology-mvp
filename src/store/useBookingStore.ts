import { create } from 'zustand';

export type ServiceMode = 'outlet' | 'home' | 'venue';

export interface Location {
  id: string;
  name: string;
  address: string;
  distance: string;
  type: ServiceMode;
  mapLink?: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  description: string;
}

export interface Flexologist {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  specialty: string[];
  imageUrl: string;
}

interface BookingState {
  mode: ServiceMode | null;
  selectedLocation: Location | null;
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedFlexologist: Flexologist | null;
  homeAddress: string | null;
  homeMapLink: string | null;
  
  // Actions
  setMode: (mode: ServiceMode) => void;
  setLocation: (location: Location) => void;
  setService: (service: Service) => void;
  setDate: (date: Date) => void;
  setTime: (time: string) => void;
  setFlexologist: (flexologist: Flexologist) => void;
  setHomeAddress: (address: string, mapLink?: string) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  mode: null,
  selectedLocation: null,
  selectedService: null,
  selectedDate: null,
  selectedTime: null,
  selectedFlexologist: null,
  homeAddress: null,
  homeMapLink: null,

  setMode: (mode) => set({ mode, selectedLocation: null, selectedService: null, selectedDate: null, selectedTime: null, selectedFlexologist: null, homeAddress: null, homeMapLink: null }),
  setLocation: (location) => set({ selectedLocation: location }),
  setService: (service) => set({ selectedService: service }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (time) => set({ selectedTime: time }),
  setFlexologist: (flexologist) => set({ selectedFlexologist: flexologist }),
  setHomeAddress: (address, mapLink) => set({ homeAddress: address, homeMapLink: mapLink || null, selectedLocation: null }),
  resetBooking: () => set({
    mode: null,
    selectedLocation: null,
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    selectedFlexologist: null,
    homeAddress: null,
    homeMapLink: null,
  }),
}));
