import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { AgentService } from '../../services/agent.service';
import { AuthenticationService } from '../../../../core/auth/auth.service';
import { AgentChatService } from '../../services/agent-chat.service';

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
export class AgentCreateWizardComponent implements OnInit, OnDestroy {
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

  // Danh sách Avatar Presets - Đặt default-agent-avatar.png lên đầu tiên chuẩn màn list
  avatarPresets = [
    { id: 'default', url: 'assets/images/default-agent-avatar.png' },
    { id: '1', url: 'assets/images/users/avatar-1.jpg' },
    { id: '2', url: 'assets/images/users/avatar-2.jpg' },
    { id: '3', url: 'assets/images/users/avatar-3.jpg' },
    { id: '4', url: 'assets/images/users/avatar-4.jpg' },
    { id: '5', url: 'assets/images/users/avatar-5.jpg' }
  ];

  // Test Chat Messages
  chatMessages: ChatMessage[] = [];
  chatInputText: string = '';
  currentUserId = '';
  isChatPending = false;
  chatError = '';
  conversationId = `agent-wizard-${Date.now()}`;

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
    private toastService: ToastService,
    private readonly authenticationService: AuthenticationService,
    private readonly chatService: AgentChatService,
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.currentTimeFormatted = `${now.toLocaleDateString('vi-VN')} ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    this.initForm();
    this.authenticationService.getProfile$().subscribe(profile => {
      this.currentUserId = profile?.userName ?? '';
    });
  }

  ngOnDestroy(): void {
    // Preview state is local to the wizard and has no realtime subscription.
  }

  initForm(): void {
    this.wizardForm = this.fb.group({
      avatarUrl: ['assets/images/default-agent-avatar.png'], // Mặc định là avatar như ở màn list
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
    const userText = this.chatInputText.trim();
    if (!userText || this.isChatPending || this.wizardForm.invalid) return;

    this.chatInputText = '';
    this.chatMessages.push({
      sender: 'user', text: userText, time: this.formatTime(new Date())
    });
    this.isChatPending = true;
    this.chatError = '';
    this.chatService.chat({ conversationId: this.conversationId, message: userText }).subscribe({
      next: response => { this.chatMessages.push({ sender: 'agent', text: response.reply, time: this.formatTime(new Date()) }); this.isChatPending = false; },
      error: () => { this.chatError = 'Không thể nhận phản hồi từ Agent. Vui lòng thử lại.'; this.isChatPending = false; }
    });
  }

  private formatTime(date: Date): string {
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
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
