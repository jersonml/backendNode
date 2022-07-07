const { Status_token } = require("../../sequelize");
const { registerError } = require('../utils');
let _ = require('lodash')
let mercadopago = require('mercadopago');
const { response } = require("express");

exports.clearToken = async (req, res, next) => {
    try {
        mercadopago.configure({
            access_token: 'APP_USR-3069754945804033-011520-276c0102cac698bfb9c292fed0c127f5-436472912',
            sandbox: true,
        });
        tokens = await Status_token.findAll({ where:{ status: true  } })
        for (let i = 0; i < tokens.length ; i++){
            card_token = tokens[i].card_token
            status_token = await mercadopago.card_token.get(card_token)
            if (Date.parse(status_token.response.date_due) <= Date.now() || status_token.response.status != 'active'){
              await Status_token.update(
                  {
                  status: false
                  },
                  { returning: true, where: { card_token } },
              )
            }
        }
        res.status(204)
        return res.json({})
    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error))
    }
}

