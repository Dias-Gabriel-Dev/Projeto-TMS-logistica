export interface CreateDeliveryDTO {
  routeId: string;
  courierId: string;
}

export interface CreateDeliveryTxInput extends CreateDeliveryDTO {
  freightCost: number;
  trackingCode: string;
}
