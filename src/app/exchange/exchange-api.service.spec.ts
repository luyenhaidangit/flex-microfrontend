import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { ExchangeApiService } from './exchange-api.service';

describe('ExchangeApiService', () => {
  let service: ExchangeApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ExchangeApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('calls order book and trades endpoints', () => {
    service.getOrderBook().subscribe();
    service.getTrades().subscribe();
    http.expectOne(`${environment.exchangeApiBaseUrl}/api/orderbook`).flush({ symbol: 'FXS', bids: [], asks: [] });
    http.expectOne(`${environment.exchangeApiBaseUrl}/api/trades`).flush([]);
  });

  it('adds correlation and skips auth for commands', () => {
    service.placeOrder({ brokerId: 'DEMO-BUYER', symbol: 'FXS', side: 'Buy', price: 100, quantity: 10 }).subscribe();
    const request = http.expectOne(`${environment.exchangeApiBaseUrl}/api/orders`);
    expect(request.request.headers.has('X-Correlation-Id')).toBeTrue();
    expect(request.request.headers.get('X-Skip-Auth')).toBe('true');
    request.flush({ accepted: true, events: [] });
  });

  it('sends broker id for cancellation', () => {
    service.cancelOrder(7, 'DEMO-SELLER').subscribe();
    const request = http.expectOne(`${environment.exchangeApiBaseUrl}/api/orders/7`);
    expect(request.request.params.get('brokerId')).toBe('DEMO-SELLER');
    request.flush({ cancelled: true, events: [] });
  });
});
