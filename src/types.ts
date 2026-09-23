export type RiskLevel = 'safe' | 'caution' | 'danger';

export type FindingCategory =
  | 'Hidden Fees'
  | 'Rugpull Risk'
  | 'Jurisdiction Issues'
  | 'Contract Vulnerability'
  | 'Privacy Violation'
  | 'Regulatory Compliance';

export interface Finding {
  id: string;
  category: FindingCategory;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Scan {
  id: string;
  target: string;
  type: 'url' | 'text';
  timestamp: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  findings: Finding[];
}
