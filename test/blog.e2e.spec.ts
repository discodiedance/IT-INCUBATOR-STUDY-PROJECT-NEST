import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { JWT_SECRET } from '../src/config';
import { BlogTestManager } from './helpers/managers/blog-test-manager';
import {
  InputCreateBlogDataType,
  InputUpdateBlogDataType,
} from '../src/features/bloggers-platform/blogs/api/models/dto/input';
import { InputCreatePostToBlogDataType } from '../src/features/bloggers-platform/posts/api/models/dto/input';
import { OutputBlogType } from '../src/features/bloggers-platform/blogs/api/models/dto/output';
import { PostSortDataType } from '../src/features/bloggers-platform/posts/api/models/dto/post.dto';
import { BlogSortDataType } from '../src/features/bloggers-platform/blogs/api/models/dto/blogs.dto';

describe('Blogs', () => {
  let app: INestApplication;
  let blogTestManager: BlogTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '5m' },
        }),
      ),
    );
    app = result.app;
    blogTestManager = result.blogTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create blog', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('It should create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl.com',
      };

      const response = await blogTestManager.createBlog(body);

      expect(response.status).toEqual(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: body.name,
        description: body.description,
        websiteUrl: body.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it("It shouldn't create blog with incorrect auth", async () => {
      const body: InputCreateBlogDataType = {
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl.com',
      };

      const response = await blogTestManager.createBlogWithIncorrectAuth(body);

      expect(response.status).toEqual(401);
    });

    it("It shouldn't create blog with long name", async () => {
      const body: InputCreateBlogDataType = {
        name: 'longName'.repeat(10),
        description: 'goodDescription1',
        websiteUrl: 'https://www.goodUrl1.com',
      };

      const response = await blogTestManager.createBlogWithBodyErrors(body);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'name',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't create blog with long description", async () => {
      const body: InputCreateBlogDataType = {
        name: 'goodName',
        description: 'longDescription'.repeat(100),
        websiteUrl: 'https://www.goodUrl1.com',
      };

      const response = await blogTestManager.createBlogWithBodyErrors(body);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'description',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't create blog with long websiteurl", async () => {
      const body: InputCreateBlogDataType = {
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.longUrl.com'.repeat(100),
      };

      const response = await blogTestManager.createBlogWithBodyErrors(body);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'websiteUrl',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't create blog with invalid name", async () => {
      const body = {
        name: null,
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl1.com',
      };

      const response = await blogTestManager.createBlogWithBodyErrors(body);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'name must be a string; Received value: null',
            field: 'name',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't create blog with invalid description", async () => {
      const body = {
        name: 'goodName',
        description: null,
        websiteUrl: 'https://www.goodUrl1.com',
      };

      const response = await blogTestManager.createBlogWithBodyErrors(body);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'description must be a string; Received value: null',
            field: 'description',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });

    it("It shouldn't create blog with invalid websiteUrl", async () => {
      const body = {
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: null,
      };

      const response = await blogTestManager.createBlogWithBodyErrors(body);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'websiteUrl must be a string; Received value: null',
            field: 'websiteUrl',
          },
        ],
      });
      expect(response.status).toEqual(400);
    });
  });

  describe('Get all blogs', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('Create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl.com',
      };

      const response = await blogTestManager.createBlog(body);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: body.name,
        description: body.description,
        websiteUrl: body.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('It should get all blogs', async () => {
      const query: BlogSortDataType = {
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 10,
      };

      const response = await blogTestManager.getAllBlogs(query);

      expect(response.body.totalCount).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.pagesCount).toBe(1);
      expect(response.body.items[0]).toEqual({
        id: expect.any(String),
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });
  });

  describe('Get blog', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blog: OutputBlogType;

    it('Create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl.com',
      };

      const response = await blogTestManager.createBlog(body);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: body.name,
        description: body.description,
        websiteUrl: body.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });

      blog = response.body;
    });

    it('It should get blog', async () => {
      const response = await blogTestManager.getBlogById(blog.id);
      expect(response.status).toEqual(200);

      expect(response.body).toEqual({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('It should not find blog with not existing id', async () => {
      const response = await blogTestManager.getBlogWithNotFoundId('123');

      expect(response.status).toEqual(404);
    });
  });

  describe('Update blog', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let foundBlogId: string;

    it('Create create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl.com',
      };

      const response = await blogTestManager.createBlog(body);

      expect(response.status).toEqual(201);
    });

    it('Get blogs', async () => {
      const response = await blogTestManager.getAllBlogs();
      expect(response.status).toEqual(200);
      foundBlogId = response.body.items[0].id;
    });

    it('It should update blog', async () => {
      const updateBlogData: InputUpdateBlogDataType = {
        name: 'newName',
        description: 'newDescription',
        websiteUrl: 'https://www.newUrl.com',
      };

      const response = await blogTestManager.updateBlog(
        foundBlogId,
        updateBlogData,
      );
      expect(response.status).toEqual(204);

      const getResponseAfterUpdate =
        await blogTestManager.getBlogById(foundBlogId);
      expect(getResponseAfterUpdate.status).toEqual(200);
      expect(getResponseAfterUpdate.body).toEqual({
        id: foundBlogId,
        name: updateBlogData.name,
        description: updateBlogData.description,
        websiteUrl: updateBlogData.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('It should not update blog with long name', async () => {
      const updateBlogData: InputUpdateBlogDataType = {
        name: 'longName'.repeat(10),
        description: 'newDescription1',
        websiteUrl: 'https://www.newUrl1.com',
      };

      const response = await blogTestManager.updateBlogWithBodyErrors(
        foundBlogId,
        updateBlogData,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'name',
          },
        ],
      });
    });

    it('It should not update blog with long description', async () => {
      const updateBlogData: InputUpdateBlogDataType = {
        name: 'newName1',
        description: 'longDescription'.repeat(100),
        websiteUrl: 'https://www.newUrl1.com',
      };

      const response = await blogTestManager.updateBlogWithBodyErrors(
        foundBlogId,
        updateBlogData,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'description',
          },
        ],
      });
    });

    it('It should not update blog with long websiteUrl', async () => {
      const updateBlogData: InputUpdateBlogDataType = {
        name: 'newName1',
        description: 'newDescription1',
        websiteUrl: 'https://www.longUrl.com'.repeat(100),
      };

      const response = await blogTestManager.updateBlogWithBodyErrors(
        foundBlogId,
        updateBlogData,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'websiteUrl',
          },
        ],
      });
    });

    it('It should not update blog with invalid name', async () => {
      const updateBlogData = {
        name: null,
        description: 'newDescription1',
        websiteUrl: 'https://www.newUrl1.com',
      };

      const response = await blogTestManager.updateBlogWithBodyErrors(
        foundBlogId,
        updateBlogData,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'name must be a string; Received value: null',
            field: 'name',
          },
        ],
      });
    });

    it('It should not update blog with invalid description', async () => {
      const updateBlogData = {
        name: 'newName1',
        description: null,
        websiteUrl: 'https://www.newUrl1.com',
      };

      const response = await blogTestManager.updateBlogWithBodyErrors(
        foundBlogId,
        updateBlogData,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'description must be a string; Received value: null',
            field: 'description',
          },
        ],
      });
    });

    it('It should not update blog with invalid websiteUrl', async () => {
      const updateBlogData = {
        name: 'newName1',
        description: 'newDescription1',
        websiteUrl: null,
      };

      const response = await blogTestManager.updateBlogWithBodyErrors(
        foundBlogId,
        updateBlogData,
      );
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'websiteUrl must be a string; Received value: null',
            field: 'websiteUrl',
          },
        ],
      });
    });

    it('It should not update blog with incorrect auth', async () => {
      const updateBlogData = {
        name: 'newName1',
        description: 'newDescription1',
        websiteUrl: 'https://www.newUrl1.com',
      };
      const response = await blogTestManager.updateBlogWithIncorrectAuth(
        foundBlogId,
        updateBlogData,
      );
      expect(response.status).toEqual(401);
    });

    it('It should not update blog with not existing id', async () => {
      const updateBlogData = {
        name: 'newName1',
        description: 'newDescription1',
        websiteUrl: 'https://www.newUrl1.com',
      };
      const response = await blogTestManager.updateBlogWithNotFoundId(
        '123',
        updateBlogData,
      );
      expect(response.status).toEqual(404);
    });
  });

  describe('Delete blog', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let foundBlogId: string;
    it('Create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl.com',
      };

      const response = await blogTestManager.createBlog(body);
      expect(response.status).toEqual(201);

      foundBlogId = response.body.id;
    });

    it('It should not delete blog with incorrect auth', async () => {
      const response =
        await blogTestManager.deleteBlogWithIncorrectAuth(foundBlogId);
      expect(response.status).toEqual(401);
    });

    it('It should not delete blog with not existing id', async () => {
      const response = await blogTestManager.deleteBlogWithNotFoundId('123');
      expect(response.status).toEqual(404);
    });

    it('It should delete blog', async () => {
      const response = await blogTestManager.deleteBlog(foundBlogId);
      expect(response.status).toEqual(204);

      const getResponseAfterDelete =
        await blogTestManager.getBlogWithNotFoundId(foundBlogId);
      expect(getResponseAfterDelete.status).toEqual(404);
    });
  });

  describe('Create post to blog', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blogId: string;
    let blogName: string;
    it('Create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl.com',
      };

      const response = await blogTestManager.createBlog(body);
      expect(response.status).toEqual(201);

      blogId = (await blogTestManager.getAllBlogs()).body.items[0].id;
      blogName = (await blogTestManager.getAllBlogs()).body.items[0].name;
    });

    it('It should not create post to blog with incorrect auth', async () => {
      const body: InputCreatePostToBlogDataType = {
        title: 'goodTitle',
        shortDescription: 'goodShortDescription',
        content: 'goodContent',
      };

      const response = await blogTestManager.createPostToBlogWithIncorrectAuth(
        blogId,
        body,
      );

      expect(response.status).toEqual(401);
    });

    it('It should not create post to blog with not existing blog id', async () => {
      const body: InputCreatePostToBlogDataType = {
        title: 'goodTitle',
        shortDescription: 'goodShortDescription',
        content: 'goodContent',
      };

      const response = await blogTestManager.createPostToBlogWithNotFoundBlogId(
        '123',
        body,
      );

      expect(response.status).toEqual(404);
    });

    it('It should not create post to blog with long title', async () => {
      const body: InputCreatePostToBlogDataType = {
        title: 'longTitle'.repeat(100),
        shortDescription: 'goodShortDescription',
        content: 'goodContent',
      };

      const response = await blogTestManager.createPostToBlogWithBodyErrors(
        blogId,
        body,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'title',
          },
        ],
      });
    });

    it('It should not create post to blog with long short description', async () => {
      const body: InputCreatePostToBlogDataType = {
        title: 'goodTitle',
        shortDescription: 'goodShortDescription'.repeat(100),
        content: 'goodContent',
      };

      const response = await blogTestManager.createPostToBlogWithBodyErrors(
        blogId,
        body,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'shortDescription',
          },
        ],
      });
    });

    it('It should not create post to blog with long content', async () => {
      const body: InputCreatePostToBlogDataType = {
        title: 'goodTitle',
        shortDescription: 'goodShortDescription',
        content: 'goodContent'.repeat(100),
      };

      const response = await blogTestManager.createPostToBlogWithBodyErrors(
        blogId,
        body,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'content',
          },
        ],
      });
    });

    it('It should not create post to blog with invalid title', async () => {
      const body = {
        title: null,
        shortDescription: 'goodShortDescription',
        content: 'goodContent',
      };

      const response = await blogTestManager.createPostToBlogWithBodyErrors(
        blogId,
        body,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'title',
          },
        ],
      });
    });

    it('It should not create post to blog with invalid short description', async () => {
      const body = {
        title: 'goodTitle',
        shortDescription: null,
        content: 'goodContent',
      };

      const response = await blogTestManager.createPostToBlogWithBodyErrors(
        blogId,
        body,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'shortDescription',
          },
        ],
      });
    });

    it('It should not create post to blog with invalid content', async () => {
      const body = {
        title: 'goodTitle',
        shortDescription: 'goodShortDescription',
        content: null,
      };

      const response = await blogTestManager.createPostToBlogWithBodyErrors(
        blogId,
        body,
      );

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'content',
          },
        ],
      });
    });

    it('It should create post to blog', async () => {
      const body: InputCreatePostToBlogDataType = {
        title: 'goodTitle',
        shortDescription: 'goodShortDescription',
        content: 'goodContent',
      };

      const response = await blogTestManager.createPostToBlog(blogId, body);

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogId: blogId,
        blogName: blogName,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });
  });

  describe('Get all posts from blog', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    let blogId: string;
    let blogName: string;

    it('Create blog', async () => {
      const body: InputCreateBlogDataType = {
        name: 'goodName',
        description: 'goodDescription',
        websiteUrl: 'https://www.goodUrl.com',
      };

      const response = await blogTestManager.createBlog(body);
      expect(response.status).toEqual(201);

      const allBlogs = await blogTestManager.getAllBlogs();
      blogId = allBlogs.body.items[0].id;
      blogName = allBlogs.body.items[0].name;
    });

    it('It should not get all posts from blog with not found blogId', async () => {
      const query: PostSortDataType = {
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortDirection: 'asc',
        blogId: 'notFoundBlogId',
      };

      const response =
        await blogTestManager.getAllPostsFromBlogWithNotFoundBlogId(query);

      expect(response.status).toEqual(404);
    });
    it('It should get all posts from blog', async () => {
      const body: InputCreatePostToBlogDataType = {
        title: 'goodTitle',
        shortDescription: 'goodShortDescription',
        content: 'goodContent',
      };

      const postResponse = await blogTestManager.createPostToBlog(blogId, body);
      expect(postResponse.status).toEqual(201);

      const query: PostSortDataType = {
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortDirection: 'asc',
        blogId: blogId,
      };

      const response = await blogTestManager.getAllPostsFromBlog(query);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            title: body.title,
            shortDescription: body.shortDescription,
            content: body.content,
            blogId: blogId,
            blogName: blogName,
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
        ],
      });
    });
  });
});
