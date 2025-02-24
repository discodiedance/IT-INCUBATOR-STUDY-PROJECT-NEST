import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CommentDocument } from '../api/models/comment.entities';
import {
  CreateCommentDataType,
  UpdateCommentDataType,
} from '../api/models/dto/comment.dto';
import { commentContentConstraints } from '../constants/validation-constants';
import { UserDocument } from '../../../user-accounts/users/api/models/user.enitities';

@Schema({ id: false, versionKey: false })
class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  userLogin: string;
}

@Schema({ id: false, versionKey: false })
class CommentLikesInfo {
  @Prop({ type: Number, required: true })
  likesCount: number;
  @Prop({ type: Number, required: true })
  dislikesCount: number;
}

@Schema()
export class Comment {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true, ...commentContentConstraints })
  content: string;

  @Prop({ type: Object, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: Object, required: true })
  likesInfo: CommentLikesInfo;

  static createComment(newComment: CreateCommentDataType): CommentDocument {
    const comment = new this();

    comment.id = new ObjectId().toString();
    comment.content = newComment.content;
    comment.commentatorInfo = {
      userId: newComment.commentatorInfo.userId,
      userLogin: newComment.commentatorInfo.userLogin,
    };
    comment.createdAt = new Date().toISOString();
    comment.postId = newComment.postId;
    comment.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };

    return comment as CommentDocument;
  }

  updateComment(updateData: UpdateCommentDataType) {
    this.content = updateData.content;
  }

  isCommentatorIdAndLoginEqual(user: UserDocument) {
    return (
      this.commentatorInfo.userId == user.id &&
      this.commentatorInfo.userLogin == user.accountData.login
    );
  }

  removeLikeAddDislikeCounter() {
    this.likesInfo.likesCount -= 1;
    this.likesInfo.dislikesCount += 1;
  }

  removeDislikeAddLikeCounter() {
    this.likesInfo.likesCount += 1;
    this.likesInfo.dislikesCount -= 1;
  }

  removeLikeCounter() {
    this.likesInfo.likesCount -= 1;
  }

  removeDislikeCounter() {
    this.likesInfo.dislikesCount -= 1;
  }

  addLikeCounter() {
    this.likesInfo.likesCount += 1;
  }

  addDislikeCounter() {
    this.likesInfo.dislikesCount += 1;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  updateComment: Comment.prototype.updateComment,
  isCommentatorIdAndLoginEqual: Comment.prototype.isCommentatorIdAndLoginEqual,
  removeLikeAddDislikeCounter: Comment.prototype.removeLikeAddDislikeCounter,
  removeDislikeAddLikeCounter: Comment.prototype.removeDislikeAddLikeCounter,
  removeLikeCounter: Comment.prototype.removeLikeCounter,
  removeDislikeCounter: Comment.prototype.removeDislikeCounter,
  addLikeCounter: Comment.prototype.addLikeCounter,
  addDislikeCounter: Comment.prototype.addDislikeCounter,
};

CommentSchema.statics = {
  createComment: Comment.createComment,
};

CommentSchema.loadClass(Comment);
