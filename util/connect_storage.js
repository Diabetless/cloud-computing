require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

const serviceAccount = require('../storage-credentials.json')

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: serviceAccount
})

const bucket = storage.bucket(process.env.BUCKET_NAME);

module.exports = bucket;