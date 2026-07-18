export type OrderSide = 'Buy' | 'Sell';

export interface DemoBrokerOption {
  id: string;
  name: string;
}

export interface OrderLevel {
  orderId: number;
  remainingQuantity: number;
  sequenceNumber: number;
}

export interface PriceLevel {
  price: number;
  totalQuantity: number;
  orders: OrderLevel[];
}

export interface OrderBookSnapshot {
  symbol: string;
  asOfEventSequence: number;
  bids: PriceLevel[];
  asks: PriceLevel[];
}

export interface TradeTapeEntry {
  tradeId: number;
  symbol: string;
  buyOrderId: number;
  sellOrderId: number;
  price: number;
  quantity: number;
  executedSequence: number;
}

export interface PlaceOrderRequest {
  brokerId: string;
  symbol: string;
  side: OrderSide;
  price: number;
  quantity: number;
}

export interface ExchangeEvent {
  eventSequence: number;
  brokerId: string;
  type: string;
  orderId?: number;
  tradeId?: number;
  reason?: string;
  occurredAt?: string;
}

export interface PlaceOrderResponse {
  accepted: boolean;
  orderId?: number;
  reason?: string;
  events: ExchangeEvent[];
}

export interface CancelOrderResponse {
  cancelled: boolean;
  reason?: string;
  events: ExchangeEvent[];
}

export interface OrderStatusView {
  orderId: number;
  brokerId: string;
  symbol: string;
  side: OrderSide;
  price: number;
  quantity: number;
  remainingQuantity: number;
  status: string;
  sequenceNumber: number;
}

export interface PlaceOrderFormModel {
  brokerId: string;
  side: OrderSide;
  price: number | null;
  quantity: number | null;
}

export interface MarketBoardViewModel {
  symbol: string;
  latestPrice: number | null;
  bids: PriceLevel[];
  asks: PriceLevel[];
  pendingVolume: number;
  trades: TradeTapeEntry[];
  asOfEventSequence: number;
  updatedAt: Date | null;
}
