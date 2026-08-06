import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { AgentService } from '../../services/agent.service';

export interface WizardStepItem {
  id: number;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface AvatarPresetItem {
  id: string;
  url: string;
}

@Component({
  selector: 'app-agent-create-wizard',
  templateUrl: './agent-create-wizard.component.html',
  styleUrls: ['./agent-create-wizard.component.scss']
})
export class AgentCreateWizardComponent implements OnInit {
  currentStep = 1;
  isSubmitting = false;
  showConfirmCancelModal = false;

  wizardForm!: FormGroup;

  steps: WizardStepItem[] = [
    { id: 1, title: 'Thiết lập thông tin chung', isCompleted: false, isActive: true },
    { id: 2, title: 'Thêm thủ tục hành chính Công an', isCompleted: false, isActive: false },
    { id: 3, title: 'Thêm thông tin Cơ quan Công an', isCompleted: false, isActive: false },
    { id: 4, title: 'Thêm văn bản khác', isCompleted: false, isActive: false },
    { id: 5, title: 'Thiết lập kỹ năng', isCompleted: false, isActive: false },
    { id: 6, title: 'Kiểm tra nhân viên AI', isCompleted: false, isActive: false },
    { id: 7, title: 'Phát hành', isCompleted: false, isActive: false }
  ];

  avatarPresets: AvatarPresetItem[] = [
    { id: '1', url: 'assets/images/default-agent-avatar.png' },
    { id: '2', url: 'assets/images/users/avatar-1.jpg' },
    { id: '3', url: 'assets/images/users/avatar-2.jpg' },
    { id: '4', url: 'assets/images/users/avatar-3.jpg' },
    { id: '5', url: 'assets/images/users/avatar-4.jpg' },
    { id: '6', url: 'assets/images/users/avatar-5.jpg' }
  ];

  organizations: string[] = [
    'Công an Tỉnh Đồng Nai',
    'Công an Thành phố Hồ Chí Minh',
    'Công an Thành phố Hà Nội',
    'Công an Tỉnh Bình Dương',
    'Công an Xã Hưng Lộc'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private agentService: AgentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.wizardForm = this.fb.group({
      avatarUrl: ['assets/images/default-agent-avatar.png'],
      name: ['Mai Hương', [Validators.required]],
      role: ['Nhân viên AI tư vấn tại cơ quan Công an', [Validators.required]],
      executionLevel: ['province', [Validators.required]],
      organization: ['', [Validators.required]],
      instructions: ['', [Validators.required]]
    });
  }

  get f() {
    return this.wizardForm.controls;
  }

  onSelectAvatar(url: string): void {
    this.wizardForm.patchValue({ avatarUrl: url });
  }

  onStepClick(stepId: number): void {
    // Chỉ cho phép chuyển lại các bước đã đi qua hoặc bước kế tiếp khi bước hiện tại valid
    if (stepId < this.currentStep) {
      this.goToStep(stepId);
    } else if (stepId === this.currentStep + 1) {
      this.onNextStep();
    }
  }

  goToStep(stepId: number): void {
    this.currentStep = stepId;
    this.steps.forEach((s) => {
      s.isActive = s.id === stepId;
    });
  }

  onNextStep(): void {
    if (this.currentStep === 1) {
      if (this.wizardForm.invalid) {
        this.wizardForm.markAllAsTouched();
        this.toastService.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
        return;
      }
      this.steps[0].isCompleted = true;
      this.goToStep(2);
    } else if (this.currentStep < 7) {
      this.steps[this.currentStep - 1].isCompleted = true;
      this.goToStep(this.currentStep + 1);
    } else if (this.currentStep === 7) {
      this.onPublish();
    }
  }

  onPrevStep(): void {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  onCancel(): void {
    if (this.wizardForm.dirty) {
      this.showConfirmCancelModal = true;
    } else {
      this.confirmExit();
    }
  }

  confirmExit(): void {
    this.showConfirmCancelModal = false;
    this.router.navigate(['/agents']);
  }

  closeCancelModal(): void {
    this.showConfirmCancelModal = false;
  }

  onPublish(): void {
    if (this.wizardForm.invalid) {
      this.wizardForm.markAllAsTouched();
      this.toastService.error('Vui lòng kiểm tra lại thông tin.');
      return;
    }

    this.isSubmitting = true;
    const formVal = this.wizardForm.value;
    const payload = {
      name: formVal.name,
      description: `${formVal.role} - ${formVal.organization}`,
      status: 'active'
    };

    this.agentService.createAgent(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success('Tạo mới Agent thành công!');
        this.router.navigate(['/agents']);
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.error('Không thể tạo mới Agent. Vui lòng thử lại.');
      }
    });
  }
}
