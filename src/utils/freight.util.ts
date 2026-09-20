export const calculateFreight = (estimatedDistance: number, cargoWeight: number): number => {
  const baseCost = 50.0;
  const costPerKm = 2.5;
  const costPerKg = 0.5;
  return baseCost + estimatedDistance * costPerKm + cargoWeight * costPerKg;
};
