import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentsService, Comment, CreateCommentDto } from '../../services/comments.service';
import { AuthService } from '../../services/auth.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-discussion',
  imports: [CommonModule, FormsModule],
  templateUrl: './discussion.html',
  styleUrl: './discussion.scss',
})
export class DiscussionComponent implements OnInit, OnDestroy {
  @Input() inventoryId!: number;

  comments: Comment[] = [];
  newComment = '';
  loading = false;
  submitting = false;
  error = '';
  lastFetchTime: Date | null = null;
  private pollingSubscription?: Subscription;

  constructor(
    private commentsService: CommentsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.inventoryId) {
      this.error = 'Inventory ID is required.';
      return;
    }

    this.loadComments();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadComments(since?: Date): void {
    this.loading = true;
    this.error = '';

    const params = since ? { since: since.toISOString() } : {};

    this.commentsService.getComments(this.inventoryId, params).subscribe({
      next: (data) => {
        if (since) {
          // Add new comments to the list
          this.comments = [...this.comments, ...data];
        } else {
          // Initial load
          this.comments = data;
        }
        this.lastFetchTime = new Date();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load comments.';
        this.loading = false;
      }
    });
  }

  startPolling(): void {
    // Poll every 3 seconds for new comments
    this.pollingSubscription = interval(3000)
      .pipe(
        switchMap(() => {
          const params = this.lastFetchTime ? { since: this.lastFetchTime.toISOString() } : {};
          return this.commentsService.getComments(this.inventoryId, params);
        })
      )
      .subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.comments = [...this.comments, ...data];
            this.lastFetchTime = new Date();
          }
        },
        error: (err) => {
          console.error('Polling error:', err);
        }
      });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  addComment(): void {
    if (!this.newComment.trim()) {
      return;
    }

    this.submitting = true;
    this.error = '';

    const dto: CreateCommentDto = {
      content: this.newComment.trim()
    };

    this.commentsService.createComment(this.inventoryId, dto).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newComment = '';
        this.submitting = false;
        this.lastFetchTime = new Date();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to add comment.';
        this.submitting = false;
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    this.commentsService.deleteComment(this.inventoryId, commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete comment.';
      }
    });
  }

  canDeleteComment(comment: Comment): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;
    return comment.userId === currentUser.id || currentUser.isAdmin;
  }
}
