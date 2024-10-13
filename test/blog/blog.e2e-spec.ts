import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

const blogRouter = '/blogs';
let getHttpServer: any;
let blog1: any;
let blog2: any;

describe('BlogController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();
    getHttpServer = request(app.getHttpServer());
  });

  describe(blogRouter, () => {
    beforeAll(async () => {
      await getHttpServer.delete('/testing/all-data');
    });
    it('POST: CREATE BLOG1, STATUS: 201', async () => {
      const response = await getHttpServer
        .post(blogRouter)
        .send({
          name: 'blog1',
          description: 'description1',
          websiteUrl: 'https://blog1.com',
        })
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'blog1',
        description: 'description1',
        websiteUrl: 'https://blog1.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
      blog1 = response.body;
    });

    it('GET: GET BLOG BY ID, STATUS: 200', async () => {
      const response = await getHttpServer
        .get(blogRouter + '/' + blog1.id)
        .expect(200);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'blog1',
        description: 'description1',
        websiteUrl: 'https://blog1.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('GET: GET BLOG BY ID, STATUS: 404', async () => {
      await getHttpServer.get(blogRouter + '/' + '0').expect(404);
    });

    it('POST: CREATE BLOG2, STATUS: 201', async () => {
      const response = await getHttpServer
        .post(blogRouter)
        .send({
          name: 'blog2',
          description: 'description2',
          websiteUrl: 'https://blog2.com',
        })
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'blog2',
        description: 'description2',
        websiteUrl: 'https://blog2.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
      blog2 = response.body;
    });

    it('GET: GET ALL BLOGS, STATUS: 200', async () => {
      const response = await getHttpServer.get(blogRouter).expect(200);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            name: 'blog2',
            description: 'description2',
            websiteUrl: 'https://blog2.com',
            createdAt: expect.any(String),
            isMembership: false,
          },
          {
            id: expect.any(String),
            name: 'blog1',
            description: 'description1',
            websiteUrl: 'https://blog1.com',
            createdAt: expect.any(String),
            isMembership: false,
          },
        ],
      });
    });

    it('PUT: UPDATE BLOG2, STATUS: 204', async () => {
      await getHttpServer
        .put(blogRouter + '/' + blog2.id)
        .send({
          name: 'updateBlog2',
          description: 'updateDescription2',
          websiteUrl: 'https://updateBlog2.com',
        })
        .expect(204);
    });

    it('PUT: UPDATE BLOG, STATUS: 404', async () => {
      await getHttpServer
        .put(blogRouter + '/' + '0')
        .send({
          name: 'badUpdateBlog',
          description: 'badUpdateDescription',
          websiteUrl: 'https://badUpdateBlog.com',
        })
        .expect(404);
    });

    it('DELETE: DELETE BLOG, STATUS: 404', async () => {
      await getHttpServer.delete(blogRouter + '/' + '0').expect(404);
    });

    it('DELETE: DELETE BLOG2, STATUS: 204', async () => {
      await getHttpServer.delete(blogRouter + '/' + blog2.id).expect(204);
    });

    it('POST: CREATE POST BY BLOG, STATUS: 404', async () => {
      await getHttpServer
        .post(blogRouter + '/' + '0' + '/posts')
        .send({
          title: 'title',
          shortDescription: 'shortDescription',
          content: 'content',
        })
        .expect(404);
    });

    it('GET: GET POSTS BY BLOG, STATUS 404', async () => {
      await getHttpServer.get(blogRouter + '/' + '0' + '/posts').expect(404);
    });

    it('POST: CREATE POST BY BLOG, STATUS: 201', async () => {
      const response = await getHttpServer
        .post(blogRouter + '/' + blog1.id + '/posts')
        .send({
          title: 'title',
          shortDescription: 'shortDescription',
          content: 'content',
        })
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        title: 'title',
        shortDescription: 'shortDescription',
        content: 'content',
        blogId: blog1.id,
        blogName: blog1.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('GET: GET POSTS BY BLOG, STATUS: 200', async () => {
      const response = await getHttpServer
        .get(blogRouter + '/' + blog1.id + '/posts')
        .expect(200);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            title: 'title',
            shortDescription: 'shortDescription',
            content: 'content',
            blogId: blog1.id,
            blogName: blog1.name,
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
