export interface SubscriptionPlanItem {
 id: string;
 name: string;
 price: number;
 billing_cycle: string;
 max_beds: number;
 features: string[];
 badge?: string | null;
 is_active: boolean;
 created_at?: string;
 updated_at?: string;
}

export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlanItem[] = [
 {
 id: "free_trial",
 name: "Free Trial",
 price: 0,
 billing_cycle: "14-days",
 max_beds: 30,
 features: [
 "Up to 30 Beds",
 "14 Days Full Access",
 "Standard Operations & Invoicing",
 ],
 badge: null,
 is_active: true,
 },
 {
 id: "starter",
 name: "Starter White-Label",
 price: 999,
 billing_cycle: "monthly",
 max_beds: 100,
 features: [
 "Up to 100 Beds",
 "Custom White-Label Slug & Branding",
 "Automated WhatsApp Receipts",
 "Zero-Fee Direct UPI QR Collection",
 ],
 badge: "Popular",
 is_active: true,
 },
 {
 id: "pro",
 name: "Pro Unlimited",
 price: 2499,
 billing_cycle: "monthly",
 max_beds: 500,
 features: [
 "Up to 500 Beds",
 "Cloud WhatsApp Automation",
 "Multi-Building Scope Management",
 "Staff & Warden Role Access",
 "24/7 Priority Support",
 ],
 badge: "Recommended",
 is_active: true,
 },
 {
 id: "enterprise",
 name: "Enterprise Scaled",
 price: 4999,
 billing_cycle: "monthly",
 max_beds: 2000,
 features: [
 "Unlimited Beds & Buildings",
 "Custom Domain Mapping",
 "Direct Bank Account Settlement",
 "Dedicated Account Manager",
 "PostgreSQL Data Export & Custom SLA",
 ],
 badge: "Enterprise",
 is_active: true,
 },
];
