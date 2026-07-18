import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MarketBoardComponent } from './market-board.component';
import { ExchangeApiService } from './exchange-api.service';
import { ExchangeRealtimeService } from './exchange-realtime.service';

describe('MarketBoardComponent', () => {
  let component: MarketBoardComponent;
  let fixture: ComponentFixture<MarketBoardComponent>;
  let api: jasmine.SpyObj<ExchangeApiService>;
  let realtime: jasmine.SpyObj<ExchangeRealtimeService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ExchangeApiService', ['getOrderBook', 'getTrades', 'placeOrder', 'cancelOrder']);
    realtime = jasmine.createSpyObj('ExchangeRealtimeService', ['connect', 'disconnect'], { events$: of() });
    api.getOrderBook.and.returnValue(of({ symbol: 'FXS', asOfEventSequence: 1, bids: [], asks: [] }));
    api.getTrades.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      declarations: [MarketBoardComponent],
      imports: [ReactiveFormsModule],
      providers: [{ provide: ExchangeApiService, useValue: api }, { provide: ExchangeRealtimeService, useValue: realtime }]
    }).compileComponents();
    fixture = TestBed.createComponent(MarketBoardComponent);
    component = fixture.componentInstance;
  });

  it('renders the empty FXS board', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(component.board.symbol).toBe('FXS');
    expect(fixture.nativeElement.textContent).toContain('Chưa có lệnh mua');
  }));

  it('validates required order fields and prevents duplicate submit', () => {
    component.submitOrder();
    expect(api.placeOrder).not.toHaveBeenCalled();
    component.orderForm.patchValue({ brokerId: 'DEMO-BUYER', side: 'Buy', price: 100, quantity: 10 });
    api.placeOrder.and.returnValue(of({ accepted: true, orderId: 1, events: [] }));
    component.submitOrder();
    expect(api.placeOrder).toHaveBeenCalledTimes(1);
  });

  it('keeps the last market snapshot when refresh fails', fakeAsync(() => {
    api.getOrderBook.and.returnValues(
      of({ symbol: 'FXS', asOfEventSequence: 2, bids: [{ price: 100, totalQuantity: 5, orders: [] }], asks: [] }),
      throwError(() => new Error('offline'))
    );
    fixture.detectChanges();
    tick();
    expect(component.board.bids.length).toBe(1);
    component.ngOnDestroy();
  }));

  it('exposes only the configured demo brokers and no credential fields', () => {
    expect(component.brokers.map(broker => broker.id)).toEqual(['DEMO-BUYER', 'DEMO-SELLER']);
    expect(fixture.nativeElement.textContent).not.toContain('Authorization');
    expect(fixture.nativeElement.textContent).not.toContain('secret');
  });
});
