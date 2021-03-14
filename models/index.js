require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`mongodb+srv://Make_Trade:${process.env.DBPASSWORD}@expense-tracker.mmqvn.mongodb.net/MakeTrade?retryWrites=true&w=majority`, {
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