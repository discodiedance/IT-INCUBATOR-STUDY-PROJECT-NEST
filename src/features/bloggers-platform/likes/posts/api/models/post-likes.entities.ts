import { Model, HydratedDocument } from 'mongoose';
import { PostLikes } from '../../application/post-likes.entity';
import { CreatePostLikeDataType } from './dto/post-likes.dto';

export type PostLikesModelStaticType = {
  createLike: (newLike: CreatePostLikeDataType) => PostLikesDocument;
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
