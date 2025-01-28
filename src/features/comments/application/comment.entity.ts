import { OutputUserType } from '../../users/api/models/dto/output';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CreateCommentDataType } from '../api/models/comment.dto';
import { CommentDocument } from '../api/models/comment.entities';

@Schema({ id: false, versionKey: false })
class CommentatorInfo {
  userId: string;
  userLogin: string;
}

@Schema({ id: false, versionKey: false })
class CommentLikesInfo {
  likesCount: number;
  dislikesCount: number;
}

@Schema()
export class Comment {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Object, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: Object, required: true })
  likesInfo: CommentLikesInfo;

  // static createComment(newComment: CreateCommentDataType): CommentDocument {
  //   const comment = new this();

  //   comment.id = new ObjectId().toString();
  //   comment.content = newComment.content;
  //   comment.commentatorInfo = newComment.commentatorInfo;
  //   comment.createdAt = new Date().toISOString();
  //   comment.postId = newComment.postId;
  //   comment.likesInfo = {
  //     likesCount: 0,
  //     dislikesCount: 0,
  //   };

  //   return comment ;
  // }

  updateComment(content: string) {
    this.content = content;
  }

  isCommentatorIdAndLoginEqual(user: OutputUserType) {
    return (
      this.commentatorInfo.userId == user.id &&
      this.commentatorInfo.userLogin == user.login
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

// CommentSchema.statics = {
//   createComment: Comment.createComment,
// };

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

CommentSchema.loadClass(Comment);
