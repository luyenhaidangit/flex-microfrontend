import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-agent-step-publish',
  templateUrl: './agent-step-publish.component.html',
  styleUrls: ['../../agent-create-wizard.component.scss']
})
export class AgentStepPublishComponent {
  @Input() publishChannels: any[] = [];
  @Output() toggleChannel = new EventEmitter<any>();

  onToggle(channel: any): void {
    this.toggleChannel.emit(channel);
  }
}
