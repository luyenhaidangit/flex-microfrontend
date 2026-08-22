import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-agent-step-publish',
  templateUrl: './agent-step-publish.component.html',
  styleUrls: ['../../agent-create-wizard.component.scss']
})
export class AgentStepPublishComponent {
  @Input() publishChannels: any[] = [];
  @Input() websiteUrl = '';
  @Output() toggleChannel = new EventEmitter<any>();
  @Output() copyWebsiteUrl = new EventEmitter<void>();

  onToggle(channel: any): void {
    this.toggleChannel.emit(channel);
  }

  onCopyLink(): void {
    this.copyWebsiteUrl.emit();
  }
}
