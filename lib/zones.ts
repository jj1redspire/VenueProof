export interface ZoneTemplate {
  name: string
  category: string
  checkpoints: string[]
  sort_order: number
}

export const CATERING_ZONES: ZoneTemplate[] = [
  {
    name: 'Delivery Path',
    category: 'catering_delivery',
    checkpoints: ['hallway floor', 'hallway walls', 'elevator floor', 'elevator walls', 'loading dock', 'door frames', 'threshold transitions'],
    sort_order: 1,
  },
  {
    name: 'Equipment Staging Area',
    category: 'catering_staging',
    checkpoints: ['floor condition', 'wall condition', 'existing scuffs or marks', 'electrical access', 'staging surface'],
    sort_order: 2,
  },
  {
    name: 'Food Service Area',
    category: 'catering_service',
    checkpoints: ['buffet table surface', 'chafing dish positioning', 'serving area floor', 'linen placement', 'lighting adequacy', 'guest access clearance'],
    sort_order: 3,
  },
  {
    name: 'Bar / Beverage Station',
    category: 'catering_bar',
    checkpoints: ['bar surface', 'glassware count', 'ice supply', 'bottle inventory', 'garnish prep', 'waste disposal', 'bar back area'],
    sort_order: 4,
  },
  {
    name: 'Kitchen / Prep Area',
    category: 'catering_kitchen',
    checkpoints: ['surface condition pre-use', 'equipment condition', 'floor condition', 'refrigeration temps', 'handwashing access', 'waste bins'],
    sort_order: 5,
  },
]

export function getZonesForBusinessType(businessType: string): ZoneTemplate[] {
  if (businessType === 'catering_company' || businessType === 'event_catering') {
    return CATERING_ZONES
  }
  return VENUE_ZONES
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
