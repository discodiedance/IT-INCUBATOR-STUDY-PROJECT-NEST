import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDocument, BlogModelType } from '../api/models/blogs.entities';
import { Blog } from '../application/blog.entity';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}
  async save(model: BlogDocument) {
    return await model.save();
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await this.BlogModel.deleteOne({ id: id });
    return deleteResult.deletedCount === 1;
  }

  async getById(id: string): Promise<BlogDocument | null> {
    const blog = await this.BlogModel.findOne({ id: id });
    if (!blog) {
      return null;
    }
    return blog;
  }
}
