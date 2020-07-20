import { remote } from 'electron'
import path from 'path'

import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

const adapter = new FileSync(
  path.join(remote.app.getPath('userData'), '/data.json'),
)
const db = low(adapter)

db.defaults({ todos: [], color: null, userId: null }).write()

export default db
