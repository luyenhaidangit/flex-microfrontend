import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { ChatUser, ChatMessage } from './chat.model';

import { chatData, chatMessagesData } from './data';
import { ConversationApiService } from '../../core/conversations/conversation-api.service';
import { Conversation } from '../../core/conversations/conversation.models';
import { ApplicationRealtimeService } from '../../core/realtime/application-realtime.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {

  @ViewChild('scrollEle') scrollEle;
  @ViewChild('scrollRef') scrollRef;

  username = 'Steven Franklin';

  // bread crumb items
  breadCrumbItems: Array<{}>;
  chatData: ChatUser[];
  chatMessagesData: ChatMessage[];
  formData: UntypedFormGroup;
  // Form submit
  chatSubmit: boolean;
  usermessage: string;
  emoji:any = '';
  conversationId?: string;
  chatError = '';
  isLoading = false;
  isSending = false;
  private realtimeSubscription?: Subscription;

  constructor(
    public formBuilder: UntypedFormBuilder,
    private readonly conversationApi: ConversationApiService,
    private readonly realtimeService: ApplicationRealtimeService,
  ) {
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Skote' }, { label: 'Chat', active: true }];

    this.formData = this.formBuilder.group({
      message: ['', [Validators.required]],
    });

    this.onListScroll();

    this._fetchData();
    this.realtimeSubscription = this.realtimeService.conversationMessages$.subscribe(message => {
      if (message.conversationId !== this.conversationId || this.chatMessagesData.some(item => item.messageId === message.messageId)) return;
      this.chatMessagesData.push({
        align: message.role === 'user' ? 'right' : 'left',
        name: message.actorType === 'ai_agent' ? 'AI Agent' : message.actorType,
        message: message.content ?? '',
        time: new Date(message.occurredAt).toLocaleTimeString(),
        messageId: message.messageId,
      });
      this.onListScroll();
    });
  }

  ngAfterViewInit() {
    this.scrollEle.SimpleBar.getScrollElement().scrollTop = 100;
    this.scrollRef.SimpleBar.getScrollElement().scrollTop = 200;
  }

  /**
   * Returns form
   */
  get form() {
    return this.formData.controls;
  }

  private _fetchData() {
    this.chatData = chatData;
    this.chatMessagesData = chatMessagesData;
    this.isLoading = true;
    this.conversationApi.list().subscribe({
      next: conversations => {
        this.isLoading = false;
        if (conversations.length > 0) this.loadConversation(conversations[0]);
      },
      error: () => {
        this.isLoading = false;
        this.chatError = 'Không thể tải lịch sử hội thoại. Vui lòng thử lại.';
      },
    });
  }

  private loadConversation(conversation: Conversation): void {
    this.conversationId = conversation.id;
    this.username = conversation.title || 'Conversation';
    this.conversationApi.getMessages(conversation.id).subscribe({
      next: messages => {
        this.chatMessagesData = messages.map(message => ({
          align: message.role === 'user' ? 'right' : 'left',
          name: message.actorType === 'ai_agent' ? 'AI Agent' : message.actorType,
          message: message.content ?? '',
          time: new Date(message.createdAt).toLocaleTimeString(),
          messageId: message.id,
        }));
      },
      error: () => this.chatError = 'Không thể tải message của conversation.',
    });
  }

  onListScroll() {
    if (this.scrollRef !== undefined) {
      setTimeout(() => {
        this.scrollRef.SimpleBar.getScrollElement().scrollTop =
          this.scrollRef.SimpleBar.getScrollElement().scrollHeight + 1500;
      }, 500);
    }
  }

  chatUsername(name) {
    this.username = name;
    this.usermessage = 'Hello';
    this.chatMessagesData = [];
    const currentDate = new Date();

    this.chatMessagesData.push({
      name: this.username,
      message: this.usermessage,
      time: currentDate.getHours() + ':' + currentDate.getMinutes()
    });

  }

  /**
   * Save the message in chat
   */
  messageSave() {
    const message = (this.formData.get('message').value || '').trim();
    if (this.formData.valid && message && !this.isSending) {
      this.chatError = '';
      this.isSending = true;
      const request = {
        clientMessageId: this.createClientMessageId(),
        contentType: 'text',
        content: message,
        metadata: {},
      };
      const appendMessage = (conversationId: string) => this.conversationApi.append(conversationId, request);

      const append = this.conversationId
        ? appendMessage(this.conversationId)
        : this.conversationApi.create({ title: this.username }).pipe(
            tap(conversation => this.conversationId = conversation.id),
            switchMap(conversation => appendMessage(conversation.id)),
          );

      append.subscribe({
        next: savedMessage => {
          this.chatMessagesData.push({
            align: savedMessage.role === 'user' ? 'right' : 'left',
            name: savedMessage.actorType === 'ai_agent' ? 'AI Agent' : savedMessage.actorType,
            message: savedMessage.content || message,
            time: new Date(savedMessage.createdAt).toLocaleTimeString(),
            messageId: savedMessage.id,
          });
          this.onListScroll();
          this.formData.reset();
          this.isSending = false;
        },
        error: () => {
          this.chatError = 'Không thể lưu message. Vui lòng thử lại.';
          this.isSending = false;
        },
      });
    }

    this.chatSubmit = true;
  }

  ngOnDestroy(): void {
    this.realtimeSubscription?.unsubscribe();
  }

  private createClientMessageId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  // Delete Message
  deleteMessage(event: any) {
    event.target.closest('li').remove();
  }

  // Copy Message
  copyMessage(event: any) {
    navigator.clipboard.writeText(event.target.closest('li').querySelector('p').innerHTML);
  }

  // Delete All Message
  deleteAllMessage(event: any) {
    var allMsgDelete: any = document.querySelector('.chat-conversation')?.querySelectorAll('li');
    allMsgDelete.forEach((item: any) => {
      item.remove();
    })
  }

  // Emoji Picker
  showEmojiPicker = false;
  sets: any = [
    'native',
    'google',
    'twitter',
    'facebook',
    'emojione',
    'apple',
    'messenger'
  ]
  set: any = 'twitter';
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {

    const { emoji } = this;
    if (this.formData.get('message').value) {
      var text = `${emoji}${event.emoji.native}`;
    } else {
      text = event.emoji.native;
    }
    this.emoji = text;
    this.showEmojiPicker = false;
  }

  onFocus() {
    this.showEmojiPicker = false;
  }

  onBlur() {
  }

  closeReplay() {
    document.querySelector('.replyCard')?.classList.remove('show');
  }

  // Contact Search
  ContactSearch() {
    var input: any, filter: any, ul: any, li: any, a: any | undefined, i: any, txtValue: any;
    input = document.getElementById("searchContact") as HTMLAreaElement;
    filter = input.value.toUpperCase();
    ul = document.querySelectorAll(".chat-list");
    ul.forEach((item: any) => {
      li = item.getElementsByTagName("li");
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("h5")[0];
        txtValue = a?.innerText;
        if (txtValue?.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
      }
    })
  }

}
