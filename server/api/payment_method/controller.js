const { Paymentmethod: Model } = require("../../sequelize");
const { Users: UserModel } = require("../../sequelize");
const { signToken } = require("../auth");
const { registerError } = require("../utils")

var _ = require('lodash');

//Create new payment_method 
exports.create_payment_method = async (req, res, next) => {
  const { body = {} } = req;
  const { user_id } = body;
  const id = user_id
  const message = "User doesn't exist"
  UserModel.findOne({ where: { id } })
    .then(async data => {
      if (!data) {
        return next({
          success: false,
          message,
          statusCode: 401,
          level: "info",
        });
      }
      return data;
    })
    .then(async data => {
      Model.create(body)
        .then(pay_meth => {
          res.status(201);
          res.json({
            success: true,
            data: pay_meth,
          });
        })
        .catch(error => {
          registerError(error, req, user_id);
          next(new Error(error));
        })
    })
}

exports.get_payment_method = async (req, res, next) => {
  const { params = {} } = req;
  const user_id = params.user_id
  try {
    const data = await UserModel.findOne({ where: { id: user_id } });
    const { status_user, dispenser, customermpid, hash_code, createdAt, updatedAt } = data;

    if (status_user === 'Inactive') {
      return next({
        success: false,
        message: "Users blocked " + user_id,
        statusCode: 401,
        level: "info",
      })
    }
    await Model.findOne({ where: { user_id: user_id }, attributes: ['id', 'user_id', 'last_four_digits', 'payment_method_id', 'createdAt', 'hash_code', 'customermpid'] })
      .then(async data => {
        if (!data) {
          if (dispenser) {
            const datos = {
              user_id,
              customermpid,
              hash_code,
              payment_method_id: "0000000000",
              last_four_digits: " 0000",
              card_default: true,
              createdAt,
              updatedAt

            }
            res.status(201);
            return res.json({
              success: true,
              message: `user ${user_id} upload, permissions granted. Process to load products`,
              data: datos
            })//"user upload, permissions granted. Process to load products"

          } else {

            return next({
              success: false,
              message: "There is no payment method for user " + user_id,
              statusCode: 401,
              level: "info",
            });
          }
        }
        res.status(201);
        res.json({
          success: true,
          data,
        });
      })
      .catch(error => {
        registerError(error, req, user_id);
        next(new Error(error));
      });

  } catch (error) {
    registerError(error, req, user_id)
    return next(new Error(`Error, details ${error}`))
  }
};

exports.get_payment_method_all = async (req, res, next) => {
  const { params = {} } = req;
  const user_id = params.user_id
  try {

    const data = await UserModel.findOne({ where: { id: user_id } });
    const { status_user, dispenser, customermpid, createdAt, updatedAt, super_user, phone_verification, identification, phone } = data;
    if (status_user === 'Inactive') {
      res.status(200);
      return res.json({
        success: false,
        message: "Users blocked " + user_id,
        statusCode: 200,
        data: [],
        identification
      })
    } else
      await Model.findAll({ where: { user_id: user_id }, attributes: ['id', 'user_id', 'last_four_digits', 'payment_method_id', 'createdAt', 'hash_code', 'customermpid', 'card_default'],
                             order: [['createdAt', 'DESC']]})
        .then(async data => {
          if (_.isEmpty(data)) {
            if (dispenser || super_user) {
              const datos = {
                user_id,
                customermpid,
                hash_code: "$2a$10$t1p.Fe13FYK/NqCrsYi5cOn1K.BhzEou4gBZ5Ke.PmLW4p7uyIIgi",
                payment_method_id: "0000000000",
                last_four_digits: " 0000",
                card_default: true,
                createdAt,
                updatedAt,
                phone_verification

              }
              res.status(201);
              return res.json({
                success: true,
                message: `user ${user_id} upload, permissions granted. Process to load products`,
                data: [datos],
                identification: "123456789",
                phone: "123456789"
              })
            } else {
              res.status(200)
              return res.json({
                success: false,
                message: "There is no payment method for user " + user_id,
                statusCode: 200,
                data: [],
                identification,
                phone
              });
            }
          }
          res.status(201);
          res.json({
            success: true,
            data,
            identification,
            phone
          });
        })
        .catch(error => {
          registerError(error, req, user_id);
          next(new Error(error));
        });
  } catch (error) {
    registerError(error, req, user_id);
    return next(new Error(`Error, details: ${error}`))
  }
}

exports.change_card_default = async (req, res, next) => {
  try {
    const { params = {} } = req;
    const payment_method_id = params.payment_id
    const user_payment = await Model.findOne({ where: { payment_method_id } })
    const user_id = user_payment.user_id
    const user_default = await Model.update({ card_default: false }, { returning: true, where: { user_id, card_default: true } })
    if (!user_default[0]) {
      return next(new Error("Not fount user card default update"));
    }
    const card_change = await Model.update({ card_default: true }, { returning: true, where: { payment_method_id, user_id } })
    if (card_change[0] === 1) {
      res.status(200);
      res.json({
        success: true,
      });
    } else {
      res.status(200);
      res.json({
        success: false,
      });
    }
  } catch (error) {
    registerError(error, req, user_id);
    return next(new Error(`Error, details: ${error}`));
  }

}