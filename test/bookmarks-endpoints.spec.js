const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeBookmarksArray, makeMaliciousBookmark } = require("./bookmarks.fixture");
const { API_TOKEN } = process.env;

let db;
const testBookmarks = makeBookmarksArray()
const insertBookmarks = () => {
  return db
    .into('bookmarks')
    .insert(testBookmarks)
}

describe.only("Bookmarks Endpoints", function () {

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });
  after("disconnect from db", () => db.destroy());
  before("clean the table", () => db("bookmarks").truncate());
  afterEach("cleanup", () => db("bookmarks").truncate());
  
  describe.only(`Unauthorized requests`, () => {
    const testBookmarks = makeBookmarksArray()

    beforeEach('insert bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testBookmarks)
    })

    it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
      return supertest(app)
        .post('/bookmarks')
        .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
      const secondBookmark = testBookmarks[1]
      return supertest(app)
        .get(`/bookmarks/${secondBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
      const aBookmark = testBookmarks[1]
      return supertest(app)
        .delete(`/bookmarks/${aBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })
  })
  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/bookmarks")
          .set('Authorization', `Bearer ${API_TOKEN}`)
          .expect(200, []);
      });
    });
    context('Given there are bookmarks in the database', () => {
      beforeEach('insert bookmarks', insertBookmarks)
      it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${API_TOKEN}`)
          .expect(200, testBookmarks)
      })
    })
    context(`Given an XSS attack article`, () => {
      const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
      
           beforeEach('insert malicious article', () => {
             return db
               .into('bookmarks')
               .insert([ maliciousBookmark ])
           })
      
           it('removes XSS attack content', () => {
             return supertest(app)
               .get(`/bookmarks`)
               .set('Authorization', `Bearer ${API_TOKEN}`)
              .expect(200)
               .expect(res => {
                expect(res.body[0].title).to.eql(expectedBookmark.title)
                expect(res.body[0].descript).to.eql(expectedBookmark.descript)
               })
           })
         })
  });
  describe.only(`GET /bookmarks/:id `, (done) => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(404, { error: { message: `bookmark doesn't exist` } });
      });
    });
    context("Given there are bookmarks in the database", () => {
      const testBookmarks = makeBookmarksArray();
      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });
      it(" responds with 200 and the specified bookmark", () => {
        const bookmarkId = 2;
        const expectedBookmarks = testBookmarks[bookmarkId - 1];
         supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(200, expectedBookmarks)
          
      });
    });
    context(`Given an XSS attack article`, () => {
      const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
      
           before('insert malicious bookmark', () => {
             return db
               .into('bookmarks')
               .insert([ maliciousBookmark ])
           })
      
           it('removes XSS attack content', () => {
            return supertest(app)
               .get(`/bookmarks/${maliciousBookmark.id}`)
               .set("Authorization", `Bearer ${API_TOKEN}`)
               .expect(200)
               .expect(res => {
                expect(res.body.title).to.eql(expectedBookmark.title)
                expect(res.body.descript).to.eql(expectedBookmark.descript)
               })
           })
         })
  });
  describe.only('DELETE /bookmarks/:id', () => {
    context(`Given no bookmarks`, () => {
      it(`responds 404 whe bookmark doesn't exist`, () => {
        return supertest(app)
          .delete(`/bookmarks/123`)
          .set('Authorization', `Bearer ${API_TOKEN}`)
          .expect(404, {
            error: { message: `bookmark doesn't exist` }
          })
      })
    })
  
  context('Given there are bookmarks in the database', () => {
    const testBookmarks = makeBookmarksArray()

    beforeEach('insert bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testBookmarks)
    })
    it('removes the bookmark by ID from the store', () => {
      const idToRemove = 2
      const expectedBookmarks = testBookmarks.filter(bm => bm.id !== idToRemove)
      return supertest(app)
        .delete(`/bookmarks/${idToRemove}`)
        .set('Authorization', `Bearer ${API_TOKEN}`)
        .expect(204)
        .then(() =>
          supertest(app)
            .get(`/bookmarks`)
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .expect(expectedBookmarks)
        )
    })
  })
})

// describe.only('POST /bookmarks', () => {
//   it(`responds with 400 missing 'title' if not supplied`, () => {
//     const newBookmarkMissingTitle = {
//       // title: 'test-title',
//       url_link: 'https://test.com',
//       rating: 1,
//       descript:"hello"
//     }
//     return supertest(app)
//       .post(`/bookmarks`)
//       .send(newBookmarkMissingTitle)
//       .set('Authorization', `Bearer ${API_TOKEN}`)
//       .expect(400, {
//         error: { message: `Missing 'title' in request body`  }
//       })
  })




