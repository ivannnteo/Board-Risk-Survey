export const COLORS = {
  ink: '#16213E',
  ledger: '#2C4A6E',
  brass: '#B8873B',
  paper: '#F4F5F7',
  line: '#DDE1E7',
  muted: '#6B7A8F',
  tint: '#EDF1F5',
  white: '#FFFFFF',
  disabled: '#C7CDD6',
};

// Solid, fully-saturated pastel palette used for admin dashboard charts, keyed by risk id.
export const PASTEL_RISK_COLORS: Record<string, string> = {
  cyber: '#4E8FE0',
  supply_chain: '#33B6A0',
  talent: '#8B6FD1',
  regulatory: '#E56A5D',
  economic: '#EFA043',
  financial: '#5E79D6',
  esg: '#4FAE5C',
  geopolitical: '#E0B23A',
  operational: '#C08653',
  ai_tech: '#5C87AD',
};

export const PASTEL_RATING_COLORS: Record<string, string> = {
  'Not Prepared': '#E56A5D',
  'Somewhat Prepared': '#EFA043',
  Prepared: '#4E8FE0',
  'Very Prepared': '#4FAE5C',
};

export const PASTEL_BAR_COLOR = '#8B6FD1';
