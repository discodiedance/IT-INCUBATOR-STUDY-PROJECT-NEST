import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GetBlogsQueryParams } from '../api/models/dto/blogs.dto';
import { BlogModelType } from '../api/models/blogs.entities';
import { blogMapper } from '../application/mappers/blog.mapper';
import { OutputBlogType } from '../api/models/dto/output';
import { Blog } from '../application/blog.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class QueryBlogRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async getAllBlogs(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<OutputBlogType[]>> {
    const filter: FilterQuery<Blog> = {};

    if (query.searchNameTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        name: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }

    const blogs = await this.BlogModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    const totalCount = await this.BlogModel.countDocuments(filter);

    const items = blogs.map(OutputBlogType.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getById(blogId: string): Promise<OutputBlogType | null> {
    const blog = await this.BlogModel.findOne({ id: blogId }).lean();

    if (!blog) {
      return null;
    }

    return blogMapper(blog);
  }
}
