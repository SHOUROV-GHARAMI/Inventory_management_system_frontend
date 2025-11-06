import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Comment {
  id: number;
  content: string;
  userId: number;
  username: string;
  inventoryId: number;
  createdAt: Date;
}

export interface CreateCommentDto {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  constructor(private api: ApiService) {}

  getComments(inventoryId: number, params?: any): Observable<Comment[]> {
    return this.api.get<Comment[]>(`inventories/${inventoryId}/comments`, params);
  }

  createComment(inventoryId: number, comment: CreateCommentDto): Observable<Comment> {
    return this.api.post<Comment>(`inventories/${inventoryId}/comments`, comment);
  }

  deleteComment(inventoryId: number, commentId: number): Observable<void> {
    return this.api.delete<void>(`inventories/${inventoryId}/comments/${commentId}`);
  }
}
