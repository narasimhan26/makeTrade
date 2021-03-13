const { User } = require('../models/schema');

exports.addUser = async (req, res) => {
  try {
    const trade = await User.create(req.body);

    return res.status(201).json({
      success: true,
      data: trade
    });
  }
 catch (error) {
   console.log(error._message);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error._message
    });
  }
}