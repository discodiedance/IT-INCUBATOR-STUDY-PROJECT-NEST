import { OutputUserType } from '../../../users/api/models/dto/output';
import { Model, HydratedDocument } from 'mongoose';
import { Comment } from '../../application/comment.entity';
import { CreateCommentDataType, UpdateCommentDataType } from './comment.dto';

export type CommentModelStaticType = {
  createComment: (newComment: CreateCommentDataType) => CommentDocument;
};

export type CommentMethodsType = {
  updateComment: (updateData: UpdateCommentDataType) => void;
  isCommentatorIdAndLoginEqual: (user: OutputUserType) => boolean;
  removeLikeAddDislikeCounter: () => void;
  removeDislikeAddLikeCounter: () => void;
  removeLikeCounter: () => void;
  removeDislikeCounter: () => void;
  addLikeCounter: () => void;
  addDislikeCounter: () => void;
};

export type CommentDocument = HydratedDocument<Comment, CommentMethodsType>;

export type CommentModelType = Model<CommentDocument> & CommentModelStaticType;
