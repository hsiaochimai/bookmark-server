const mocha = require('mocha')
const expect = require('chai').expect;
const describe = mocha.describe
const it = mocha.it
const bookmarks = require('../src/store')

const app = require('../src/app')
const supertest = require('supertest')
const { API_TOKEN } = process.env
describe('App', () => {
  it('GET /bookmarks validates API_TOKEN', () => {
    return supertest(app)
      .get(`/bookmarks`)
      .set('Authorization', `Bearer fake${API_TOKEN}`) //set auth header
      .expect(401)
      .then(res => {
        expect(res.body.error).to.equal("Unauthorized request")
        // expect(res.body.length).to.equal(2)
        
      });
  })

  it('GET /bookmarks responds with an array of bookmarks', () => {
    return supertest(app)
      .get(`/bookmarks`)
      .set('Authorization', `Bearer ${API_TOKEN}`) //set auth header
      .expect(200)
      .then(res => {
        expect(res.body).to.be.an('array')
        expect(res.body.length).to.equal(2)
      });
  })

  it('GET /bookmarks/:id responds with a bookmark', () => {
    const id = '8sdfbvbs65sd'
    return supertest(app)
      .get(`/bookmarks/${id}`)
      .set('Authorization', `Bearer ${API_TOKEN}`) //set auth header
      .expect(200)
      .then(res => {
        const storeBm = bookmarks.find(i => i.id === id)
        expect(res.body).to.be.an('object')
        expect(res.body).to.deep.equal(storeBm);

      });
  })

  it('POST /bookmarks adds a bookmark to the store', () => {

    const newBm = {
      "title": "New!",
      "url": "http://medium.com/",
      "desc": "Reading time",
      "rating": 3
    }

    return supertest(app)
      .post('/bookmarks')
      .set('Authorization', `Bearer ${API_TOKEN}`) //set auth header
      .send(newBm)
      .expect(201)
      .then(() => {
        const item = bookmarks.find(i => i.url === newBm.url && i.title === newBm.title)
        expect(item).to.not.be.undefined;
        expect(item.id).to.not.be.undefined;
      });
  })
  it('DELETE /bookmarks/id deletes a bookmark', () => {

    const id = '8sdfbvbs65sd'
    return supertest(app)
      .delete(`/bookmarks/${id}`)
      .set('Authorization', `Bearer ${API_TOKEN}`) //set auth header
      // .send(newBm)
      .expect(204)
      .then(() => {
        const item = bookmarks.find(i => i.id === id)
        expect(item).to.be.undefined;
      });
  })

})