import type { ComponentType, CSSProperties } from 'react';
import {
  Shield, Truck, Users, Scale, TrendingUp, Wallet, Leaf, Globe, AlertTriangle, Cpu,
} from 'lucide-react';

export type RiskIcon = ComponentType<{ className?: string; style?: CSSProperties }>;

export type Risk = {
  id: string;
  label: string;
  short: string;
  color: string;
  icon: RiskIcon;
  actions: string[]; // exactly 6
};

export const RISKS: Risk[] = [
  {
    id: 'cyber', label: 'Cybersecurity & Data Privacy', short: 'Cybersecurity', color: '#24476B', icon: Shield,
    actions: [
      'Conducted Vulnerability Assessment and Penetration Testing (VAPT) within the last 12 months',
      'Established and tested an Incident Response Plan',
      'Board receives regular cybersecurity risk reporting',
      'Conducted cyber crisis simulation / tabletop exercise',
      'Assessed cybersecurity risks of critical third-party vendors',
      'Implemented data protection and privacy compliance programme',
    ],
  },
  {
    id: 'supply_chain', label: 'Supply Chain Disruption', short: 'Supply Chain', color: '#2E7873', icon: Truck,
    actions: [
      'Identified and risk-ranked critical suppliers',
      'Established alternative suppliers for key products/services',
      'Conducted supplier risk assessments',
      'Implemented inventory buffering for critical materials',
      'Developed and tested supply chain contingency plans',
      'Board receives regular supply chain risk updates',
    ],
  },
  {
    id: 'talent', label: 'Talent Attraction & Retention', short: 'Talent', color: '#6B4E8E', icon: Users,
    actions: [
      'Workforce and succession plans are in place',
      'Key positions have identified successors',
      'Employee engagement surveys are conducted regularly',
      'Retention strategies for critical talent have been implemented',
      'Training and leadership development programmes established',
      'Board receives updates on workforce and talent risks',
    ],
  },
  {
    id: 'regulatory', label: 'Regulatory & Compliance Changes', short: 'Regulatory', color: '#A8442E', icon: Scale,
    actions: [
      'Compliance obligations have been formally identified',
      'Regulatory changes are monitored regularly',
      'Compliance assessments/reviews are conducted periodically',
      'Compliance KPIs/KRIs are reported to management or the board',
      'Independent compliance audits/reviews have been performed',
      'A compliance officer or function has been established',
    ],
  },
  {
    id: 'economic', label: 'Economic / Market Uncertainty', short: 'Economic', color: '#C1752E', icon: TrendingUp,
    actions: [
      'Scenario planning and stress testing performed',
      'Business plans are reviewed against changing market conditions',
      'Cost optimisation initiatives have been implemented',
      'Revenue diversification strategies have been developed',
      'Key market indicators are monitored regularly',
      'Board reviews strategic risks and market outlook periodically',
    ],
  },
  {
    id: 'financial', label: 'Financial & Liquidity Risk', short: 'Financial', color: '#2F5D7A', icon: Wallet,
    actions: [
      'Cash flow forecasts are prepared and monitored regularly',
      'Liquidity stress testing has been conducted',
      'Contingency funding arrangements are available',
      'Foreign currency exposures are monitored and managed',
      'Treasury policies and limits have been established',
      'Board receives regular treasury and liquidity risk reporting',
    ],
  },
  {
    id: 'esg', label: 'ESG & Sustainability', short: 'ESG', color: '#3F7A4A', icon: Leaf,
    actions: [
      'Material ESG risks and opportunities have been assessed',
      'Sustainability targets and KPIs have been established',
      'ESG metrics are monitored and reported regularly',
      'Climate-related risks have been evaluated',
      'ESG governance and oversight structures are in place',
      'Sustainability information is independently reviewed or assured',
    ],
  },
  {
    id: 'geopolitical', label: 'Geopolitical Risk', short: 'Geopolitical', color: '#B8873B', icon: Globe,
    actions: [
      'Geopolitical developments are monitored regularly',
      'Geographic concentration risks have been assessed',
      'Alternative sourcing or operating arrangements have been identified',
      'Scenario planning has been conducted for geopolitical events',
      'Business continuity plans incorporate geopolitical disruptions',
      'Board reviews geopolitical developments and impacts periodically',
    ],
  },
  {
    id: 'operational', label: 'Operational Disruption', short: 'Operational', color: '#8C5A42', icon: AlertTriangle,
    actions: [
      'Critical business processes have been identified',
      'Business Continuity Plan (BCP) has been established',
      'Disaster Recovery Plan (DRP) has been developed and tested',
      'Operational risk assessments are conducted regularly',
      'Crisis management procedures have been established',
      'Operational disruption exercises/simulations have been performed',
    ],
  },
  {
    id: 'ai_tech', label: 'AI & Emerging Technology', short: 'AI & Tech', color: '#55708C', icon: Cpu,
    actions: [
      'AI governance framework has been established',
      'Policies governing AI use have been implemented',
      'AI-related risks and controls have been assessed',
      'AI systems are subject to human oversight and review',
      'Staff have received AI-related training and awareness',
      'Board receives updates on AI opportunities and risks',
    ],
  },
];

export const RISK_IDS = RISKS.map((r) => r.id);

export type Barrier = { id: string; label: string };

export const BARRIERS: Barrier[] = [
  { id: 'competing_priorities', label: 'Competing business priorities' },
  { id: 'limited_budget', label: 'Limited budget/resources' },
  { id: 'lack_expertise', label: 'Lack of expertise' },
  { id: 'lack_data_visibility', label: 'Lack of data or visibility over risks' },
  { id: 'insufficient_management_attention', label: 'Insufficient management attention' },
  { id: 'insufficient_board_oversight', label: 'Insufficient board oversight/challenge' },
  { id: 'difficulty_keeping_pace', label: 'Difficulty keeping pace with evolving risks' },
  { id: 'controls_sufficient', label: 'We believe our current controls are sufficient' },
  { id: 'others', label: 'Others' },
];

export const BARRIER_IDS = BARRIERS.map((b) => b.id);

export type Rating = 'Not Prepared' | 'Somewhat Prepared' | 'Prepared' | 'Very Prepared';

export const RATINGS: Rating[] = ['Not Prepared', 'Somewhat Prepared', 'Prepared', 'Very Prepared'];

export const RATING_COLORS: Record<Rating, string> = {
  'Not Prepared': '#B3452C',
  'Somewhat Prepared': '#B8873B',
  Prepared: '#2C6E8E',
  'Very Prepared': '#3F7A52',
};

const ACTIONS_PER_RISK = 6;

/**
 * % of applicable actions implemented -> Rating, per the brief's table:
 * 0-25 Not Prepared, 26-50 Somewhat Prepared, 51-75 Prepared, 76-100 Very Prepared.
 * Bucketing is done on the raw fraction (not the rounded %) so e.g. 2/6 = 33.3%
 * lands unambiguously in "26-50" regardless of rounding.
 */
export function getPreparednessInfo(selected: number[] | undefined | null): {
  pct: number;
  rating: Rating;
  count: number;
} {
  const count = selected?.length ?? 0;
  const fraction = count / ACTIONS_PER_RISK;
  const pct = Math.round(fraction * 100);
  let rating: Rating = 'Not Prepared';
  if (fraction > 0.75) rating = 'Very Prepared';
  else if (fraction > 0.5) rating = 'Prepared';
  else if (fraction > 0.25) rating = 'Somewhat Prepared';
  return { pct, rating, count };
}
