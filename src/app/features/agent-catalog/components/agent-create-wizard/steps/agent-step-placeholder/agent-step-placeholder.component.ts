import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-agent-step-placeholder',
  templateUrl: './agent-step-placeholder.component.html',
  styleUrls: ['../../agent-create-wizard.component.scss']
})
export class AgentStepPlaceholderComponent {
  @Input() title = '';
}
