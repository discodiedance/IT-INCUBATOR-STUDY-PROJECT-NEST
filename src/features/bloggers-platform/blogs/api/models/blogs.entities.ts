import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDataType } from './dto/blogs.dto';
import { Blog } from '../../application/blog.entity';
import { InputUpdateBlogDataType } from './dto/input';

export type BlogModelStaticType = {
  createBlog: (newBlog: CreateBlogDataType) => BlogDocument;
};

export type BlogMethodsType = {
  updateBlog: (updateData: InputUpdateBlogDataType) => void;
};

export type BlogDocument = HydratedDocument<Blog, BlogMethodsType>;

export type BlogModelType = Model<BlogDocument> & BlogModelStaticType;
