import { Component, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize } from 'rxjs/operators';
import { BadgeTypeConfig } from 'src/app/shared/ui/badge/badge.component';
import { PaginationState } from 'src/app/core/components/pagination/pagination/pagination.component';
import { Agent } from '../../models/agent.model';
import { AgentService } from '../../services/agent.service';
import { AGENT_LIST_CONFIG } from './agent-list.config';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss']
})
export class AgentListComponent implements OnInit {
  CONFIG = AGENT_LIST_CONFIG;

  agents: Agent[] = [];
  filteredAgents: Agent[] = [];
  isLoading = false;

  searchInputValue: string = '';
  searchKeyword: string = '';

  currentPage = 1;
  pageSize = 10;

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
        next: (agents) => {
          this.agents = agents || [];
          this.applyFilter();
        },
        error: () => this.toastService.error('Không thể tải danh mục Agent.')
      });
  }

  onSearchClick(): void {
    this.searchKeyword = this.searchInputValue.trim();
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.searchKeyword) {
      this.filteredAgents = [...this.agents];
    } else {
      const kw = this.searchKeyword.toLowerCase();
      this.filteredAgents = this.agents.filter(
        (a) =>
          (a.name && a.name.toLowerCase().includes(kw)) ||
          (a.description && a.description.toLowerCase().includes(kw))
      );
    }
  }

  get paginatedAgents(): Agent[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredAgents.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginationState(): PaginationState {
    const totalItems = this.filteredAgents.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    return {
      index: this.currentPage,
      size: this.pageSize,
      totalItems,
      totalPages
    };
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(pageSize: number): void {
    if (pageSize !== undefined) {
      this.pageSize = pageSize;
    }
    this.currentPage = 1;
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
