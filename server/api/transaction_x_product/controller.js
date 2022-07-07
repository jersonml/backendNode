const { Transaction_x_Product: Model } = require("../../sequelize");

exports.add = async (req, res, next) => {
  const { body = {} } = req;
  console.log(body)

  Model.bulkCreate(body)
    .then(data => {
      res.status(201);
      res.json({
        success: true,
        data,
      });
    })
    .catch(error => {
      next(new Error(error));
    });
};

