export const TIERS = {
  tier1: {
    name: 'Unbreakable Coaching',
    price_id: 'price_1T6GbzRgwCgvPuKnSgQtnwUz',
    product_id: 'prod_U4PQ35DRoPC9UJ',
    monthlyPrice: 50,
    totalPrice: 150,
    commitmentMonths: 3,
  },
  tier2: {
    name: 'Unbreakable 1-to-1',
    price_id: 'price_1T6Gc7RgwCgvPuKnfH1WiggU',
    product_id: 'prod_U4PQwLuwPeayrD',
    monthlyPrice: 100,
    totalPrice: 300,
    commitmentMonths: 3,
  },
} as const;

export type TierKey = keyof typeof TIERS;
