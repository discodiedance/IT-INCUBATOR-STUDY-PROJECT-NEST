import { Model, HydratedDocument } from 'mongoose';
import { CommentLikes } from '../../application/comment-likes.entity';
import { CreateCommentLikeDataType } from './dto/comment-likes.dto';

export type CommentLikesModelStaticType = {
  createLike: (newLike: CreateCommentLikeDataType) => CommentLikesDocument;
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
