import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CreateBlogDataType } from '../api/models/dto/blogs.dto';
import { BlogDocument } from '../api/models/blogs.entities';
import { InputUpdateBlogDataType } from '../api/models/dto/input';
import {
  blogNameConstraints,
  blogDescriptionConstraints,
  blogWebsiteUrlConstraints,
} from '../constants/validation-constants';

@Schema()
export class Blog {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true, ...blogNameConstraints })
  name: string;

  @Prop({ type: String, required: true, ...blogDescriptionConstraints })
  description: string;

  @Prop({ type: String, required: true, ...blogWebsiteUrlConstraints })
  websiteUrl: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  static createBlog(newBlog: CreateBlogDataType): BlogDocument {
    const blog = new this();

    blog.id = new ObjectId().toString();
    blog.name = newBlog.name;
    blog.description = newBlog.description;
    blog.websiteUrl = newBlog.websiteUrl;
    blog.createdAt = new Date().toISOString();
    blog.isMembership = false;

    return blog as BlogDocument;
  }

  updateBlog(updateData: InputUpdateBlogDataType) {
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
