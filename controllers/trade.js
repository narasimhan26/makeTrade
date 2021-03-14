const { Trade, User } = require('../models/schema');
const { validationResult }  = require('express-validator');
const { tradeType, tradeStatus } = require('../utils/enums');
const { buyShare, sellShare, addNewSecurity, findSecurity, removeTrade } = require('../utils/transaction');


exports.addTrade = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id } = req.body;
    const the_user = await User.findById(user_id);

    const tradeProcessResponse = processTrade(the_user, req.body);
    if ( !tradeProcessResponse.isTradeComplete) {
      return res.status(400).send({
        success: false,
        message: `Cannot process the requested Trade. ${tradeProcessResponse.message}`
      });
    }
    let updatedUser = tradeProcessResponse.updatedUser;
    // console.log('upd', updatedUser);

    await User.updateOne({_id: user_id}, updatedUser);
    const trade = await Trade.create(req.body);
    // console.log(trade);
    // res.send('ok');
    return res.status(201).send({
      success: true,
      trade_id: trade._id,
      updatedPortfolio: updatedUser.portfolios
    });
  }
  catch (error) {
    console.error('inside catch block', error._message);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error._message
    });
  }
}

exports.getTrades = async (req, res) => {
  try {
    const trades = await Trade.aggregate(
      [
        {$match: {}},
        {
          $group: {
            _id: "$ticker_symbol",
            trades: {
              $push: {
                trade_price: '$trade_price',
                trade_status: '$trade_status',
                type: '$type',
                shares: '$shares',
                trade_status: '$trade_status',
                user_id: '$user_id',
                created_date: '$created_date'
              }
            }
          }
        }
      ]
    );

    return res.status(200).send({
      success: true,
      trades: trades
    });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error._message
    });
  }
}

exports.updateTrade = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let trade = await Trade.findById(req.params.id);
    let ticker_symbols = [];
    ticker_symbols.push(req.body.ticker_symbol);
    // console.log(trade);
    if (req.body.ticker_symbol !== trade.ticker_symbol) {
      ticker_symbols.push(trade.ticker_symbol);
    }

    let trades = await Trade.find({user_id: trade.user_id, ticker_symbol: {$in: ticker_symbols}, trade_status: {$ne: tradeStatus.reverted}, created_date: {$gt: new Date(trade.created_date.toISOString())}}).sort({created_date: -1});
    let user  = await User.findById(trade.user_id);
    let updatedUser = user;
    // console.log('test', trades.length, trades);
    // console.log('before', updatedUser);

    trades.forEach(trade => {
      updatedUser = removeTrade(updatedUser, trade);
    });
    // console.log(updatedUser);
    updatedUser = removeTrade(updatedUser, trade);
    // trade = Object.assign({}, trade.toObject(), req.body);
    trade = Object.assign({}, trade.toObject(), {ticker_symbol: req.body.ticker_symbol, type: req.body.type, shares: req.body.shares, trade_price: req.body.trade_price})
    let tradeProcessResponse = processTrade(updatedUser, trade);

    if (!tradeProcessResponse.isTradeComplete) {
      return res.status(400).send({
        success: false,
        message: `Cannot delete the requested Trade. ${updatedUser.message}`
      });
    }

    trades.reverse().forEach(trade => {
      tradeProcessResponse = processTrade(tradeProcessResponse.updatedUser, trade);
      if ( !tradeProcessResponse.isTradeComplete ) {
        updatedUser = tradeProcessResponse;
        return;
      }
    });

    if (!tradeProcessResponse.isTradeComplete) {
      return res.status(400).send({
        success: false,
        message: `Cannot delete the requested Trade. ${updatedUser.message}`
      });
    }
    // console.log('upd', updatedUser, trade);

    trade['trade_status'] = tradeStatus.updated;
    await User.updateOne({_id: trade.user_id}, updatedUser);
    await Trade.updateOne({_id: trade._id}, trade);

    res.status(200).send({
      success: true,
      trade_id: trade._id,
      updatedPortfolio: updatedUser.portfolios
    });
  }
 catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error._message
    });
  }
}

