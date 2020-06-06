import nock from 'nock'
import path from 'path'
import { Probot } from 'probot'
import request from 'supertest'
import myProbotApp from '../src'
// tslint:disable-next-line: no-var-requires
import { promises as fs } from 'fs'

describe('My Probot app', () => {
  let probot: any
  let mockCert: string

  beforeAll(async () => {
    mockCert = await fs.readFile(
      path.join(__dirname, 'fixtures/mock-cert.pem'),
      'binary'
    )
  })

  beforeEach(() => {
    nock.disableNetConnect()
    nock.enableNetConnect('127.0.0.1')
    probot = new Probot({ id: 123, cert: mockCert })
    probot.load(myProbotApp)
  })

  test('creates a comment when an issue is opened', async () => {
    nock('https://api.github.com')
      .persist()
      .post('/app/installations/12/access_tokens')
      .reply(200, {
        createdAt: '2020-06-04T16:03:15.160Z',
        expiresAt: '2020-06-04T17:03:14Z',
        installationId: 9484460,
        permissions: { issues: 'write', metadata: 'read' },
        repositorySelection: 'selected',
        token: 'v1.f345aa79d81a23d96721b11f53319ac4e5fc33f1',
        type: 'token'
      })

    nock('https://api.github.com')
      .post('/repos/AatmNirbharBharat/products/issues')
      .reply(200)

    const response = await request(probot.server)
      .post('/make-in-india-bot/product')
      .send({
        body: 'Issue Body',
        title: 'Issue Title'
      })

    expect(response.status).toEqual(200)
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
