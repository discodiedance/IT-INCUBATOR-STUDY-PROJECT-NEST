import { Model, HydratedDocument } from 'mongoose';
import { CreateCommentLikeData } from './comment-likes.dto';
import { CommentLikes } from '../../application/comment-likes.entity';

export type CommentLikesModelStaticType = {
  createLike: (newLike: CreateCommentLikeData) => CommentLikesDocument;
};

export type CommentLikesMethodsType = {
  isLikeDataEqualsLike: () => boolean;
  isLikeDataEqualsDislike: () => boolean;
  isLikeDataEqualsNone: () => boolean;
  updateLikeStatus: (status: 'None' | 'Like' | 'Dislike') => void;
};

export type CommentLikesDocument = HydratedDocument<
  CommentLikes,
  CommentLikesMethodsType
>;

export type CommentLikesModelType = Model<CommentLikesDocument> &
  CommentLikesModelStaticType;
