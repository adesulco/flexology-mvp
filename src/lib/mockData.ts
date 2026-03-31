import { Location, Service, Flexologist } from "@/store/useBookingStore";

export const MOCK_LOCATIONS: Location[] = [
  {
    id: "loc-1",
    name: "Flexology at Pondok Indah",
    address: "Jl. Metro Pondok Indah, Jakarta Selatan",
    distance: "1.2 km",
    type: "outlet",
    mapLink: "https://maps.app.goo.gl/bvcdboxZ5uHNmS6r5"
  },
  {
    id: "loc-2",
    name: "Flexology at Dash Padel",
    address: "Dash Padel, Jakarta",
    distance: "4.5 km",
    type: "outlet",
    mapLink: "https://maps.app.goo.gl/wMms3pLjt3kMVirv7"
  }
];

export const MOCK_SERVICES: Service[] = [
  {
    id: "srv-1",
    name: "Assisted Stretching",
    duration: 30,
    price: 200000,
    description: "PNF-based assisted stretching for major muscle groups to improve flexibility and reduce stiffness."
  },
  {
    id: "srv-2",
    name: "Sports Massage",
    duration: 60,
    price: 350000,
    description: "Deep tissue and recovery-focused massage for athletes to release tension and lactic acid."
  },
  {
    id: "srv-3",
    name: "Padel Recovery Protocol",
    duration: 45,
    price: 275000,
    description: "Sport-specific stretching and mobility protocol focusing on shoulders, core, and knees."
  }
];

export const MOCK_FLEXOLOGISTS: Flexologist[] = [
  {
    id: "flex-1",
    name: "Bima R.",
    rating: 4.9,
    reviews: 142,
    specialty: ["Sports Massage", "Deep Tissue"],
    imageUrl: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
  },
  {
    id: "flex-2",
    name: "Nadia T.",
    rating: 4.8,
    reviews: 89,
    specialty: ["Mobility", "Padel Recovery"],
    imageUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  },
  {
    id: "flex-3",
    name: "Andi P.",
    rating: 5.0,
    reviews: 231,
    specialty: ["Assisted Stretching", "Injury Rehab"],
    imageUrl: "https://i.pravatar.cc/150?u=a04258a2462d826712d"
  }
];
