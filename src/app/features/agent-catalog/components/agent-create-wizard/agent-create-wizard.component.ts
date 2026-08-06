import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { AgentService } from '../../services/agent.service';

export interface WizardStepItem {
  id: number;
  title: string;
  icon: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

@Component({
  selector: 'app-agent-create-wizard',
  templateUrl: './agent-create-wizard.component.html',
  styleUrls: ['./agent-create-wizard.component.scss']
})
export class AgentCreateWizardComponent implements OnInit {
  activeTab: 'info' | 'chat' | 'report' = 'info';
  currentStep = 1;
  isSidebarCollapsed = false;

  isSubmitting = false;
  showConfirmCancelModal = false;

  wizardForm!: FormGroup;

  steps: WizardStepItem[] = [
    { id: 1, title: 'Thiết lập thông tin chung', icon: 'bx-slider-alt', isCompleted: false, isActive: true },
    { id: 2, title: 'Thêm tri thức', icon: 'bx-book-open', isCompleted: false, isActive: false },
    { id: 3, title: 'Thiết lập kỹ năng', icon: 'bx-extension', isCompleted: false, isActive: false },
    { id: 4, title: 'Đào tạo Agent', icon: 'bx-bulb', isCompleted: false, isActive: false },
    { id: 5, title: 'Phát hành', icon: 'bx-send', isCompleted: false, isActive: false }
  ];

  avatarPresets = [
    { id: '1', url: 'assets/images/users/avatar-1.jpg' },
    { id: '2', url: 'assets/images/users/avatar-2.jpg' },
    { id: '3', url: 'assets/images/users/avatar-3.jpg' },
    { id: '4', url: 'assets/images/users/avatar-4.jpg' },
    { id: '5', url: 'assets/images/users/avatar-5.jpg' },
    { id: '6', url: 'assets/images/users/avatar-6.jpg' }
  ];

  // Test Chat Messages
  chatMessages: ChatMessage[] = [];
  chatInputText: string = '';

  defaultInstructions = `I. Vai trò
- Là Nhân viên AI Chăm sóc Khách hàng sau bán của doanh nghiệp.
- Hỗ trợ khách hàng trong quá trình sử dụng sản phẩm hoặc dịch vụ.
- Giải đáp thắc mắc, hướng dẫn thao tác, tiếp nhận và xử lý vấn đề phát sinh.
- Cung cấp thông tin liên quan đến: Chính sách bảo hành, Hướng dẫn thanh toán...`;

  currentTimeFormatted: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private agentService: AgentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.currentTimeFormatted = `${now.toLocaleDateString('vi-VN')} ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    this.initForm();
  }

  initForm(): void {
    this.wizardForm = this.fb.group({
      avatarUrl: ['assets/images/users/avatar-1.jpg'],
      name: ['Thảo CSKH', [Validators.required]],
      role: ['Nhân viên AI chăm sóc khách hàng', [Validators.required]],
      instructions: [this.defaultInstructions, [Validators.required]]
    });
  }

  get f() {
    return this.wizardForm.controls;
  }

  onSelectAvatar(url: string): void {
    this.wizardForm.patchValue({ avatarUrl: url });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onStepClick(stepId: number): void {
    this.currentStep = stepId;
    this.steps.forEach((s) => (s.isActive = s.id === stepId));
  }

  onSendMessage(): void {
    if (!this.chatInputText.trim()) return;

    const userText = this.chatInputText.trim();
    this.chatMessages.push({
      sender: 'user',
      text: userText,
      time: 'Vừa xong'
    });
    this.chatInputText = '';

    // Auto bot response
    setTimeout(() => {
      this.chatMessages.push({
        sender: 'agent',
        text: `Cảm ơn anh/chị. Em (${this.f['name'].value}) đã nhận được câu hỏi "${userText}". Em có thể hỗ trợ thông tin chi tiết gì cho anh/chị ạ?`,
        time: 'Vừa xong'
      });
    }, 600);
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

  onSaveDraft(): void {
    this.toastService.info('Đã lưu bản nháp thông tin Agent.');
  }

  onPublish(): void {
    if (this.wizardForm.invalid) {
      this.wizardForm.markAllAsTouched();
      this.toastService.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    this.isSubmitting = true;
    const formVal = this.wizardForm.value;
    const payload = {
      name: formVal.name,
      description: formVal.role,
      status: 'active'
    };

    this.agentService.createAgent(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success('Khởi tạo và phát hành Agent thành công!');
        this.router.navigate(['/agents']);
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    });
  }
}
