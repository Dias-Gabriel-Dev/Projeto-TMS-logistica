export interface CreateDeliveryDTO {
  routeId: string;
  driverId: string;
  vehicleId: string;
  cargoWeight: number;
}

export interface CreateDeliveryTxInput extends CreateDeliveryDTO {
  freightCost: number;
  trackingCode: string;
}
