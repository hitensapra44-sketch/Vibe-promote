import { useState } from "react";

const PLAN_LINKS = {
  starter_monthly: "https://test.checkout.dodopayments.com/buy/pdt_0NeG6AUiZKRYSbt4nLnM9?quantity=1",
  starter_annual: "YOUR_STARTER_ANNUAL_LINK",
  pro_monthly: "YOUR_PRO_MONTHLY_LINK",
  pro_annual: "YOUR_PRO_ANNUAL_LINK",
  founder_monthly: "YOUR_FOUNDER_MONTHLY_LINK",
  founder_annual: "YOUR_FOUNDER_ANNUAL_LINK",
};

function CheckIcon() {
  return (
    <svg
      className="h-3 w-3 shrink-0 text-green-500"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 6.4L4.7 9L10 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="h-3 w-3 shrink-0 text-gray-600"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.5 5V4a2.5 2.5 0 115 0v1M3 5h6a.5.5 0 01.5.5v3A1.5 1.5 0 018 10h-4A1.5 1.5 0 012.5 8.5v-3A.5.5 0 013 5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureRow({ label, value, status }) {
  const isLocked = status === "locked";

  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/5 py-3 last:border-b-0">
      <div className={`flex items-center gap-2 text-sm ${isLocked ? "text-gray-600" : "text-white"}`}>
        {isLocked ? <LockIcon /> : <CheckIcon />}
        <span>{label}</span>
      </div>
      <span className={`text-sm ${isLocked ? "text-gray-600" : "text-gray-400"}`}>{value}</span>
    </div>
  );
}

function BillingToggle({ billing, onChange }) {
  return (
    <div className="mt-8 flex justify-center">
      <div className="inline-flex rounded-xl border border-white/10 bg-[#1a1a1a] p-1">
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
            billing === "monthly" ? "bg-violet-500 text-white" : "text-gray-300 hover:text-white"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange("annual")}
          className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
            billing === "annual" ? "bg-violet-500 text-white" : "text-gray-300 hover:text-white"
          }`}
        >
          <span>Annual</span>
          <span className="ml-2 text-green-500">Save 33%</span>
        </button>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  tagline,
  monthlyPrice,
  annualPrice,
  annualYearlyBilled,
  features,
  ctaLabel,
  ctaHref,
  billing,
  isRecommended = false,
  ctaClassName,
}) {
  const displayPrice = billing === "annual" ? annualPrice : monthlyPrice;

  return (
    <div
      className={`relative flex h-full flex-col justify-between rounded-2xl border p-8 ${
        isRecommended ? "border-violet-500/60" : "border-white/10"
      } bg-[#1a1a1a]`}
      style={
        isRecommended
          ? {
              boxShadow:
                "0 0 0 1px rgba(139,92,246,0.6), 0 0 40px rgba(139,92,246,0.2), 0 0 80px rgba(167,139,250,0.1)",
            }
          : undefined
      }
    >
      {isRecommended ? (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-500/40 bg-[#151515] px-3 py-1 text-xs font-semibold text-violet-300">
          Most Popular
        </div>
      ) : null}

      <div>
        <h3 className="text-xl font-semibold text-white">{name}</h3>
        <p className="mb-6 mt-1 text-sm text-gray-400">{tagline}</p>

        <div className="mb-6">
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-white">${displayPrice}</span>
            <span className="pb-1 text-lg text-gray-400">/month</span>
          </div>
          {billing === "annual" ? (
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="text-gray-500 line-through">${monthlyPrice}/month</span>
              <span className="text-green-500">Save 33%</span>
              {annualYearlyBilled ? <span className="text-gray-500">billed ${annualYearlyBilled}/year</span> : null}
            </div>
          ) : null}
        </div>

        <div className="flex-1 space-y-0">
          {features.map((feature) => (
            <FeatureRow
              key={`${name}-${feature.label}`}
              label={feature.label}
              value={feature.value}
              status={feature.status}
            />
          ))}
        </div>
      </div>

      <a
        href={ctaHref}
        className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${ctaClassName}`}
      >
        {ctaLabel}
      </a>
    </div>
  );
}

const PLANS = [
  {
    name: "Free",
    tagline: "Explore the core tools, free forever.",
    monthlyPrice: "0",
    annualPrice: "0",
    annualYearlyBilled: null,
    ctaLabel: "Get Started Free",
    getCtaHref: () => "/",
    ctaClassName: "border border-white/20 text-white hover:border-white/40",
    features: [
      { label: "Positioning Helper", value: "Unlimited", status: "included" },
      { label: "Post Preview", value: "Unlimited", status: "included" },
      { label: "User Finder", value: "10 searches/month", status: "limited" },
      { label: "Post Maker", value: "15 posts/month", status: "limited" },
      { label: "Co-Pilot", value: "Locked", status: "locked" },
      { label: "Analytics", value: "Locked", status: "locked" },
      { label: "Connected Accounts", value: "1", status: "limited" },
      { label: "Brand Profiles", value: "1", status: "limited" },
      { label: "PDF Guide", value: "Reddit and X guidebook", status: "limited" },
      { label: "Support", value: "Email", status: "limited" },
    ],
  },
  {
    name: "Starter",
    tagline: "More power for growing founders.",
    monthlyPrice: "19",
    annualPrice: "13",
    annualYearlyBilled: "156",
    ctaLabel: "Start Starter",
    getCtaHref: (billing) => (billing === "annual" ? PLAN_LINKS.starter_annual : PLAN_LINKS.starter_monthly),
    ctaClassName: "bg-violet-500 text-white hover:bg-violet-400",
    features: [
      { label: "Positioning Helper", value: "Unlimited", status: "included" },
      { label: "Post Preview", value: "Unlimited", status: "included" },
      { label: "User Finder", value: "50 searches/month", status: "limited" },
      { label: "Post Maker", value: "35 posts/month", status: "limited" },
      { label: "Co-Pilot", value: "Unlimited", status: "included" },
      { label: "Analytics", value: "Preview only (view data, no AI assistant)", status: "limited" },
      { label: "Connected Accounts", value: "2", status: "limited" },
      { label: "Brand Profiles", value: "1", status: "limited" },
      { label: "PDF Guide", value: "Reddit, X, LinkedIn, IndieHackers", status: "limited" },
      { label: "Support", value: "Priority Email", status: "limited" },
    ],
  },
  {
    name: "Pro",
    tagline: "The full toolkit for serious founders.",
    monthlyPrice: "49",
    annualPrice: "33",
    annualYearlyBilled: "396",
    ctaLabel: "Start Pro",
    getCtaHref: (billing) => (billing === "annual" ? PLAN_LINKS.pro_annual : PLAN_LINKS.pro_monthly),
    ctaClassName: "bg-violet-500 text-white hover:bg-violet-400",
    isRecommended: true,
    features: [
      { label: "Positioning Helper", value: "Unlimited", status: "included" },
      { label: "Post Preview", value: "Unlimited", status: "included" },
      { label: "User Finder", value: "Unlimited", status: "included" },
      { label: "Post Maker", value: "Unlimited", status: "included" },
      { label: "Co-Pilot", value: "Unlimited", status: "included" },
      { label: "Analytics", value: "Full access", status: "included" },
      { label: "Connected Accounts", value: "All platforms", status: "included" },
      { label: "Brand Profiles", value: "1", status: "limited" },
      { label: "PDF Guide", value: "Every platform", status: "included" },
      { label: "Support", value: "24/7 Proper Support", status: "included" },
    ],
  },
  {
    name: "Founder",
    tagline: "For multi-product founders and consultants.",
    monthlyPrice: "99",
    annualPrice: "66",
    annualYearlyBilled: "792",
    ctaLabel: "Go Founder",
    getCtaHref: (billing) => (billing === "annual" ? PLAN_LINKS.founder_annual : PLAN_LINKS.founder_monthly),
    ctaClassName: "border border-violet-500/40 bg-violet-900 text-white hover:bg-violet-800",
    features: [
      { label: "Positioning Helper", value: "Unlimited", status: "included" },
      { label: "Post Preview", value: "Unlimited", status: "included" },
      { label: "User Finder", value: "Unlimited", status: "included" },
      { label: "Post Maker", value: "Unlimited", status: "included" },
      { label: "Co-Pilot", value: "Unlimited", status: "included" },
      { label: "Analytics", value: "Full access with AI insights", status: "included" },
      { label: "Connected Accounts", value: "All platforms", status: "included" },
      { label: "Brand Profiles", value: "Unlimited", status: "included" },
      {
        label: "PDF Guide",
        value: "Every platform plus exclusive Founder marketing PDF",
        status: "included",
      },
      { label: "Support", value: "Direct Founder Support", status: "included" },
    ],
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");

  return (
    <section className="min-h-screen bg-[#0f0f0f] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Simple, honest pricing.</h1>
          <p className="mt-3 text-gray-400">No hidden fees. Cancel anytime.</p>
        </div>

        <BillingToggle billing={billing} onChange={setBilling} />

        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              tagline={plan.tagline}
              monthlyPrice={plan.monthlyPrice}
              annualPrice={plan.annualPrice}
              annualYearlyBilled={plan.annualYearlyBilled}
              features={plan.features}
              ctaLabel={plan.ctaLabel}
              ctaHref={plan.getCtaHref(billing)}
              billing={billing}
              isRecommended={plan.isRecommended}
              ctaClassName={plan.ctaClassName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
