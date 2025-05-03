import dbConnect from '../lib/db.js'
import Fan  from '../models/Fan.js'
import User from '../models/User.js'

;(async () => {
  await dbConnect()
  const fans = await Fan.find().lean()
  for (const f of fans) {
    const { _id, __v, ...rest } = f
    await User.updateOne({ _id }, { $set:rest }, { upsert:true })
  }
  console.log('Migração concluída')
  process.exit(0)
})()