import bodyParser from 'body-parser'
import { Request, Response } from 'express' //eslint-disable-line
import { Application, GitHubAPI } from 'probot' //eslint-disable-line

export = async (app: Application) => {
  const router = app.route('/make-in-india-bot')

  router.use(bodyParser.json())

  router.post('/product', async (req: Request, res: Response) => {
    const { title, body }: { title: string; body: string } = req.body
    const installationToken: string = await app.app.getInstallationAccessToken({
      installationId: parseInt(process.env.INSTALLATION_ID, 10)
    })
    const github = GitHubAPI({
      auth: installationToken,
      logger: app.log.child({ name: 'make-in-india-bot' })
    })

    try {
      await github.issues.create({
        body,
        owner: process.env.REPO_OWNER,
        repo: process.env.REPO,
        title
      })
    } catch (err) {
      return res.send({ status: 'error', errors: err })
    }

    return res.status(200).end()
  })
}
