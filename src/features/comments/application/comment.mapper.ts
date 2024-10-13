import { CommentDocument } from '../api/models/comment.entities';
import { OutputCommentTypeWithStatus } from '../api/models/output';

export const commentMapper = async (
  comment: CommentDocument,
  status: string | null,
): Promise<OutputCommentTypeWithStatus> => {
  return {
    id: comment.id,
    content: comment.content,
    commentatorInfo: comment.commentatorInfo,
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus: status ?? 'None',
    },
  };
};
