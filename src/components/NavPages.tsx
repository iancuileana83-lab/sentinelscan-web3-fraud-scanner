import { useState } from 'react';
import {
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  Building2,
  Code2,
  HelpCircle,
  Search,
  ArrowRight,
  Check,
} from 'lucide-react';

interface PlaceholderPageProps {
  section: string;
  icon: typeof Wallet;
  title: string;
  description: string;
  features: string[];
  ctaLabel: string;
}

function PlaceholderPage({
  icon: Icon,
  title,
  description,
  features,
  ctaLabel,
}: PlaceholderPageProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-emerald-400">
          <Icon size={22} />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
      </div>
      <p className="text-sm text-slate-400 mb-8 max-w-xl">{description}</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-3 p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl"
          >
            <Check size={18} className="flex-shrink-0 text-emerald-400 mt-0.5" />
            <p className="text-sm text-slate-300">{feature}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 p-5 bg-slate-800/30 border border-slate-700/40 rounded-xl">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-200 mb-1">
            {ctaLabel}
          </p>
          <p className="text-xs text-slate-500">
            This module is under active development.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition-all active:scale-95">
          Get Notified
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function SecurityReports() {
  return (
    <PlaceholderPage
      section="reports"
      icon={ShieldCheck}
      title="Security Reports"
      description="Generate detailed, exportable compliance and audit reports from your scans for due diligence, regulatory filings, or internal risk reviews."
      features={[
        'PDF and CSV export of scan results',
        'Customizable report templates',
        'Historical risk trend analysis',
        'Regulatory compliance mapping',
      ]}
      ctaLabel="Automated reporting tools are on the way."
    />
  );
}

export function ForBusinesses() {
  return (
    <PlaceholderPage
      section="businesses"
      icon={Building2}
      title="For Businesses"
      description="Integrate SentinelScan's fraud detection engine into your exchange, wallet, or DeFi platform via enterprise APIs with custom risk thresholds."
      features={[
        'High-volume batch scanning API',
        'Custom risk threshold configuration',
        'Dedicated infrastructure and SLAs',
        'Webhook alerts for real-time monitoring',
      ]}
      ctaLabel="Contact us to discuss enterprise pricing and onboarding."
    />
  );
}

export function ApiPage() {
  const [copied, setCopied] = useState(false);

  const sampleCode = `curl -X POST \\
  https://web3-fraud-shield-30747896454.europe-west4.run.app/api/scan \\
  -H "Content-Type: application/json" \\
  -d '{"text_content": "https://example.io"}'`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-emerald-400">
          <Code2 size={22} />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">API</h2>
      </div>
      <p className="text-sm text-slate-400 mb-8 max-w-xl">
        Int SentinelScan's risk analysis directly into your application with a
        simple REST API. Send text content, receive a structured risk assessment.
      </p>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Endpoint</h3>
        <div className="flex items-center gap-2 p-3 bg-slate-800/40 border border-slate-700/40 rounded-lg">
          <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-500/15 text-emerald-400 font-semibold">
            POST
          </span>
          <code className="text-sm text-slate-300 font-mono">
            /api/scan
          </code>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Sample Request</h3>
        <div className="relative">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(sampleCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-700/60 hover:bg-slate-700 rounded-lg transition-all"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : null}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <pre className="p-4 pr-24 bg-slate-900 border border-slate-700/40 rounded-xl overflow-x-auto text-sm text-slate-300 font-mono leading-relaxed">
            {sampleCode}
          </pre>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Response Format</h3>
        <pre className="p-4 bg-slate-900 border border-slate-700/40 rounded-xl overflow-x-auto text-sm text-slate-300 font-mono leading-relaxed">
{`{
  "score": 87,
  "level": "danger",
  "summary": "Multiple critical red flags detected...",
  "findings": [
    {
      "category": "Rugpull Risk",
      "title": "Unrestricted Mint Authority",
      "description": "Contract owner retains mint authority...",
      "severity": "critical"
    }
  ]
}`}
        </pre>
      </div>

      <div className="flex items-center gap-3 p-5 bg-slate-800/30 border border-slate-700/40 rounded-xl">
        <Search size={20} className="flex-shrink-0 text-emerald-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-200">
            Need an API key or higher rate limits?
          </p>
          <p className="text-xs text-slate-500">
            Enterprise plans include dedicated keys and custom thresholds.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Submit a Target',
      description:
        'Paste a Web3 project URL or raw Terms of Service text into the scan input field on the Dashboard.',
    },
    {
      num: '02',
      title: 'AI Analysis Engine',
      description:
        'SentinelScan analyzes the input across 6 risk categories: hidden fees, rugpull risk, jurisdiction issues, contract vulnerabilities, privacy violations, and regulatory compliance.',
    },
    {
      num: '03',
      title: 'Risk Score & Findings',
      description:
        'Receive a 0-100 risk score with a dynamic color-coded gauge and a detailed breakdown of every red flag found, categorized by severity.',
    },
    {
      num: '04',
      title: 'Review & Act',
      description:
        'Use the findings to make informed decisions about engaging with a project, or export reports for due diligence and compliance documentation.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-emerald-400">
          <HelpCircle size={22} />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">How It Works</h2>
      </div>
      <p className="text-sm text-slate-400 mb-8 max-w-xl">
        SentinelScan combines smart contract analysis with legal document review
        to give you a comprehensive fraud and compliance risk assessment in
        seconds.
      </p>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={step.num} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0">
                {step.num}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-slate-700/50 my-2" />
              )}
            </div>
            <div className="pb-2">
              <h3 className="text-base font-semibold text-slate-100 mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
