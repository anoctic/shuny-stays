export const DEFAULT_TENANT_ID =
 process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || "00000000-0000-0000-0000-000000000001";

export interface DemoTenant {
 id: string;
 name: string;
 slug: string;
 city: string;
 contactEmail?: string;
 contactPhone?: string;
 propertiesCount: number;
 bedsCount: number;
 residentsCount: number;
 subscriptionPlan: string;
 subscriptionStatus: "active" | "trial" | "past_due";
 billingCycle: string;
 renewalDate: string;
}

export const DEMO_TENANTS: DemoTenant[] = [
 {
 id: "00000000-0000-0000-0000-000000000001",
 name: "Zenith Luxury PG & Hostels",
 slug: "zenith-pg",
 city: "Bengaluru",
 contactEmail: "admin@zenithpg.com",
 contactPhone: "+91 98111 22334",
 propertiesCount: 2,
 bedsCount: 6,
 residentsCount: 3,
 subscriptionPlan: "Enterprise Pro",
 subscriptionStatus: "active",
 billingCycle: "Annual",
 renewalDate: "2027-08-01",
 },
 {
 id: "00000000-0000-0000-0000-000000000002",
 name: "GreenVilla Executive Stays",
 slug: "greenvilla-pg",
 city: "Hyderabad",
 contactEmail: "ops@greenvillapg.com",
 contactPhone: "+91 98444 55667",
 propertiesCount: 1,
 bedsCount: 4,
 residentsCount: 2,
 subscriptionPlan: "Starter Growth",
 subscriptionStatus: "trial",
 billingCycle: "Monthly",
 renewalDate: "2026-12-15",
 },
];
