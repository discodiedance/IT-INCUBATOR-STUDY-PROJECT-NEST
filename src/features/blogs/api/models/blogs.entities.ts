import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDataType, UpdateBlogDataType } from './blogs.dto';
import { Blog } from '../../application/blog.entity';

export type BlogModelStaticType = {
  createBlog: (newBlog: CreateBlogDataType) => BlogDocument;
};

export type BlogMethodsType = {
  updateBlog: (updateData: UpdateBlogDataType) => void;
};

export type BlogDocument = HydratedDocument<Blog, BlogMethodsType>;

export type BlogModelType = Model<BlogDocument> & BlogModelStaticType;
