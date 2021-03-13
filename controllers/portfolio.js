const { User } = require('../models/schema');
const { validationResult }  = require('express-validator');
const { calculateReturn } = require('../utils/transaction');

exports.getPortfolio = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    const {portfolios} = user;

    res.status(200).send({
      success: true,
      portfolio: portfolios
    });
  }
  catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: 'Internal Error'
    });
  }
}

exports.getReturn = async (req, res) => {
  try {
    console.log(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    const returns = calculateReturn(user.portfolios);

    res.status(200).send({
      success: true,
      returns: returns
    });
  }
  catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: 'Internal Error'
    });
  }
}