export interface ZoneTemplate {
  name: string
  category: string
  checkpoints: string[]
  sort_order: number
}

export const VENUE_ZONES: ZoneTemplate[] = [
  {
    name: 'Main Hall / Ballroom',
    category: 'primary',
    checkpoints: ['flooring', 'walls', 'stage', 'dance floor', 'lighting', 'AV equipment', 'ceiling'],
    sort_order: 1,
  },
  {
    name: 'Bar Area',
    category: 'service',
    checkpoints: ['bar top', 'stools', 'back bar', 'taps', 'glassware', 'refrigeration', 'flooring'],
    sort_order: 2,
  },
  {
    name: "Restrooms — Men's",
    category: 'restroom',
    checkpoints: ['fixtures', 'mirrors', 'dispensers', 'floor', 'walls', 'stalls', 'plumbing'],
    sort_order: 3,
  },
  {
    name: "Restrooms — Women's",
    category: 'restroom',
    checkpoints: ['fixtures', 'mirrors', 'dispensers', 'floor', 'walls', 'stalls', 'plumbing'],
    sort_order: 4,
  },
  {
    name: 'Kitchen / Catering Prep',
    category: 'kitchen',
    checkpoints: ['surfaces', 'equipment', 'floor', 'refrigeration', 'sinks', 'ventilation'],
    sort_order: 5,
  },
  {
    name: 'Patio / Outdoor Space',
    category: 'outdoor',
    checkpoints: ['furniture', 'fencing', 'lighting', 'surface', 'landscaping', 'heaters', 'umbrellas'],
    sort_order: 6,
  },
  {
    name: 'Parking Lot',
    category: 'exterior',
    checkpoints: ['surface', 'lighting', 'signage', 'ADA spaces', 'curbs', 'striping'],
    sort_order: 7,
  },
  {
    name: 'Entry / Lobby',
    category: 'entry',
    checkpoints: ['doors', 'windows', 'signage', 'coat check area', 'flooring', 'lighting', 'furniture'],
    sort_order: 8,
  },
  {
    name: 'Bridal Suite / Green Room',
    category: 'special',
    checkpoints: ['furniture', 'mirrors', 'fixtures', 'flooring', 'lighting', 'storage', 'vanity'],
    sort_order: 9,
  },
  {
    name: 'Audio/Visual Equipment',
    category: 'av',
    checkpoints: ['speakers', 'projector', 'screens', 'microphones', 'lighting rigs', 'cables', 'control board'],
    sort_order: 10,
  },
]
