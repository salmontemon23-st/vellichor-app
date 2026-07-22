export type Category = "Scotch" | "Bourbon" | "Rye" | "Japanese Whisky" | "Fine Wine";

export type BottleStatus = "available" | "sold-out" | "redeemed";

export type AccentColor = "amber" | "wine";

export interface Bottle {
  id: string;
  name: string;
  producer: string;
  category: Category;
  vintage: string;
  abv?: string;
  totalUnits: number;
  unitsOutstanding: number;
  pricePerUnit: number;
  status: BottleStatus;
  storageLocation: string;
  insuranceStatus: string;
  conditionReport: string;
  provenance: string[];
  description: string;
  accent: AccentColor;
  genesis?: boolean;
  listedAt: string;
}

export interface PortfolioHolding {
  bottleId: string;
  units: number;
}

export type TxType = "purchase" | "transfer" | "redemption";

export interface Transaction {
  id: string;
  type: TxType;
  bottleId: string;
  units: number;
  date: string;
  txHash: string;
}

export interface SpiritListing {
  id: string;
  name: string;
  brand: string;
  spiritType: string;
  country: string;
  abv: number | null;
  volumeMl: number | null;
  age: number;
  price: number;
  description: string;
  image: string;
}
