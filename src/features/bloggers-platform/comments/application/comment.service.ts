import { Injectable } from '@nestjs/common';
import { CommentDocument } from '../api/models/comment.entities';
import { ForbiddenDomainException } from '../../../../core/exceptions/domain-exceptions';
import { UserDocument } from '../../../user-accounts/users/api/models/user.enitities';

@Injectable()
export class CommentService {
  constructor() {}

  async checkCredentials(
    comment: CommentDocument,
    user: UserDocument,
  ): Promise<boolean | null> {
    if (!comment.isCommentatorIdAndLoginEqual(user)) {
      throw ForbiddenDomainException.create();
    }

    return true;
  }
}
