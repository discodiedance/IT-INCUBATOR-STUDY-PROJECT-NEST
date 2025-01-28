import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CreatePostDataType, UpdatePostDataType } from '../api/models/post.dto';
import { PostDocument } from '../api/models/post.entities';

@Schema({ id: false, versionKey: false })
class PostLikesInfo {
  likesCount: number;
  dislikesCount: number;
  newestLikes:
    | {
        addedAt: string;
        userId: string;
        login: string;
      }[]
    | [];
}

@Schema()
export class Post {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: Object, required: true })
  likesInfo: PostLikesInfo;

  static createPost(newPost: CreatePostDataType): PostDocument {
    const post = new this();

    post.id = new ObjectId().toString();
    post.title = newPost.title;
    post.shortDescription = newPost.shortDescription;
    post.content = newPost.content;
    post.blogId = newPost.blogId;
    post.blogName = newPost.blogName;
    post.createdAt = new Date().toISOString();
    post.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    };

    return post as PostDocument;
  }

  updatePost(updateData: UpdatePostDataType) {
    this.title = updateData.title;
    this.shortDescription = updateData.shortDescription;
    this.content = updateData.content;
    this.blogId = updateData.blogId;
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

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.statics = {
  createPost: Post.createPost,
};

PostSchema.methods = {
  updatePost: Post.prototype.updatePost,
  removeLikeAddDislikeCounter: Post.prototype.removeLikeAddDislikeCounter,
  removeDislikeAddLikeCounter: Post.prototype.removeDislikeAddLikeCounter,
  removeLikeCounter: Post.prototype.removeLikeCounter,
  removeDislikeCounter: Post.prototype.removeDislikeCounter,
  addLikeCounter: Post.prototype.addLikeCounter,
  addDislikeCounter: Post.prototype.addDislikeCounter,
};

PostSchema.loadClass(Post);
