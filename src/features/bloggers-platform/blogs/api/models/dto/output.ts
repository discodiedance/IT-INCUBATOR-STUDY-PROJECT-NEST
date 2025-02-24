import { BlogDocument } from '../blogs.entities';

export class OutputBlogType {
  public id: string;
  public name: string;
  public description: string;
  public websiteUrl: string;
  public createdAt: string;
  public isMembership: boolean;

  static mapToView(blog: BlogDocument): OutputBlogType {
    const dto = new OutputBlogType();

    dto.id = blog.id;
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership;

    return dto;
  }
}
