import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SessionManagementComponent } from './session-management.component';
import { ExchangeApiService } from './exchange-api.service';
import { ExchangeRealtimeService } from './exchange-realtime.service';

describe('SessionManagementComponent', () => {
  let component: SessionManagementComponent;
  let fixture: ComponentFixture<SessionManagementComponent>;
  let api: jasmine.SpyObj<ExchangeApiService>;
  let realtime: jasmine.SpyObj<ExchangeRealtimeService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ExchangeApiService', ['getMarkets', 'getSession', 'startSession']);
    realtime = jasmine.createSpyObj('ExchangeRealtimeService', ['connect'], { sessionState$: of() });
    api.getMarkets.and.returnValue(of({
      isSuccess: true,
      data: [
        { marketCode: 'HNX', marketName: 'HNX', status: 'Active', hasAto: true, hasPlo: true },
        { marketCode: 'HOSE', marketName: 'HOSE', status: 'Active', hasAto: true, hasPlo: true }
      ]
    }));
    api.getSession.and.returnValue(of({ isSuccess: true, data: { sessionId: 's', market: 'HNX', state: 'close', startedAt: '', openDurationSeconds: 0, continuousDurationSeconds: 0 } }));

    await TestBed.configureTestingModule({
      declarations: [SessionManagementComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ExchangeApiService, useValue: api },
        { provide: ExchangeRealtimeService, useValue: realtime }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionManagementComponent);
    component = fixture.componentInstance;
  });

  it('derives the market rows from available instruments', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.rows.map(row => row.market.marketCode)).toEqual(['HNX', 'HOSE']);
    component.ngOnDestroy();
  }));

  it('starts a session for a market', fakeAsync(() => {
    api.startSession.and.returnValue(of({ isSuccess: true, data: { sessionId: 's', market: 'HNX', state: 'preopen', startedAt: '', openDurationSeconds: 0, continuousDurationSeconds: 0 } }));
    fixture.detectChanges();
    tick();

    component.startSession(component.rows[0]);
    expect(api.startSession).toHaveBeenCalledWith('HNX');
    expect(component.rows[0].state).toBe('preopen');
    component.ngOnDestroy();
  }));

  it('navigates back to the market board', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/exchange']);
  });

  it('gates start/open state correctly', () => {
    expect(component.canStart('close')).toBeTrue();
    expect(component.canStart('continuous')).toBeFalse();
    expect(component.isOpen('continuous')).toBeTrue();
    expect(component.isOpen('close')).toBeFalse();
  });
});
