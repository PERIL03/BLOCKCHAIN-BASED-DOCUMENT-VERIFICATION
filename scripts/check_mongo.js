require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('No MONGODB_URI found in .env');
  process.exit(2);
}

(async () => {
  try {
    console.log('Using MONGODB_URI:', uri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+(@.*)/, '$1*****$2'));
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, { dbName: process.env.MONGO_DATABASE || undefined });
    console.log('✅ Mongoose connected');
    const db = mongoose.connection.db;
    const admin = db.admin();
    const info = await admin.serverStatus();
    console.log('MongoDB serverStatus ok. version:', info.version);
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name).join(', ') || '(none)');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.name) console.error('Error name:', err.name);
    process.exit(1);
  }
})();
