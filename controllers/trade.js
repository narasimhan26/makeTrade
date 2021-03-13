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
    const { portfolios } = the_user;


    const security = findSecurity(portfolios, req.body);

    if (req.body.type === tradeType.sell && security.length < 1) {
      return res.status(400).send({
        success: 'false',
        message: 'Cannot Sell, No Shares Found'
      });
    }
    if (req.body.type === tradeType.sell && (security.shares - req.body.shares < 0)) {
      return res.status(400).send({
        success: 'false',
        message: 'Cannot Sell, Invalid Share details'
      });
    }

    let updatedUser;

    if (req.body.type === tradeType.sell) {
      updatedUser = sellShare(the_user, req.body);
    }

    if (req.body.type === tradeType.buy && security.length < 1) {
      updatedUser = addNewSecurity(the_user, req.body);
    }
    else if (req.body.type === tradeType.buy) {
      updatedUser = buyShare(the_user, req.body);
    }

    // console.log('upd', updatedUser);
    await User.updateOne({_id: user_id}, updatedUser);

    // console.log(req.body);
    await Trade.create(req.body);


    return res.status(201).json({
      success: true,
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

/**
 * A
*/

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

exports.removeTrade = async (req, res) => {
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

exports.updateTrade = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let [ trade ] = await Trade.find({user_id: req.query.user_id}).sort({created_date: -1}).limit(1);

    if (req.query.user_id !== trade.user_id) {
      return res.status(400).send({
        success: false,
        message: 'Cannot Update! Invalid User ID given'
      });
    }

    if (trade.trade_status === tradeStatus.reverted) {
      return res.status(400).send({
        success: false,
        message: 'Cannot Update! Latest Trade for the user had been reverted already'
      });
    }

    if (trade.trade_status === tradeStatus.updated) {
      return res.status(400).send({
        success: false,
        message: 'Latest Trade for the user had been updated already'
      });
    }

    const user = await User.findById(req.query.user_id);
    let updatedUser = removeTrade(user, trade);
    const requestedTrade = Object.assign({}, trade.toObject(), req.body);

    const { portfolios } = updatedUser;


    const security = findSecurity(portfolios, requestedTrade);

    if (requestedTrade.type === tradeType.sell && security.length < 1) {
      return res.status(400).send({
        success: 'false',
        message: 'Cannot Sell, No Shares Found'
      });
    }
    if (requestedTrade.type === tradeType.sell && (security.shares - requestedTrade.shares < 0)) {
      return res.status(400).send({
        success: 'false',
        message: 'Cannot Sell, Invalid Share details'
      });
    }

    if (requestedTrade.type === tradeType.sell) {
      updatedUser = sellShare(updatedUser, requestedTrade);
    }

    if (requestedTrade.type === tradeType.buy && security.length < 1) {
      updatedUser = addNewSecurity(updatedUser, requestedTrade);
    }
    else if (requestedTrade.type === tradeType.buy) {
      updatedUser = buyShare(updatedUser, requestedTrade);
    }

    requestedTrade['trade_status'] = tradeStatus.updated;
    await User.updateOne({_id: requestedTrade.user_id}, updatedUser);
    await Trade.updateOne({_id: requestedTrade._id}, requestedTrade);

    res.status(200).send({
      success: true,
      requestedTrade: requestedTrade,
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