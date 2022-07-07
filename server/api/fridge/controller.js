const { Fridge: Model } = require("../../sequelize");

exports.create = async (req, res, next) => {
  const { body = {} } = req;

  Model.create(body)
    .then(data => {
      console.log(body)
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


exports.getfridges = async (req, res, next) => {
  Model.findAll()
    .then(async data => {
      if (!data) {
        return next({
          success: false,
          message,
          statusCode: 401,
          level: "info",
        });
      }
      res.status(200)
      res.json({
        success: true,
        data
      })

    })
    .catch((error) => {
      next(new Error(error));
    });

}
