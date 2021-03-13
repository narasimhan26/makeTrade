const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema ({
  user_id: {
    type: String,
    required: [true, 'Please Enter user ID']
  },
  ticker_symbol: {
    type: String,
    required: [true, 'Please provide Ticker Symbol']
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: [true, 'Please Enter text'],
  },
  shares: {
    type: Number,
    required: [true, 'Please enter number shares to make trade'],
    min: 0
  },
  trade_price: {
    type: Number,
    default: 0,
    min: 0
  },
  trade_status: {
    type: String,
    default: 'PROCESSED',
    enum: ['PROCESSED', 'REVERTED']
  },
  created_date: {
    type: Date,
    default: Date.now
  }
});

const security = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  ticker_symbol: {
    type: String,
    required: [true, 'Please provide ticker Symbol']
  },
  shares: {
    type: Number,
    required: [true, 'Please enter number shares to make trade'],
    min: 0
  },
  average_trade_price: {
    type: Number,
    default: 0,
    required: true,
    min: 0
  }
}, { _id : false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please provide Name']
  },
  portfolios:{
    type: [security]
  }
});


const Trade = mongoose.model('Trade', tradeSchema);
const User = mongoose.model('User', userSchema);

module.exports = {Trade, User};