import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { MarketBoardComponent } from './market-board.component';
import { ExchangeApiService } from './exchange-api.service';
import { ExchangeRealtimeService } from './exchange-realtime.service';

describe('MarketBoardComponent', () => {
  let component: MarketBoardComponent;
  let fixture: ComponentFixture<MarketBoardComponent>;
  let api: jasmine.SpyObj<ExchangeApiService>;
  let realtime: jasmine.SpyObj<ExchangeRealtimeService>;
  let connectionState$: BehaviorSubject<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ExchangeApiService', ['getInstruments', 'getOrderBook', 'getTrades', 'placeOrder', 'cancelOrder', 'startSession', 'getSession', 'startTradingSession', 'getTradingSession']);
    connectionState$ = new BehaviorSubject<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('disconnected');
    realtime = jasmine.createSpyObj('ExchangeRealtimeService', ['connect', 'disconnect'], { events$: of(), connectionState$: connectionState$.asObservable() });
    api.getInstruments.and.returnValue(of({ isSuccess: true, data: [] }));
    api.getOrderBook.and.returnValue(of({ isSuccess: true, data: { symbol: 'FXS', asOfEventSequence: 1, bids: [], asks: [] } }));
    api.getTrades.and.returnValue(of({ isSuccess: true, data: [] }));
    api.getSession.and.returnValue(of({ isSuccess: true, data: null }));
    api.getTradingSession.and.returnValue(of({ isSuccess: true, data: null }));
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
    expect(fixture.nativeElement.textContent).toContain('Chưa có lệnh mua chờ khớp');
    expect(fixture.nativeElement.textContent).toContain('Phiên Đang đóng');
  }));

  it('starts a trading session from the board', () => {
    api.startSession.and.returnValue(of({ isSuccess: true, data: { sessionId: 'session-1', symbol: 'FXS', state: 'preopen', startedAt: new Date().toISOString() } }));
    component.startSession();
    expect(api.startSession).toHaveBeenCalledTimes(1);
    expect(component.sessionState).toBe('preopen');
  });

  it('validates required order fields and prevents duplicate submit', () => {
    component.sessionState = 'continuous';
    component.submitOrder();
    expect(api.placeOrder).not.toHaveBeenCalled();
    component.orderForm.patchValue({ brokerId: 'DEMO-BUYER', side: 'Buy', price: 100, quantity: 10 });
    api.placeOrder.and.returnValue(of({ isSuccess: true, data: { accepted: true, orderId: 1, events: [] } }));
    component.submitOrder();
    expect(api.placeOrder).toHaveBeenCalledTimes(1);
  });

  it('prevents order submission while the trading session is closed', () => {
    component.submitOrder();
    expect(api.placeOrder).not.toHaveBeenCalled();
    expect(component.commandMessage).toContain('khởi động phiên');
  });

  it('keeps the last market snapshot when refresh fails', fakeAsync(() => {
    api.getOrderBook.and.returnValues(
      of({ isSuccess: true, data: { symbol: 'FXS', asOfEventSequence: 2, bids: [{ price: 100, totalQuantity: 5, orders: [] }], asks: [] } }),
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

  describe('session state gates', () => {
    for (const state of ['preopen', 'plo', 'close']) {
      it(`canStartSession is true and canPlaceOrder/canCancelOrder are false for ${state}`, () => {
        component.sessionState = state;
        expect(component.canStartSession).toBeTrue();
        expect(component.canPlaceOrder).toBeFalse();
        expect(component.canCancelOrder).toBeFalse();
      });
    }

    for (const state of ['ato', 'continuous', 'intermission', 'atc']) {
      it(`canStartSession is false and canPlaceOrder is true for ${state}`, () => {
        component.sessionState = state;
        expect(component.canStartSession).toBeFalse();
        expect(component.canPlaceOrder).toBeTrue();
      });
    }

    it('canCancelOrder is true only for continuous', () => {
      component.sessionState = 'continuous';
      expect(component.canCancelOrder).toBeTrue();

      for (const state of ['ato', 'atc', 'intermission', 'preopen', 'plo', 'close']) {
        component.sessionState = state;
        expect(component.canCancelOrder).withContext(state).toBeFalse();
      }
    });
  });
});
