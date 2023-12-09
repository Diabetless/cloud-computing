require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: './storage-credentials.json'
})

const bucket = storage.bucket(process.env.BUCKET_NAME);

module.exports = bucket;