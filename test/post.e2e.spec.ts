import { AppModule } from '../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

const postRouter = '/posts';
let getHttpServer: any;
let blog: any;
let post1: any;
let post2: any;

describe('PostController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();
    getHttpServer = request(app.getHttpServer());
  });

  describe(postRouter, () => {
    beforeAll(async () => {
      await getHttpServer.delete('/testing/all-data');
    });

    it('POST: CREATE BLOG, STATUS: 201', async () => {
      const response = await getHttpServer
        .post('/blogs')
        .send({
          name: 'blog',
          description: 'description',
          websiteUrl: 'https://blog.com',
        })
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'blog',
        description: 'description',
        websiteUrl: 'https://blog.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
      blog = response.body;
    });

    it('POST: CREATE POST1, STATUS: 201', async () => {
      const response = await getHttpServer
        .post(postRouter)
        .send({
          title: 'title1',
          shortDescription: 'shortDescription1',
          content: 'content1',
          blogId: blog.id,
        })
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        title: 'title1',
        shortDescription: 'shortDescription1',
        content: 'content1',
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
      post1 = response.body;
    });

    it('POST: CREATE POST2, STATUS: 201', async () => {
      const response = await getHttpServer
        .post(postRouter)
        .send({
          title: 'title2',
          shortDescription: 'shortDescription2',
          content: 'content2',
          blogId: blog.id,
        })
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        title: 'title2',
        shortDescription: 'shortDescription2',
        content: 'content2',
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
      post2 = response.body;
    });

    it('GET: GET ALL POSTS, STATUS: 200', async () => {
      const response = await getHttpServer.get(postRouter).expect(200);
      expect(response.body.items).toEqual([
        {
          id: expect.any(String),
          title: 'title2',
          shortDescription: 'shortDescription2',
          content: 'content2',
          blogId: blog.id,
          blogName: blog.name,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: expect.any(String),
          title: 'title1',
          shortDescription: 'shortDescription1',
          content: 'content1',
          blogId: blog.id,
          blogName: blog.name,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
      ]);
    });

    it('GET: GET POST1, STATUS: 200', async () => {
      const response = await getHttpServer
        .get(postRouter + '/' + post1.id)
        .expect(200);
      expect(response.body).toEqual({
        id: expect.any(String),
        title: 'title1',
        shortDescription: 'shortDescription1',
        content: 'content1',
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('GET: GET POST, STATUS: 404', async () => {
      await getHttpServer.get(postRouter + '/' + '0').expect(404);
    });

    it('GET: GET ALL COMMENTS BY POST, STATUS: 200', async () => {
      const response = await getHttpServer
        .get(postRouter + '/' + post1.id + '/comments')
        .expect(200);
      expect(response.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('GET: GET ALL COMMENTS BY POST, STATUS: 404', async () => {
      await getHttpServer.get(postRouter + '/' + '0' + '/comments').expect(404);
    });

    it('PUT: UPDATE POST, STATUS: 404', async () => {
      await getHttpServer
        .put(postRouter + '/' + '0')
        .send({
          title: 'badUpdateTitle',
          shortDescription: 'badUpdateShortDescription',
          content: 'badUpdateContent',
          blogId: blog.id,
        })
        .expect(404);
      const response = await getHttpServer.get(postRouter).expect(200);
      expect(response.body.items).toEqual([
        {
          id: expect.any(String),
          title: 'title2',
          shortDescription: 'shortDescription2',
          content: 'content2',
          blogId: blog.id,
          blogName: blog.name,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: expect.any(String),
          title: 'title1',
          shortDescription: 'shortDescription1',
          content: 'content1',
          blogId: blog.id,
          blogName: blog.name,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
      ]);
    });

    it('PUT: UPDATE POST2, STATUS: 204', async () => {
      await getHttpServer
        .put(postRouter + '/' + post2.id)
        .send({
          title: 'updateTitle',
          shortDescription: 'updateShortDescription',
          content: 'updateContent',
          blogId: blog.id,
        })
        .expect(204);
      const response = await getHttpServer.get(postRouter).expect(200);
      expect(response.body.items).toEqual([
        {
          id: expect.any(String),
          title: 'updateTitle',
          shortDescription: 'updateShortDescription',
          content: 'updateContent',
          blogId: blog.id,
          blogName: blog.name,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: expect.any(String),
          title: 'title1',
          shortDescription: 'shortDescription1',
          content: 'content1',
          blogId: blog.id,
          blogName: blog.name,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
      ]);
    });

    it('DELETE: DELETE POST, STATUS: 404', async () => {
      await getHttpServer.delete(postRouter + '/' + '0').expect(404);
      const response = await getHttpServer.get(postRouter).expect(200);
      expect(response.body.items).toEqual([
        {
          id: expect.any(String),
          title: 'updateTitle',
          shortDescription: 'updateShortDescription',
          content: 'updateContent',
          blogId: blog.id,
          blogName: blog.name,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: expect.any(String),
          title: 'title1',
          shortDescription: 'shortDescription1',
          content: 'content1',
          blogId: blog.id,
          blogName: blog.name,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
      ]);
    });

    it('DELETE: DELETE POST, STATUS: 204', async () => {
      await getHttpServer.delete(postRouter + '/' + post2.id).expect(204);
      const response = await getHttpServer.get(postRouter).expect(200);
      expect(response.body.items).toEqual([
        {
          id: expect.any(String),
          title: 'title1',
          shortDescription: 'shortDescription1',
          content: 'content1',
          blogId: blog.id,
          blogName: blog.name,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
      ]);
    });
  });
});
