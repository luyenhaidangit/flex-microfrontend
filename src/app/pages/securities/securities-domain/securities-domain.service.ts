import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SecuritiesDomainDto {
  domainCode: string;
  domainName: string;
  settlementType: string;
  settlementCycle: string;
  secSettlementType: string;
  cashSettleType: string;
  isDefault: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class SecuritiesDomainService {
  constructor(private http: HttpClient) {}

  getDomains(): Observable<ApiResponse<SecuritiesDomainDto[]>> {
    return this.http.get<ApiResponse<SecuritiesDomainDto[]>>('api/securities/domains');
  }
}

