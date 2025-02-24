import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogController } from './api/blog.controller';
import { QueryBlogRepository } from './infrastrucutre/blog.query-repository';
import { BlogRepository } from './infrastrucutre/blog.repository';
import { Blog, BlogSchema } from './application/blog.entity';
import { Comment, CommentSchema } from '../comments/application/comment.entity';
import { CreateBlogUseCase } from './application/usecases/create-blog.usecase';
import { CreatePostToBlogUseCase } from './application/usecases/create-post-to-blog.usecase';
import { DeleteBlogUseCase } from './application/usecases/delete-blog.usecase';
import { GetAllBlogsUseCase } from './application/usecases/query-usecases/get-all-blogs.usecase';
import { GetAllPostsFromBlogUseCase } from './application/usecases/query-usecases/get-all-posts-from-blog.usecase';
import { GetBlogUseCase } from './application/usecases/query-usecases/get-blog-by-id.usecase';
import { UpdateBlogUseCase } from './application/usecases/update-blog.usecase';
import { PostLikesModule } from '../likes/posts/api/post-likes.module';
import { CommentLikesModule } from '../likes/comments/api/comment-likes.module';
import { PostModule } from '../posts/post.module';

@Module({
  imports: [
    PostLikesModule,
    CommentLikesModule,
    forwardRef(() => PostModule),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [BlogController],
  providers: [
    QueryBlogRepository,
    BlogRepository,
    GetAllBlogsUseCase,
    GetAllPostsFromBlogUseCase,
    GetBlogUseCase,
    CreateBlogUseCase,
    CreatePostToBlogUseCase,
    DeleteBlogUseCase,
    UpdateBlogUseCase,
  ],

  exports: [BlogRepository],
})
export class BlogModule {}
