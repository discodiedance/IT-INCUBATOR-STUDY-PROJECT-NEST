import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CreateCommentLikeData } from '../api/models/comment-likes.dto';
import { CommentLikesDocument } from '../api/models/comment-likes.entities';

@Schema()
export class CommentLikes {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  commentId: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: true })
  parentId: string;

  static createLike(newLike: CreateCommentLikeData): CommentLikesDocument {
    const likeData = new this();

    likeData.id = new ObjectId().toString();
    likeData.commentId = newLike.comment.id;
    likeData.createdAt = new Date().toISOString();
    likeData.status = newLike.likeStatus;
    likeData.parentId = newLike.parentId;
    return likeData as CommentLikesDocument;
  }

  isLikeDataEqualsLike() {
    return this.status === 'Like';
  }

  isLikeDataEqualsDislike() {
    return this.status === 'Dislike';
  }

  isLikeDataEqualsNone() {
    return this.status === 'None';
  }

  updateLikeStatus(status: 'None' | 'Like' | 'Dislike') {
    this.status = status;
  }
}

export const CommentLikesSchema = SchemaFactory.createForClass(CommentLikes);

CommentLikesSchema.statics = {
  createLike: CommentLikes.createLike,
};

CommentLikesSchema.methods = {
  isLikeDataEqualsLike: CommentLikes.prototype.isLikeDataEqualsLike,
  isLikeDataEqualsDislike: CommentLikes.prototype.isLikeDataEqualsDislike,
  isLikeDataEqualsNone: CommentLikes.prototype.isLikeDataEqualsNone,
  updateLikeStatus: CommentLikes.prototype.updateLikeStatus,
};

CommentLikesSchema.loadClass(CommentLikes);
