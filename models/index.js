const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/test', {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true
    });

    console.log(`Connected to MongoDB `);
  }
 catch (err) {
    console.log(`Error connecting to mongoDB`);
    process.exit(1);
  }
}

module.exports = connectDB;