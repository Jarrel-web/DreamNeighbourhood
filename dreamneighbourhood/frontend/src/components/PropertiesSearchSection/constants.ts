export const PAGE_SIZE = 10;

export const AMENITY_TYPES = [
  { id: 'supermarket', label: 'Supermarkets', icon: '🛒', description: 'Grocery Stores' },
  { id: 'school', label: 'Schools', icon: '🎓', description: 'Schools, Universities' },
  { id: 'MRT Station', label: 'MRT Station', icon: '🚆', description: 'MRT Stations' },
  { id: 'hospital', label: 'Healthcare', icon: '🏥', description: 'Clinics, Hospitals' },
  { id: 'hawker', label: 'Hawker Centres', icon: '🍜', description: 'Food Centers' },
  { id: 'sports', label: 'Sports & Recreation', icon: '⚽', description: 'Parks, Gyms, Pools' },
] as const;