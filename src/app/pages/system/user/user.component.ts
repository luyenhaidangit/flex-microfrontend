import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from 'src/app/core/services/system.service';
import { UserService } from './user.service';
import { UserItem } from './user.models';
import { USER_CONFIG } from './user.config';
import { UserFilter } from './user.models';
import { EntityListComponent } from 'src/app/core/components/base/entity-list.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
	selector: 'app-users',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})

export class UsersComponent extends EntityListComponent<UserFilter> implements OnInit, OnDestroy {
	
	CONFIG = USER_CONFIG;
	
	branches: { id: number; name: string }[] = [];
	
	@ViewChild('createUserModal') createUserModalTemplateRef!: TemplateRef<any>;
	@ViewChild('deleteUserModal') deleteUserModalTemplateRef!: TemplateRef<any>;
	@ViewChild('approveUserModal') approveUserModalTemplateRef!: TemplateRef<any>;
	@ViewChild('rejectUserModal') rejectUserModalTemplateRef!: TemplateRef<any>;
	modalRef?: BsModalRef | null = null;
	deleteModalRef?: BsModalRef | null = null;
	approveModalRef?: BsModalRef | null = null;
	rejectModalRef?: BsModalRef | null = null;
	isDeleteModalVisible = false;
	selectedRequest: any = null;
	
	constructor(
		private userService: UserService,
		private systemService: SystemService,
		private toast: ToastService,
		private modalService: BsModalService
	) {
		super({ keyword: '', branchId: null, type: null });
	}
	
	ngOnInit(): void {		
		this.loadingTable = true;
		
		const branchesCall = this.systemService.getBranchesForFilter();
		const usersCall = this.userService.getUsers(this.getCleanSearchParams());
		
		// Load branches and users in parallel
		forkJoin({
			branches: branchesCall,
			users: usersCall
		}).pipe(
			takeUntil(this.destroy$),
			finalize(() => {
				this.loadingTable = false;
			})
		).subscribe({
			next: ({ branches, users }) => {
				
				// Handle branches
				if (branches?.isSuccess) {
					this.branches = branches.data || [];
				} else {
					this.branches = [];
				}
				
				// Handle users
				if (users?.isSuccess) {
					const { items, pageMeta } = this.extractPagingFromResponse<UserItem>(users.data);
					this.items = items as UserItem[];
					this.updatePagingState(pageMeta);
				} else {
					this.items = [];
				}
			},
			error: (err) => {
				this.branches = [];
				this.items = [];
			}
		});
	}
	
	ngOnDestroy(): void {
		this.cleanup();
	}
	
	// Implement method abstract base
	public onSearch(): void {
		if (this.activeTabId === 'approved') {
			this.loadData<UserItem>(this.userService.getUsers(this.getCleanSearchParams()));
		} else {
			this.loadData<any>(this.userService.getPendingUserRequests(this.getCleanSearchParams()));
		}
	}
	
	onTabChange(tabId: string): void {
		this.activeTabId = tabId;
		this.onSearch();
	}
	
	
	openCreateModal(): void {
		console.log('openCreateModal');
		this.modalRef = this.modalService.show(this.createUserModalTemplateRef, {
			class: 'modal-xl',
			backdrop: 'static',
			keyboard: false
		});
	}
	
	openDetailModal(user: UserItem): void {
		super.openDetailModal(user);
	}
	
	openEditModal(user: UserItem): void {
		console.log('openEditModal', user);
		super.openEditModal(user);
	}
	
	openDeleteModal(user: UserItem): void {
		console.log('openDeleteModal', user);
		this.selectedItem = user;
		this.isDeleteModalVisible = true;
		this.deleteModalRef = this.modalService.show(this.deleteUserModalTemplateRef, {
			class: 'modal-xl',
			backdrop: 'static',
			keyboard: false
		});
	}
	
	// Pending request methods
	openPendingDetailModal(request: any): void {
		console.log('openPendingDetailModal', request);
		// TODO: Implement pending detail modal
	}
	
	openApproveModal(request: any): void {
		this.selectedRequest = request;
		this.approveModalRef = this.modalService.show(this.approveUserModalTemplateRef, {
			class: 'modal-xl',
			backdrop: 'static',
			keyboard: false,
			ignoreBackdropClick: true
		});
	}
	
	openRejectModal(request: any): void {
		console.log('openRejectModal', request);
		this.selectedRequest = request;
		this.rejectModalRef = this.modalService.show(this.rejectUserModalTemplateRef, {
			class: 'modal-xl',
			backdrop: 'static',
			keyboard: false,
			ignoreBackdropClick: true
		});
	}
	
	// Handle approve success
	onUserApproved(result: any): void {
		console.log('User request approved:', result);
		this.toast.success('Phê duyệt yêu cầu thành công!');
		this.approveModalRef?.hide();
		this.onSearch();
	}
	
	// Handle reject success
	onUserRejected(result: any): void {
		console.log('User request rejected:', result);
		this.toast.success('Từ chối yêu cầu thành công!');
		this.rejectModalRef?.hide();
		this.onSearch();
	}
	
	// Modal methods
	onDetailModalClose(): void {
		super.onDetailModalClose();
	}
	
	onCreateModalClose(): void {
		this.modalRef?.hide();
	}
	
	onUserCreated(): void {
		this.modalRef?.hide();
		// Reload data after user is created
		this.onSearch();
	}
	
	onEditModalClose(): void {
		super.onEditModalClose();
	}
	
	onUserUpdated(): void {
		super.onEditModalClose();
		// Reload data after user is updated
		this.onSearch();
	}
	
	onDeleteModalClose(): void {
		this.isDeleteModalVisible = false;
		this.deleteModalRef?.hide();
		this.selectedItem = null;
	}
	
	onUserDeleted(): void {
		this.isDeleteModalVisible = false;
		this.deleteModalRef?.hide();
		this.selectedItem = null;
		// Reload data after user delete request is sent
		this.onSearch();
	}
}