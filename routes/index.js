const express = require('express');
const { addTrade, getTrades, removeTrade, updateTrade } = require('../controllers/trade')
const { addUser } = require('../controllers/user')
const { getPortfolio, getReturn } = require('../controllers/portfolio')
const { body, param, query } = require('express-validator');

const apiRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name : Trade
 *   description : API to make trade.
 * components:
 *   schemas:
 *     AddTrade:
 *      type: object
 *      properties:
 *        user_id:
 *          type: string
 *          description: 604b4559566b8e42f461cb9c
 *          required : true
 *        ticker_symbol:
 *          type: string
 *          description: TCS / WIPRO / GODREJIND.
 *          required : true
 *        type:
 *          type: string
 *          description: SELL / BUY
 *          required : true
 *        shares:
 *          type: number
 *          description: 10.
 *          required : true
 *        trade_price:
 *          type: number
 *          description: 10.
 *          format: float
 *     UpdateTrade:
 *      type: object
 *      properties:
 *        user_id:
 *          type: string
 *          description: 604b4559566b8e42f461cb9c
 *        ticker_symbol:
 *          type: string
 *          description: TCS / WIPRO / GODREJIND.
 *        type:
 *          type: string
 *          description: SELL / BUY
 *        shares:
 *          type: number
 *          description: 10.
 *        trade_price:
 *          type: number
 *          description: 10.
 *          format: float
 *     AddUser:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: Name of the user
 */

/**
 * @swagger
 * /trade:
 *   post:
 *     nickname : Make a new Trade
 *     summary: Buy / Sell shares for the security and create / update a portfolio
 *     tags: [Trade]
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTrade'
 *
 *     responses:
 *       "201":
 *         description: Trade processed successfully.
 *       "400":
 *         description: Invalid Request.
 *       "500":
 *         description: Server Error.
*/

/**
 * @swagger
 * /trade:
 *   get:
 *     nickname : Gets all the proccessed
 *     summary: Response will include all the securities and trades correspondingto it.
 *     tags: [Trade]
 *     responses:
 *       "200":
 *         description: Aggregate View of trades.
 *       "500":
 *         description: Server Error
*/

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
  addTrade);

/**
 * @swagger
 * /trade/:id:
 *    put:
 *     nickname : Update a Trade from history
 *     summary: All fields of a given trade can be updated including trade type.
 *     tags: [Trade]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: userID
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTrade'
 *
 *     responses:
 *       "201":
 *         description: Trade Updated successfully.
 *       "400":
 *         description: Invalid Request.
 *       "500":
 *         description: Server Error.
*/

/**
 * @swagger
 * /trade/:id:
 *    delete:
 *     nickname : Delete a Trade from history
 *     summary: A trade of a security will be removed from the portfolio reverting the changes it had when it was added.
 *     tags: [Trade]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: userID
 *         description: The user ID
 *     responses:
 *       "201":
 *         description: Trade Removed successfully.
 *       "400":
 *         description: Invalid Request.
 *       "500":
 *         description: Server Error.
*/

apiRouter
  .route('/trade/:id')
  .put(
    [
      param('id').not().isEmpty().withMessage('Please enter ID'),
      body('type').isIn(['BUY', 'SELL'], 'Invalid trade type'),
      body('shares').isFloat( {gt: 0} ).withMessage('Number of shares is invalid'),
      body('trade_price').isFloat( {gt: -1} ).withMessage('Trade Price is invalid')
    ],
    updateTrade)
  .delete(
    [
      param('id').not().isEmpty().withMessage('Please enter Trade ID')
    ],
    removeTrade);

/**
 * @swagger
 * /user:
 *   post:
 *     nickname : Make a new Trade
 *     summary: Buy / Sell shares for the security and create / update a portfolio
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddUser'
 *
 *     responses:
 *       "201":
 *         description: User Created successfully.
 *       "400":
 *         description: Invalid Request.
 *       "500":
 *         description: Server Error.
*/

apiRouter
  .route('/user')
  .post(
    [
      body('name').not().isEmpty().withMessage('Name is required'),
    ],
    addUser);

/**
 * @swagger
 * /portfolio/:id:
 *   get:
 *     nickname : Gets all the portfolio for one user
 *     summary: Response will include securities and share counts corresponding to it.
 *     tags: [Trade]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: userID
 *         description: The user ID
 *     responses:
 *       "200":
 *         description: List of all securities under a portfolio
 *       "500":
 *         description: Server Error
*/

apiRouter
  .route('/portfolio/:id')
  .get(
    [
      param('id').not().isEmpty().withMessage('Please enter User ID')
    ],
    getPortfolio);


/**
 * @swagger
 * /return/:id:
 *   get:
 *     nickname : Gets all the returns from a portfolio for one user
 *     summary: Cumulative returns at any point of time of a particular portfolio.
 *     tags: [Trade]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: userID
 *         description: The user ID
 *     responses:
 *       "200":
 *         description: Returns a cumulative value
 *       "500":
 *         description: Server Error
*/

apiRouter
  .route('/return/:id')
  .get(
    [
      param('id').not().isEmpty().withMessage('Please enter User ID')
    ],
    getReturn);

module.exports = {apiRouter};