import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDataType, UpdatePostDataType } from './post.dto';
import { Post } from '../../application/post.entity';

export type PostModelStaticType = {
  createPost: (newPost: CreatePostDataType) => PostDocument;
};

export type PostModelMethodsType = {
  updatePost: (updateData: UpdatePostDataType) => void;
  removeLikeAddDislikeCounter: () => void;
  removeDislikeAddLikeCounter: () => void;
  removeLikeCounter: () => void;
  removeDislikeCounter: () => void;
  addLikeCounter: () => void;
  addDislikeCounter: () => void;
};

export type PostDocument = HydratedDocument<Post, PostModelMethodsType>;

export type PostModelType = Model<PostDocument> & PostModelStaticType;
