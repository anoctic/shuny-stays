export const DEFAULT_TENANT_ID =
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || "00000000-0000-0000-0000-000000000001";

export interface DemoTenant {
  id: string;
  name: string;
  slug: string;
  city: string;
  propertiesCount: number;
  bedsCount: number;
}

export const DEMO_TENANTS: DemoTenant[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Zenith Luxury PG & Hostels",
    slug: "zenith-pg",
    city: "Bengaluru",
    propertiesCount: 2,
    bedsCount: 6,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "GreenVilla Executive Stays",
    slug: "greenvilla-pg",
    city: "Hyderabad",
    propertiesCount: 1,
    bedsCount: 4,
  },
];
