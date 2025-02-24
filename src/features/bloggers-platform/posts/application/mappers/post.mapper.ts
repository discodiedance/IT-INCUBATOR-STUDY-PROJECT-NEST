import { ExtendedLikesInfoType } from '../../../likes/posts/api/models/dto/post-likes.dto';
import { OutputPostTypeWithStatus } from '../../api/models/dto/output';
import { PostDocument } from '../../api/models/post.entities';

export const postMapper = (
  post: PostDocument,
  extendedLikesInfo: ExtendedLikesInfoType,
): OutputPostTypeWithStatus => {
  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: extendedLikesInfo,
  };
};
