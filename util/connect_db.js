const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const serviceAccount = require('../firebase-credentials.json')

initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.PROJECT_ID
});

const db = getFirestore();

module.exports = db;