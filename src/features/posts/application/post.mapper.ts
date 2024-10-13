import { OutputPostTypeWithStatus } from '../api/models/output';
import { ExtendedLikesInfoType } from '../api/models/post.dto';
import { PostDocument } from '../api/models/post.entities';

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

export const createPostMapper = (
  post: PostDocument,
): OutputPostTypeWithStatus => {
  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    },
  };
};
