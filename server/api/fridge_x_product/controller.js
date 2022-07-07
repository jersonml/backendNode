const { Fridge_x_Product: Model } = require("../../sequelize");
const { Product: Product } = require('../../sequelize')
exports.create = async (req, res, next) => {
  const { body = {} } = req;

  Model.create(body)
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

exports.getfridge_x_product = async (req, res, next) => {
  const { body = {}, params = {} } = req;
  console.log(params)
  const fridge_id = params.fridge_id
  Model.findAll({ where: { fridge_id: fridge_id }, include: [{ model: Product, as: 'product', required: false }] })
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


exports.getfridge_x_products = async (req, res, next) => {
  Model.findAll({ include: [{ model: Product, as: 'product', required: false }] })
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

exports.delete = async (req, res, next) => {
  const { body = {} } = req;
  const { fridge_id, product_id } = body
  Model.destroy({ where: { fridge_id: fridge_id, product_id: product_id } })
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
