/**
 * PrepRX plan catalog for the client.
 *
 * Amounts/currency MUST stay in sync with backend/Config/billingPlans.js —
 * that file is the server-side source of truth and validates planId + price IDs.
 * Display strings are derived from `amount` so a price change only needs editing here.
 */

export const TRIAL_DAYS = 3;
export const GRACE_PERIOD_DAYS = 7;

export const formatPrice = (amount, currency = 'usd') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);

export const PLAN_CATALOG = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    amount: 2999,
    currency: 'usd',
    period: '/ month',
    cycle: 'Monthly',
    description: 'Full premium access billed monthly.',
    featured: true,
  },
  'three-month': {
    id: 'three-month',
    name: '3-Month',
    amount: 7999,
    currency: 'usd',
    period: '/ 3 months',
    cycle: 'Every 3 months',
    description: 'Full premium access on a 3-month billing cycle.',
    featured: false,
  },
  annual: {
    id: 'annual',
    name: 'Annual',
    amount: 25900,
    currency: 'usd',
    period: '/ year',
    cycle: 'Yearly',
    description: 'Full premium access billed yearly.',
    featured: false,
  },
};

// Display price is derived, never hardcoded per page.
Object.values(PLAN_CATALOG).forEach((plan) => {
  plan.price = formatPrice(plan.amount, plan.currency);
  plan.badge = `${TRIAL_DAYS}-day free trial`;
  plan.periodLabel = plan.period.replace(/^\/\s*/, '/');
});

export const PLAN_LIST = Object.values(PLAN_CATALOG);

export const getPlan = (planId) => PLAN_CATALOG[planId] || null;