const { Nextonia_Transactions: Model } = require("../../sequelize");

exports.get_transactions = async (req, res, next) => {
  Model.findAll({ order: ['bought_date'] })
    .then(async data => {
      if (!data) {
        return next({
          success: false,
          message,
          statusCode: 401,
          level: "info",
        });
      }
      res.json({
        success: true,
        data
      })
    })
    .catch((error) => {
      next(new Error(error));
    });
}
