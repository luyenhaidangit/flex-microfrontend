import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { UserService } from '../issuer.service';
import { SecuritiesDomainService } from '../../securities-domain/securities-domain.service';
import { SecuritiesDomainItem } from '../../securities-domain/securities-domain.models';

interface CreateIssuerRequestDto { 
  issuerCode: string; 
  shortName: string; 
  fullName: string; 
  comment?: string;
  securities?: SecuritiesRequestItem[];
}

interface SecuritiesRequestItem {
  securitiesCode?: string; // Optional, chỉ gửi khi edit
  symbol: string;
  isinCode?: string;
  domainCode: string;
}

interface SecuritiesItem {
  securitiesCode: string;
  symbol: string;
  isinCode?: string;
  domainCode: string;
}

@Component({
  selector: 'app-create-issuer-modal',
  templateUrl: './create-issuer-modal.component.html',
  styleUrls: ['./create-issuer-modal.component.scss']
})
export class CreateIssuerModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  
  userForm!: FormGroup;
  securitiesForm!: FormGroup;
  isSubmitting = false;
  isLoadingCode = false;
  activeTab: 'info' | 'securities' = 'info';
  securitiesList: SecuritiesItem[] = [];
  showSecuritiesModal = false;
  editingSecuritiesIndex = -1;
  domainList: SecuritiesDomainItem[] = [];
  isLoadingDomains = false;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService,
    private domainService: SecuritiesDomainService
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
    this.initializeSecuritiesForm();
    this.loadDomains();
  }
  
  ngOnChanges(): void {
    if (this.isVisible) {
      this.activeTab = 'info';
      this.prefillIssuerCode();
    }
  }
  
  private initializeForm(): void {
    this.userForm = this.fb.group({
      issuerCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._-]+'), Validators.maxLength(50)]],
      shortName: ['', [Validators.required, Validators.maxLength(100)]],
      fullName: ['', [Validators.required, Validators.maxLength(200)]],
      comment: ['',[Validators.maxLength(500)]]
    });
  }
  
  private initializeSecuritiesForm(): void {
    this.securitiesForm = this.fb.group({
      securitiesCode: ['AUTO'],
      symbol: ['', [Validators.required, Validators.maxLength(20)]],
      isinCode: ['', [Validators.maxLength(20)]],
      domainCode: ['', [Validators.required]]
    });
  }
  
  private prefillIssuerCode(): void {
    this.isLoadingCode = true;
    (this.userService as any).getNextIssuerCode(false).subscribe({
      next: (res: any) => {
        this.isLoadingCode = false;
        const code = res?.data?.code || res?.code || '';
        if (code) this.userForm.patchValue({ issuerCode: code });
      },
      error: (err) => {
        this.isLoadingCode = false;
        console.error('Error loading issuer code:', err);
      }
    });
  }
  
  
  setActiveTab(tab: 'info' | 'securities'): void {
    this.activeTab = tab;
  }
  
  addSecurities(): void {
    this.editingSecuritiesIndex = -1;
    this.securitiesForm.reset({
      securitiesCode: 'AUTO',
      symbol: '',
      isinCode: '',
      domainCode: '' // Đảm bảo giá trị mặc định là empty string, không phải null
    });
    // Không gọi API để lấy mã chứng khoán vì issuer chưa được duyệt
    // Đảm bảo domains đã được load
    if (this.domainList.length === 0) {
      this.loadDomains();
    }
    this.showSecuritiesModal = true;
  }
  
  private loadDomains(): void {
    if (this.isLoadingDomains) return;
    this.isLoadingDomains = true;
    this.domainService.getAll().subscribe({
      next: (res) => {
        this.isLoadingDomains = false;
        this.domainList = res?.data ?? [];
      },
      error: (err) => {
        this.isLoadingDomains = false;
        console.error('Error loading domains:', err);
      }
    });
  }
  
  editSecurities(index: number): void {
    this.editingSecuritiesIndex = index;
    const securities = this.securitiesList[index];
    this.securitiesForm.patchValue({
      securitiesCode: securities.securitiesCode,
      symbol: securities.symbol,
      isinCode: securities.isinCode || '',
      domainCode: securities.domainCode
    });
    this.showSecuritiesModal = true;
  }
  
  removeSecurities(index: number): void {
    this.securitiesList.splice(index, 1);
  }
  
  saveSecurities(): void {
    this.securitiesForm.markAllAsTouched();
    if (this.securitiesForm.invalid) return;
    
    const formData = this.securitiesForm.value;
    
    const securitiesItem: SecuritiesItem = {
      securitiesCode: this.editingSecuritiesIndex >= 0 
      ? (formData.securitiesCode?.trim() || 'AUTO') 
      : 'AUTO',
      symbol: formData.symbol.trim(),
      isinCode: formData.isinCode?.trim() || undefined,
      domainCode: formData.domainCode.trim()
    };
    
    if (this.editingSecuritiesIndex >= 0) {
      this.securitiesList[this.editingSecuritiesIndex] = securitiesItem;
    } else {
      this.securitiesList.push(securitiesItem);
    }
    
    this.closeSecuritiesModal();
  }
  
  closeSecuritiesModal(): void {
    this.showSecuritiesModal = false;
    this.editingSecuritiesIndex = -1;
    this.securitiesForm.reset({
      securitiesCode: 'AUTO',
      symbol: '',
      isinCode: '',
      domainCode: '' // Đảm bảo giá trị mặc định là empty string, không phải null
    });
  }
  
  getDomainDisplayName(domainCode: string): string {
    if (!domainCode) return '-';
    const domain = this.domainList.find(d => d.domainCode === domainCode);
    if (domain) {
      return `${domain.domainCode} - ${domain.domainName}`;
    }
    return domainCode;
  }
  
  onSubmit(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid || this.isSubmitting) return;
    
    this.isSubmitting = true;
    const formData = this.userForm.value;
    
    const securitiesForRequest: SecuritiesRequestItem[] | undefined = this.securitiesList.length > 0 
    ? this.securitiesList.map(s => ({
      symbol: s.symbol,
      isinCode: s.isinCode,
      domainCode: s.domainCode
    }))
    : undefined;
    
    const createRequest: CreateIssuerRequestDto = {
      issuerCode: (formData.issuerCode || '').trim(),
      shortName: (formData.shortName || '').trim(),
      fullName: (formData.fullName || '').trim(),
      comment: (formData.comment || '').trim() || undefined,
      securities: securitiesForRequest
    };
    
    (this.userService as any).createIssuer(createRequest)
    .subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res?.isSuccess) {
          this.toastService.success('Gửi yêu cầu tạo tổ chức phát hành thành công!');
          this.userForm.reset();
          this.created.emit();
          this.closeModal();
        } else {
          this.toastService.error(res?.message || 'Không thể tạo tổ chức phát hành!');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error creating issuer:', err);
      }
    });
  }
  
  onCancel(): void {
    this.userForm.reset();
    this.closeModal();
  }
  
  closeModal(): void {
    this.close.emit();
    this.resetStates();
  }
  
  // Reset all states
  private resetStates(): void {
    this.userForm.reset();
    this.securitiesForm.reset();
    this.securitiesList = [];
    this.showSecuritiesModal = false;
    this.editingSecuritiesIndex = -1;
    this.isSubmitting = false;
    this.isLoadingCode = false;
    this.activeTab = 'info';
  }
  
  // Helper methods for form validation
  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.touched && field?.invalid) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} không được để trống`;
      }
      if (field.errors?.['email']) {
        return 'Email không đúng định dạng';
      }
      if (field.errors?.['pattern']) {
        return `${this.getFieldLabel(fieldName)} chỉ được chứa chữ, số, dấu chấm, gạch dưới và gạch ngang`;
      }
      if (field.errors?.['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} không được vượt quá ${maxLength} ký tự`;
      }
    }
    return '';
  }
  
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      issuerCode: 'Mã TCPH',
      shortName: 'Tên viết tắt',
      fullName: 'Tên đầy đủ',
      comment: 'Ghi chú'
    };
    return labels[fieldName] || fieldName;
  }
  
  // Helper methods for securities form validation
  getSecuritiesFieldError(fieldName: string): string {
    const field = this.securitiesForm.get(fieldName);
    if (field?.touched && field?.invalid) {
      if (field.errors?.['required']) {
        return `${this.getSecuritiesFieldLabel(fieldName)} không được để trống`;
      }
      if (field.errors?.['pattern']) {
        return `${this.getSecuritiesFieldLabel(fieldName)} chỉ được chứa chữ, số, dấu chấm, gạch dưới và gạch ngang`;
      }
      if (field.errors?.['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getSecuritiesFieldLabel(fieldName)} không được vượt quá ${maxLength} ký tự`;
      }
    }
    return '';
  }
  
  private getSecuritiesFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      securitiesCode: 'Mã chứng khoán',
      symbol: 'Symbol',
      isinCode: 'ISIN Code',
      domainCode: 'Miền thanh toán'
    };
    return labels[fieldName] || fieldName;
  }
  
  isSecuritiesFieldInvalid(fieldName: string): boolean {
    const field = this.securitiesForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }
}
