export const calculateFreight = (estimatedDistance: number): number => {
  const baseCost = 5.0;
  const costPerKm = 2.5;
  return baseCost + estimatedDistance * costPerKm;
};
