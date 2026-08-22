import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AgentService } from '../../services/agent.service';
import { AgentChatService } from '../../services/agent-chat.service';
import { DEFAULT_AGENT_INSTRUCTIONS_TEMPLATE } from './agent-create-wizard.config';

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

  isSubmitting = false;
  showConfirmCancelModal = false;
  avatarError = '';
  avatarFile: File | null = null;

  wizardForm!: FormGroup;

  steps: WizardStepItem[] = [
    { id: 1, title: 'Thiết lập thông tin chung', icon: 'bx-slider-alt', isCompleted: false, isActive: true },
    { id: 2, title: 'Thêm tri thức', icon: 'bx-book-open', isCompleted: false, isActive: false },
    { id: 3, title: 'Thiết lập kỹ năng', icon: 'bx-extension', isCompleted: false, isActive: false },
    { id: 4, title: 'Đào tạo Agent', icon: 'bx-bulb', isCompleted: false, isActive: false },
    { id: 5, title: 'Phát hành', icon: 'bx-send', isCompleted: false, isActive: false }
  ];

  // Test Chat Messages
  chatMessages: ChatMessage[] = [];
  chatInputText: string = '';
  isChatPending = false;
  chatError = '';
  conversationId = `agent-wizard-${Date.now()}`;
  currentTimeFormatted: string = '';

  publishChannels = [
    {
      code: 'instagram',
      name: 'Instagram Business',
      description: 'Kết nối nhân viên AI với tài khoản Instagram của bạn.',
      iconClass: 'bx bxl-instagram',
      enabled: false
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private agentService: AgentService,
    private toastService: ToastService,
    private readonly chatService: AgentChatService,
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.currentTimeFormatted = `${now.toLocaleDateString('vi-VN')} ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    this.initForm();
  }

  ngOnDestroy(): void {
    // Preview state is local to the wizard and has no realtime subscription.
  }

  initForm(): void {
    this.wizardForm = this.fb.group({
      avatarUrl: ['assets/images/default-agent-avatar.png'], // Mặc định là avatar như ở màn list
      name: ['', [Validators.required]],
      role: ['', [Validators.maxLength(500)]],
      instructions: [DEFAULT_AGENT_INSTRUCTIONS_TEMPLATE, [Validators.required]]
    });
  }

  get f() {
    return this.wizardForm.controls;
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.avatarError = 'Vui lòng chọn ảnh PNG, JPG hoặc WebP.';
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.avatarError = 'Ảnh không được vượt quá 2 MB.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarFile = file;
      this.avatarError = '';
      this.wizardForm.patchValue({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }


  onToggleChannel(channel: any): void {
    channel.enabled = !channel.enabled;
    if (channel.enabled) {
      this.toastService.success(`Đã kích hoạt kênh phát hành ${channel.name}`);
    } else {
      this.toastService.info(`Đã tắt kênh phát hành ${channel.name}`);
    }
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

    this.agentService.createAgent(payload).pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        this.toastService.success('Khởi tạo và phát hành Agent thành công!');
        this.router.navigate(['/agents']);
      },
      error: () => {
      }
    });
  }
}
