import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { finalize } from 'rxjs/operators';
import { BadgeTypeConfig } from 'src/app/shared/ui/badge/badge.component';
import { PaginationState } from 'src/app/core/components/pagination/pagination/pagination.component';
import { ViewMode } from 'src/app/shared/ui/view-toggle/view-toggle.component';
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

  viewMode: ViewMode = 'card';

  agents: Agent[] = [];
  filteredAgents: Agent[] = [];
  isLoading = false;

  searchInputValue: string = '';
  searchKeyword: string = '';

  categories: string[] = ['Tất cả', 'Nội bộ', 'Tài chính - Kế toán', 'Marketing'];
  selectedCategory: string = 'Tất cả';

  currentPage = 1;
  pageSize = 9;

  readonly agentStatusConfigs: BadgeTypeConfig = {
    active:   { label: 'Đã phát hành',     class: 'badge-soft-success',   value: 'active' },
    inactive: { label: 'Chưa phát hành',   class: 'badge-soft-secondary', value: 'inactive' },
  };

  showFormModal = false;
  showDeleteModal = false;
  selectedAgent: Agent | null = null;

  constructor(
    private agentService: AgentService,
    private toastService: ToastService,
    private router: Router
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

  onCategorySelect(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.agents];

    if (this.searchKeyword) {
      const kw = this.searchKeyword.toLowerCase();
      result = result.filter(
        (a) =>
          (a.name && a.name.toLowerCase().includes(kw)) ||
          (a.description && a.description.toLowerCase().includes(kw))
      );
    }

    if (this.selectedCategory !== 'Tất cả') {
      result = result.filter((a) => this.getAgentCategory(a) === this.selectedCategory);
    }

    this.filteredAgents = result;
  }

  getAgentCategory(agent: Agent): string {
    const text = ((agent.name || '') + ' ' + (agent.description || '')).toLowerCase();
    if (text.includes('kế toán') || text.includes('tài chính') || text.includes('thu chi') || text.includes('111')) {
      return 'Tài chính - Kế toán';
    }
    if (text.includes('marketing') || text.includes('truyền thông') || text.includes('bài')) {
      return 'Marketing';
    }
    return 'Nội bộ';
  }

  getAvatarInitials(name: string): string {
    if (!name) return 'AG';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  getAvatarColorClass(index: number): string {
    const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-purple', 'bg-warning', 'bg-danger'];
    return colors[index % colors.length];
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
    this.router.navigate(['/agents/create']);
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
