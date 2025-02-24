import { HydratedDocument, Model } from 'mongoose';
import { Comment } from '../../application/comment.entity';
import {
  CreateCommentDataType,
  UpdateCommentDataType,
} from './dto/comment.dto';
import { UserDocument } from '../../../../user-accounts/users/api/models/user.enitities';

export type CommentModelStaticType = {
  createComment: (newComment: CreateCommentDataType) => CommentDocument;
};

export type CommentMethodsType = {
  updateComment: (updateData: UpdateCommentDataType) => void;
  isCommentatorIdAndLoginEqual: (user: UserDocument) => boolean;
  removeLikeAddDislikeCounter: () => void;
  removeDislikeAddLikeCounter: () => void;
  removeLikeCounter: () => void;
  removeDislikeCounter: () => void;
  addLikeCounter: () => void;
  addDislikeCounter: () => void;
};

export type CommentDocument = HydratedDocument<Comment, CommentMethodsType>;

export type CommentModelType = Model<CommentDocument> & CommentModelStaticType;
