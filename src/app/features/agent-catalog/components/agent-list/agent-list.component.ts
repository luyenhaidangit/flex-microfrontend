import { Component, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize } from 'rxjs/operators';
import { BadgeTypeConfig } from 'src/app/shared/ui/badge/badge.component';
import { Agent } from '../../models/agent.model';
import { AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss']
})
export class AgentListComponent implements OnInit {
  agents: Agent[] = [];
  isLoading = false;

  readonly agentStatusConfigs: BadgeTypeConfig = {
    active:   { label: 'Hoạt động',     class: 'badge-soft-success',   value: 'active' },
    inactive: { label: 'Không hoạt động', class: 'badge-soft-danger',    value: 'inactive' },
  };

  showFormModal = false;
  showDeleteModal = false;
  selectedAgent: Agent | null = null;

  constructor(
    private agentService: AgentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    this.isLoading = true;
    this.agentService
      .getAgents()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (agents) => (this.agents = agents),
        error: () => this.toastService.error('Không thể tải danh mục Agent.')
      });
  }

  openCreateModal(): void {
    this.selectedAgent = null;
    this.showFormModal = true;
  }

  openEditModal(agent: Agent): void {
    this.selectedAgent = agent;
    this.showFormModal = true;
  }

  openDeleteModal(agent: Agent): void {
    this.selectedAgent = agent;
    this.showDeleteModal = true;
  }

  onFormModalClose(): void {
    this.showFormModal = false;
    this.selectedAgent = null;
  }

  onAgentSaved(): void {
    this.onFormModalClose();
    this.loadAgents();
  }

  onDeleteModalClose(): void {
    this.showDeleteModal = false;
    this.selectedAgent = null;
  }

  onAgentDeleted(): void {
    this.onDeleteModalClose();
    this.loadAgents();
  }
}
