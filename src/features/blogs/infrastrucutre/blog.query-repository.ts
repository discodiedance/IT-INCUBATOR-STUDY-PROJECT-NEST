import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogSortDataType } from '../api/models/blogs.dto';
import { BlogModelType } from '../api/models/blogs.entities';
import { blogMapper } from '../application/blog.mapper';
import { OutputBlogType } from '../api/models/output';
import { Blog } from '../application/blog.entity';

@Injectable()
export class QueryBlogRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async getAll(sortData: BlogSortDataType) {
    const sortDirection = sortData.sortDirection ?? 'desc';
    const sortBy = sortData.sortBy ?? 'createdAt';
    const searchNameTerm = sortData.searchNameTerm ?? null;
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;

    let filter = {};

    if (searchNameTerm) {
      filter = {
        name: {
          $regex: searchNameTerm,
          $options: 'i',
        },
      };
    }

    const blogs = await this.BlogModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    const totalCount = await this.BlogModel.countDocuments(filter);
    const pageCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: blogs.map(blogMapper),
    };
  }

  async getById(id: string): Promise<OutputBlogType | null> {
    const blog = await this.BlogModel.findOne({ id: id });
    if (!blog) {
      return null;
    }
    return blogMapper(blog);
  }
}