exports.removeTrade = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let trade = await Trade.findById(req.params.id);

    if (trade.trade_status === tradeStatus.reverted) {
      return res.status(400).send({
        success: false,
        message: 'Latest Trade for the user had been reverted already'
      });
    }

    let ticker_symbols = [];
    ticker_symbols.push(req.body.ticker_symbol);

    if (req.body.ticker_symbol !== trade.ticker_symbol) {
      ticker_symbols.push(trade.ticker_symbol);
    }

    let trades = await Trade.find({user_id: trade.user_id, ticker_symbol: {$in: ticker_symbols}, trade_status: {$ne: tradeStatus.reverted}, created_date: {$gt: new Date(trade.created_date.toISOString())}}).sort({created_date: -1});
    let user  = await User.findById(trade.user_id);
    let updatedUser = user;
    // console.log('test', trades.length, trades);

    trades.forEach(trade => {
      updatedUser = removeTrade(updatedUser, trade);
    });


    updatedUser = removeTrade(updatedUser, trade);
    let tradeProcessResponse = {
      isTradeComplete: true,
    };
    tradeProcessResponse['updatedUser'] = updatedUser;

    trades.reverse().forEach(trade => {
      tradeProcessResponse = processTrade(tradeProcessResponse.updatedUser, trade);
      if ( !tradeProcessResponse.isTradeComplete ) {
        updatedUser = tradeProcessResponse;
        return;
      }
    });

    // console.log('the res', tradeProcessResponse);
    if (!tradeProcessResponse.isTradeComplete) {
      return res.status(400).send({
        success: false,
        message: `Cannot delete the requested Trade. ${updatedUser.message}`
      });
    }

    trade['trade_status'] = tradeStatus.reverted;
    // console.log('upd', updatedUser);

    await User.updateOne({_id: trade.user_id}, updatedUser);
    await Trade.updateOne({_id: trade._id}, trade);

    res.status(200).send({
      success: true,
      trade_id: trade._id,
      updatedPortfolio: updatedUser.portfolios
    });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error._message
    });
  }
}

const processTrade = (user, requestedTrade) => {
    const { portfolios } = user;
    const security = findSecurity(portfolios, requestedTrade);

    if (requestedTrade.type === tradeType.sell && security.length < 1) {
      return {
        isTradeComplete: false,
        message: 'Quantity of a stock should always be positive'
      };
    }

    if (requestedTrade.type === tradeType.sell && (security.shares - requestedTrade.shares < 0)) {
      return {
        isTradeComplete: false,
        message: 'Quantity of a stock should always be positive'
      };
    }

    let updatedUser;

    if (requestedTrade.type === tradeType.sell) {
      updatedUser = sellShare(user, requestedTrade);
    }

    if (requestedTrade.type === tradeType.buy && security.length < 1) {
      updatedUser = addNewSecurity(user, requestedTrade);
    }
    else if (requestedTrade.type === tradeType.buy) {
      updatedUser = buyShare(user, requestedTrade);
    }

    return {
      isTradeComplete: true,
      updatedUser: updatedUser
    }
}

exports.removeLatestTrade = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let [ trade ] = await Trade.find({user_id: req.query.user_id}).sort({created_date: -1}).limit(1);

    if (trade.trade_status === tradeStatus.reverted) {
      return res.status(400).send({
        success: false,
        message: 'Latest Trade for the user had been reverted already'
      });
    }

    const user = await User.findById(req.query.user_id);

    const updatedUser = removeTrade(user, trade);
    trade['trade_status'] = tradeStatus.reverted;

    await User.updateOne({_id: trade.user_id}, updatedUser);
    await Trade.updateOne({_id: trade._id}, trade);

    res.status(200).send({
      success: true
    });

  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error._message
    });
  }
}