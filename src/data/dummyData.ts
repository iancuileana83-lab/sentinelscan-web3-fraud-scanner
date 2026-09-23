import type { Scan } from '@/types';

export const dummyScans: Scan[] = [
  {
    id: 'scan-001',
    target: 'https://mysterychain.io',
    type: 'url',
    timestamp: '2026-09-04T14:22:00Z',
    riskScore: 87,
    riskLevel: 'danger',
    summary:
      'Multiple critical red flags detected. Contract lacks audit verification and ToS grants unrestricted fund access to the team.',
    findings: [
      {
        id: 'f1',
        category: 'Rugpull Risk',
        title: 'Unrestricted Mint Authority',
        description:
          'Contract owner retains mint authority with no cap or timelock, allowing infinite token dilution at any time.',
        severity: 'critical',
      },
      {
        id: 'f2',
        category: 'Hidden Fees',
        title: 'Dynamic Transfer Fee Up to 12%',
        description:
          'Transfer fee is configurable by the owner up to 12% with no on-chain transparency for end users.',
        severity: 'high',
      },
      {
        id: 'f3',
        category: 'Jurisdiction Issues',
        title: 'Cayman Islands Shell Entity',
        description:
          'Operating entity is registered in a non-extradition jurisdiction. Users have no legal recourse for lost funds.',
        severity: 'high',
      },
      {
        id: 'f4',
        category: 'Contract Vulnerability',
        title: 'Unverified Proxy Implementation',
        description:
          'Proxy admin key is held by an EOA with no multisig. Implementation can be upgraded to rug the contract silently.',
        severity: 'critical',
      },
      {
        id: 'f5',
        category: 'Privacy Violation',
        title: 'Wallet Address Harvesting',
        description:
          'ToS grants the project rights to collect, store, and sell user wallet addresses and transaction histories to third parties.',
        severity: 'medium',
      },
    ],
  },
  {
    id: 'scan-002',
    target: 'https://safeharbor.finance',
    type: 'url',
    timestamp: '2026-09-04T11:05:00Z',
    riskScore: 24,
    riskLevel: 'safe',
    summary:
      'Low risk profile. Contract is audited by a reputable firm and ToS is transparent with user-friendly terms.',
    findings: [
      {
        id: 'f6',
        category: 'Regulatory Compliance',
        title: 'KYC/AML Procedures Documented',
        description:
          'Project maintains clear KYC/AML procedures aligned with FATF guidelines for virtual asset service providers.',
        severity: 'low',
      },
      {
        id: 'f7',
        category: 'Contract Vulnerability',
        title: 'Minor: No Timelock on Governance',
        description:
          'Governance proposals execute immediately without a timelock, allowing rapid protocol changes without user warning.',
        severity: 'low',
      },
    ],
  },
  {
    id: 'scan-003',
    target: 'https://yieldgarden.app',
    type: 'url',
    timestamp: '2026-09-03T18:47:00Z',
    riskScore: 62,
    riskLevel: 'caution',
    summary:
      'Moderate risk. Promising architecture but ToS contains ambiguous liability waivers and the contract has a pausable upgrade path.',
    findings: [
      {
        id: 'f8',
        category: 'Hidden Fees',
        title: 'Performance Fee Structure Unclear',
        description:
          'ToS references a "performance fee" without defining the calculation method, cap, or frequency of deduction.',
        severity: 'medium',
      },
      {
        id: 'f9',
        category: 'Contract Vulnerability',
        title: 'Pausable Without User Consent',
        description:
          'Contract includes a pausable modifier that can freeze all deposits and withdrawals indefinitely by the owner.',
        severity: 'medium',
      },
      {
        id: 'f10',
        category: 'Jurisdiction Issues',
        title: 'Ambiguous Governing Law Clause',
        description:
          'ToS does not specify a governing jurisdiction, creating legal uncertainty for dispute resolution.',
        severity: 'medium',
      },
      {
        id: 'f11',
        category: 'Privacy Violation',
        title: 'Broad Data Sharing Consent',
        description:
          'Users grant consent to share data with "affiliates and partners" without an enumeration of who those parties are.',
        severity: 'low',
      },
    ],
  },
  {
    id: 'scan-004',
    target: 'https://darkpool.exchange',
    type: 'url',
    timestamp: '2026-09-03T09:15:00Z',
    riskScore: 91,
    riskLevel: 'danger',
    summary:
      'Critical risk. Anonymous team, unaudited contract, and ToS explicitly disclaims all liability for fund loss.',
    findings: [
      {
        id: 'f12',
        category: 'Rugpull Risk',
        title: 'Anonymous Team with No Doxxing',
        description:
          'No team member is publicly identified. All social profiles are pseudonymous with no verifiable track record.',
        severity: 'critical',
      },
      {
        id: 'f13',
        category: 'Contract Vulnerability',
        title: 'No External Audit Conducted',
        description:
          'Smart contract has not been audited by any recognized security firm. Source code is unverified on block explorer.',
        severity: 'critical',
      },
      {
        id: 'f14',
        category: 'Jurisdiction Issues',
        title: 'Total Liability Disclaimer',
        description:
          'ToS explicitly states the project bears zero liability for any losses, including those caused by negligence or fraud.',
        severity: 'high',
      },
      {
        id: 'f15',
        category: 'Regulatory Compliance',
        title: 'No Securities Law Disclaimer',
        description:
          'Token is marketed as a yield-bearing asset with no acknowledgment of or compliance with securities regulations.',
        severity: 'high',
      },
    ],
  },
  {
    id: 'scan-005',
    target: 'https://nexuspay.xyz',
    type: 'url',
    timestamp: '2026-09-02T22:30:00Z',
    riskScore: 45,
    riskLevel: 'caution',
    summary:
      'Moderate risk. Functional product but several legal ambiguities in the ToS around fund custody and withdrawal limits.',
    findings: [
      {
        id: 'f16',
        category: 'Hidden Fees',
        title: 'Withdrawal Limits Not Disclosed',
        description:
          'ToS mentions "tier-based withdrawal limits" but does not publish the tiers, thresholds, or associated fees anywhere.',
        severity: 'medium',
      },
      {
        id: 'f17',
        category: 'Privacy Violation',
        title: 'Indefinite Data Retention',
        description:
          'User data is retained indefinitely with no deletion mechanism, violating GDPR right-to-erasure principles.',
        severity: 'medium',
      },
      {
        id: 'f18',
        category: 'Contract Vulnerability',
        title: 'Centralized Price Oracle',
        description:
          'Contract relies on a single admin-updatable price feed with no fallback oracle, enabling price manipulation.',
        severity: 'high',
      },
    ],
  },
];
