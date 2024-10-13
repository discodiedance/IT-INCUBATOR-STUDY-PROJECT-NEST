import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import {
  CreateBlogDataType,
  UpdateBlogDataType,
} from '../api/models/blogs.dto';

@Schema()
export class Blog {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  static createBlog(newBlog: CreateBlogDataType) {
    const blog = new this();

    blog.id = new ObjectId().toString();
    blog.name = newBlog.name;
    blog.description = newBlog.description;
    blog.websiteUrl = newBlog.websiteUrl;
    blog.createdAt = new Date().toISOString();
    blog.isMembership = false;

    return blog;
  }

  updateBlog(updateData: UpdateBlogDataType) {
    this.name = updateData.name;
    this.description = updateData.description;
    this.websiteUrl = updateData.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
};

BlogSchema.statics = {
  createBlog: Blog.createBlog,
};

BlogSchema.loadClass(Blog);
