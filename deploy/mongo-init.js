// Runs once, when the MongoDB volume is first created: adds the app's own database user, limited to
// reading and writing the site's database. The root user is only used for backups and maintenance.
const dbName = process.env.MONGODB_DB

db.getSiblingDB(dbName).createUser({
  user: process.env.MONGO_APP_USER,
  pwd: process.env.MONGO_APP_PASSWORD,
  roles: [{ role: 'readWrite', db: dbName }],
})
