import { Model, HydratedDocument } from 'mongoose';
import { CreatePostLikeData } from './post-likes.dto';
import { PostLikes } from '../../application/post-likes.entity';

export type PostLikesModelStaticType = {
  createLike: (newLike: CreatePostLikeData) => PostLikesDocument;
};

export type PostLikesMethodsType = {
  isLikeDataEqualsLike: () => boolean;
  isLikeDataEqualsDislike: () => boolean;
  isLikeDataEqualsNone: () => boolean;
  updateLikeStatus: (status: 'None' | 'Like' | 'Dislike') => void;
  updateFirstReaction: () => void;
  updateToDeletedLikeOrDislike: () => void;
  returnFromDeleted: (status: 'None' | 'Like' | 'Dislike') => void;
};

export type PostLikesDocument = HydratedDocument<
  PostLikes,
  PostLikesMethodsType
>;

export type PostLikesModelType = Model<PostLikesDocument> &
  PostLikesModelStaticType;
