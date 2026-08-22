import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-agent-step-general',
  templateUrl: './agent-step-general.component.html',
  styleUrls: ['../../agent-create-wizard.component.scss']
})
export class AgentStepGeneralComponent {
  @Input() formGroup!: FormGroup;
  @Input() avatarFile: File | null = null;
  @Input() avatarError = '';

  @Output() avatarSelected = new EventEmitter<Event>();

  public Editor = ClassicEditor;
  public editorConfig = {
    toolbar: ['heading', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
  };

  collapsedSections: { [key: string]: boolean } = {
    basicInfo: false,
    instructions: false
  };

  get f() {
    return this.formGroup.controls;
  }

  toggleSection(key: string): void {
    this.collapsedSections[key] = !this.collapsedSections[key];
  }

  isSectionCollapsed(key: string): boolean {
    return !!this.collapsedSections[key];
  }

  onAvatarChange(event: Event): void {
    this.avatarSelected.emit(event);
  }
}
