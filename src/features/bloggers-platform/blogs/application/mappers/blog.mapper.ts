import { BlogDocument } from '../../api/models/blogs.entities';
import { OutputBlogType } from '../../api/models/dto/output';

export const blogMapper = (blog: BlogDocument): OutputBlogType => {
  return {
    id: blog.id,
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
};
