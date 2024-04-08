import { AutoRouter } from 'itty-router'
import { backendRequest } from './backend.js'
import exampleRouter from './examples.js'

const router = AutoRouter()

router
  .all('/example/*', exampleRouter.fetch)
  .get('*', backendRequest)

export default { ...router }