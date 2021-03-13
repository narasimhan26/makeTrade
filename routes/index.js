const express = require('express');
const { addTrade, getTrades, removeTrade, updateTrade } = require('../controllers/trade')
const { addUser } = require('../controllers/user')
const { getPortfolio, getReturn } = require('../controllers/portfolio')
const { body, param, query } = require('express-validator');

const apiRouter = express.Router();
apiRouter
  .route('/trade')
  .get(getTrades)
  .post(
    [
      body('user_id').not().isEmpty().withMessage('User ID is required'),
      body('ticker_symbol').not().isEmpty().withMessage('Ticker Symbol is required'),
      body('type').not().isEmpty().withMessage('Trade type is required'),
      body('type').isIn(['BUY', 'SELL'], 'Invalid trade type'),
      body('shares').not().isEmpty().withMessage('Number of shares is required'),
      body('shares').isFloat( {gt: 0} ).withMessage('Number of shares is invalid'),
      body('trade_price').isFloat( {gt: -1} ).withMessage('Trade Price is invalid')
    ],
  addTrade)
  .put(
    [
      query('user_id').not().isEmpty().withMessage('Please enter User ID'),
      body('type').isIn(['BUY', 'SELL'], 'Invalid trade type'),
      body('shares').isFloat( {gt: 0} ).withMessage('Number of shares is invalid'),
      body('trade_price').isFloat( {gt: -1} ).withMessage('Trade Price is invalid')
    ],
    updateTrade)
  .delete(
    [
      query('user_id').not().isEmpty().withMessage('Please enter User ID')
    ],
    removeTrade);


apiRouter
  .route('/user')
  .post(
    [
      body('name').not().isEmpty().withMessage('Name is required'),
    ],
    addUser);

apiRouter
  .route('/portfolio/:id')
  .get(
    [
      param('id').not().isEmpty().withMessage('Please enter User ID')
    ],
    getPortfolio);

apiRouter
  .route('/return/:id')
  .get(
    [
      param('id').not().isEmpty().withMessage('Please enter User ID')
    ],
    getReturn);

module.exports = {apiRouter};