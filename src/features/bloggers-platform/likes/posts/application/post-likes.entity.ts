import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { PostLikesDocument } from '../api/models/post-likes.entities';
import { CreatePostLikeDataType } from '../api/models/dto/post-likes.dto';

@Schema()
export class PostLikes {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: String, required: true })
  status: 'Like' | 'Dislike' | 'None';

  @Prop({ type: String, required: true })
  parentId: string;

  @Prop({ type: String, required: true })
  parentLogin: string;

  @Prop({ type: Boolean, required: true, default: true })
  isFirstReaction: boolean;

  @Prop({ type: Boolean, required: true, default: false })
  isDeleted: boolean;

  static createLike(newLike: CreatePostLikeDataType): PostLikesDocument {
    const likeData = new this();

    likeData.id = new ObjectId().toString();
    likeData.postId = newLike.post.id;
    likeData.createdAt = new Date().toISOString();
    likeData.status = newLike.likeStatus;
    likeData.parentId = newLike.parentId;
    likeData.parentLogin = newLike.parentLogin;
    likeData.isFirstReaction = true;
    likeData.isDeleted = false;

    return likeData as PostLikesDocument;
  }

  updateToDeletedLikeOrDislike() {
    this.status = 'None';
    this.isDeleted = true;
  }

  returnFromDeleted(status: 'None' | 'Like' | 'Dislike') {
    this.isDeleted = false;
    this.status = status;
  }

  updateFirstReaction() {
    this.isFirstReaction = false;
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

export const PostLikesSchema = SchemaFactory.createForClass(PostLikes);

PostLikesSchema.statics = {
  createLike: PostLikes.createLike,
};

PostLikesSchema.methods = {
  updateToDeletedLikeOrDislike:
    PostLikes.prototype.updateToDeletedLikeOrDislike,
  returnFromDeleted: PostLikes.prototype.returnFromDeleted,
  updateFirstReaction: PostLikes.prototype.updateFirstReaction,
  isLikeDataEqualsLike: PostLikes.prototype.isLikeDataEqualsLike,
  isLikeDataEqualsDislike: PostLikes.prototype.isLikeDataEqualsDislike,
  isLikeDataEqualsNone: PostLikes.prototype.isLikeDataEqualsNone,
  updateLikeStatus: PostLikes.prototype.updateLikeStatus,
};

PostLikesSchema.loadClass(PostLikes);
