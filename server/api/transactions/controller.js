const { Transactions: Model, Movements_payments } = require("../../sequelize");
const { Storage } = require('@google-cloud/storage');
const { Transaction_x_Product: Transaction_x_Product } = require('../../sequelize')
const { Product: Product, Fridge_x_Product } = require('../../sequelize')
const { Mercadopago_payment } = require("../../sequelize");
const { Users: Users } = require("../../sequelize");
const { Nextonia_Transactions } = require("../../sequelize");
const { Video } = require("../../sequelize");
const { Status_token } = require("../../sequelize");
const { Paymentmethod } = require("../../sequelize");
const { Op } = require("sequelize");

const { registerError, request_bambbu } = require("../utils");

const storage = new Storage();
const bucketName = 'alpina-fridges-video';
var mercadopago = require('mercadopago');
var _ = require('lodash');

exports.create_video = async (req, res, next) => {
  const params = req.query
  //console.log(req.query)
  console.log(params)
  const file = req.file
  if (file) {
    console.log(file)
    console.log(file.path)
    var file_name = file.filename
  }
  else {
    var file_name = "No video"

  }

  const { id, serial, userId, date, duration, size, alert_level, temp, trasactionId } = params;

  if (userId.startsWith('SF')) {
    var card_token = 'User has not card token'
    var transaction_state = 'FRIDGE'
  }
  else {
    var { card_token, dispenser } = await Users.findOne({ where: { id: userId } });
    if (dispenser) {
      var transaction_state = 'STOCK'
    }
  }
  console.log(card_token)
  //console.log(req.body)
  const data_transaction = {
    'register_id': id,
    'user_id': userId,
    'fridge_id': serial,
    'bought_date': date,
    'video_duration': duration,
    'recieved_date': Date.now(),
    'video_name': file_name,
    'video_link': 'https://storage.googleapis.com/alpina-fridges-video/' + file_name + '?organizationId=11017327266',
    'video_size': size,
    'fridge_alert_level': alert_level,
    'fridge_temp': temp,
    'card_token': card_token,
    'transaction_id': trasactionId,
    'transaction_state': transaction_state || 'UNPAID'
  }


  const vid = Video.findOne({ where: { transaction_id: trasactionId } })
    .then(async data => {
      if (!data) {
        await Model.create(data_transaction)
      }
    })
  const a = await Video.create({
    register_id: id,
    transaction_id: trasactionId,
    video_name: file_name,
    video_link: 'https://storage.googleapis.com/alpina-fridges-video/' + file_name + '?organizationId=11017327266',
    video_size: size,
    fridge_alert_level: alert_level,
    fridge_temp: temp,
    video_duration: duration,
  })

  if (file) {
    storage
      .bucket(bucketName)
      .upload(file.path)
      .then(() => {
        console.log(`${file.path} uploaded to ${bucketName}.`);
        res.status(201);
        res.json({
          id: id
        });

      })
      .catch(err => {
        console.error('ERROR:', err);
      });
  }
  else {
    res.status(201);
    res.json({
      id: id
    });

  }

}


exports.unpaid_transactions = async (req, res, next) => {
  Model.findOne({ where: { transaction_state: "UNPAID" }, attributes: ['id', 'user_id', 'fridge_id', 'total_price', 'bought_date', 'recieved_date', 'video_name', 'video_link', 'video_duration', 'transaction_state', 'transaction_id', 'charged_date'] })
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

exports.pending_transactions = async (req, res, next) => {
  Model.findOne({ where: { transaction_state: "PENDING" }, attributes: ['id', 'user_id', 'fridge_id', 'total_price', 'bought_date', 'recieved_date', 'video_name', 'video_link', 'video_duration', 'transaction_state', 'transaction_id', 'charged_date'] })
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

exports.transactions = async (req, res, next) => {
  const { body = {}, params = {} } = req;
  console.log(params)
  const transaction_state = params.transaction_state
  Model.findAll({ where: { transaction_state: transaction_state }, include: [{ model: Video, as: 'videos', required: false }] })
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

exports.charge = async (req, res, next) => {
  console.log(req.body)
  const { id, transaction_state, total_price } = req.body
  Model.update({ transaction_state: transaction_state, total_price: total_price }, { where: { id: id } })
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
        data
      })

    })
    .catch((error) => {
      next(new Error(error));
    });
}

exports.get_user_transaction = async (req, res, next) => {
  const { body = {}, params = {} } = req;
  console.log(params)
  const user_id = params.user_id
  Model.findAll({ where: { user_id }, attributes: ['id', 'user_id', 'fridge_id', 'total_price', 'bought_date', 'recieved_date', 'video_name', 'video_link', 'video_duration', 'transaction_state', 'transaction_id', 'charged_date'] })
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

exports.get_transactions_history = async (req, res, next) => {
  const { params = {} } = req;
  console.log(params)
  const user_id = params.user_id
  Model.findAll({ where: { user_id: user_id }, attributes: ['id', 'bought_date', 'user_id', 'fridge_id', 'total_price', 'recieved_date', 'transaction_state'], include: [{ model: Transaction_x_Product, as: 'transaction', required: false, include: { model: Product, as: 'product', required: false } }] })
    .then(async data => {
      if (!data) {
        return next({
          success: false,
          message,
          statusCode: 401,
          level: "info",
        });
      }
      Nextonia_Transactions.findAll({ where: { user_id: user_id }, include: [{ model: Transaction_x_Product, as: 'transaction', required: false, include: { model: Product, as: 'product', required: false } }] })
        .then(async response => {
          if (!response) {
            return next({
              success: false,
              message,
              statusCode: 401,
              level: "info",
            });
          }
          res.json({
            success: true,
            data: [...response, ...data]
          })

        })


    })
    .catch((error) => {
      next(new Error(error));
    });
}

exports.charge_nextonia = async (req, res, next) => {
    const comercioid = '768b3474-94e2-4683-d186-08d87a1548bd';
  const bolsilloId = 'c41a30f4-e45c-47e9-262a-08d87a15727c';
  const transaccionTipoId = "64D9C1D8-00B6-4E3F-6E0F-08D6B97C9EA9";
    const { products, user_id, bought_date, fridge_id } = req.body
    const descripcion = "Compra de productos en nevera práctico"
    const cuotas = 1
    let total_price = 0
    var pending = false
    var res_payment
    try {
        const user = await Users.findOne({ where: { id: user_id } });
    if (!user){
      return next(new Error("Error user not found BD"));
        }
        const {
            customermpid,
            dispenser,
            phone,
            select_payment
        } = user

        const transaction = await Nextonia_Transactions.create({
            user_id,
            bought_date,
            fridge_id,
            recieved_date: Date.now(),
            transaction_state: 'UNPAID'
        })
        
        const transaction_id = transaction.id

        //Get the total of the transaction
        for (let i = 0; i < products.length; i++) {
            product_id = products[i].sku
            await Fridge_x_Product.findOne({ where: { fridge_id, product_id } })
                .then(async data => {
                if (!data){
                    res.status(404);
                    res.json({
                        success: false,
                        msg: 'No se encuentra el producto '+ product_id + 'en la base de datos',
                    });
                }
                total_price = total_price + data.price * products[i].quantity
                console.log(total_price)
                await Transaction_x_Product.create({
                    transaction_id: transaction_id,
                    product_id: product_id,
                    quantity: products[i].quantity,
                    per_unit_price: data.price
                })
            })
        }
        if (select_payment == 1){
            //configure mp and make the payment
            mercadopago.configure({
            access_token: 'APP_USR-3069754945804033-011520-276c0102cac698bfb9c292fed0c127f5-436472912',
            sandbox: true,
            });
    
    
            const user_payment_method = await Paymentmethod.findOne({ where: { user_id, card_default: true } })
            if (!user_payment_method){
                return next(new Error("Error not select card default in BD"));
            }
            const payment_id_default = user_payment_method.payment_method_id;
            const user_status_token = await Status_token.findAll({ where: { user_id, payment_id: payment_id_default, status: true } });
            let i = 0;
            let card_token
            while(i < user_status_token.length){
                status_token = await mercadopago.card_token.get(user_status_token[i].card_token)
                if (Date.parse(status_token.response.date_due) <= Date.now() || status_token.response.status != 'active'){
                    await Status_token.update(
                        {
                        status: false
                        },
                        { returning: true, where: { id: user_status_token[i].id } },
                    );
                } else {
                    card_token = user_status_token[i].card_token
                    break
                }
                i++
            }
    
            if (dispenser) {
                await Nextonia_Transactions.update({
                    total_price: transaction_amount,
                    transaction_state: 'STOCK'
                },
                { returning: true, where: { id: transaction_id } })
    
    
                res.status(201);
                res.json({
                    success: true,
                    data: 'USUARIO DE STOCK',
                });
            }
            else {
    
                if (!card_token) {
                    return next(new Error("This user doesn't have cardToken setted"));
                } else {
                    try {
                        const data = await mercadopago.payment.save({
                            transaction_amount: total_price,
                            token: card_token,
                            description: descripcion,
                            installments: cuotas,
                            statement_descriptor: "Práctico",
                            payer: {
                                type: "customer",
                                id: customermpid,
                            }
                        });
    
                        const {
                            id,
                            date_created,
                            date_approved,
                            payment_method_id,
                            status_detail,
                            description,
                            statement_descriptor,
                            transaction_amount,
                            installments,
                        } = data.body;
                        // Mercadopago_payment
                        let status = data.body.status
                        if (status) {
                          status_token = await mercadopago.card_token.get(card_token)
                          if (Date.parse(status_token.response.date_due) <= Date.now() || status_token.response.status != 'active'){
                            await Status_token.update(
                                {
                                status: false
                                },
                                { returning: true, where: { card_token } },
                            );
                          }
                        }
    
                        await Mercadopago_payment.create({
                            payment_id: id,
                            user_id: user_id,
                            date_created: date_created,
                            date_approved: date_approved,
                            payment_method_id,
                            status,
                            status_detail,
                            description,
                            statement_descriptor,
                            transaction_amount,
                            installments,
                            transaction_id
                        });
                        await Nextonia_Transactions.update({
                            total_price: transaction_amount,
                            transaction_state: status.toUpperCase()
                        },
                        { returning: true, where: { id: transaction_id } })
    
                        if( status != 'approved'){
                            status = "pending_payment"
                        }
    
                        const dataPaymentCreate = await Movements_payments.create({
                            date_created,
                            date_approved,
                            user_id,
                            status,
                            status_detail,
                            payment_method: payment_method_id,
                            payment_method_id: payment_id_default, 
                            transaction_amount,
                            transaction_id
                        })
    
                        res.status(201);
                        res.json({
                            success: true,
                            data: dataPaymentCreate,
                            msg: status_detail
                        });
                    } catch (error) {
                        if ([3003, 2006, 3006, 3008,3031].find((errorCode) => error.cause[0].code === errorCode)) {
                            await Users.update(
                                {
                                card_token: null,
                                },
                                { returning: true, where: { id: user_id } },
                            );
                        registerError(error, req, user_id);
                        next(new Error(error));
                        } else {
                            registerError(error, req, user_id);
                            next(new Error(error));
                        }
                    }
                }
            }

        } else if (select_payment == 2){ 
            // payment wallet
            const res_json = await request_bambbu(true, 'GET', `api/UsuarioBolsillo/bolsillos/57/${phone}/${comercioid}`,req, user_id )
            if (_.isEmpty(res_json)){
                return next(new Error(`api bambbu bolsillo not found, details: ${res_json}`))
            }
            const saldo = res_json[0].saldo
            if( saldo < total_price){
                const restante = total_price - saldo
                if (saldo > 0){
                    const data_payment = {
                        phoneNumber: phone,
                        valor: saldo,
                        referencia: transaction_id,
                        bolsilloId,
                        transaccionTipoId
                    }
                    const res_payment_pendig = await  request_bambbu(data_payment,'POST',"api/Transaccion/pago", req, user_id)
                    if (_.isEmpty(res_payment_pendig)){
                        if (res_payment_pendig.estado != true){
                            res.status(500)
                            return res.json({
                                success: false,
                                data: res,
                                message: "Error payment bambu"
                            })
                        } 
                    }
                    pending = await Movements_payments.create({
                        date_created: Date.now(),
                        user_id,
                        status: "pending_payment",
                        status_detail: `Se cobró ${saldo} en la billetera, quedan restante ${restante}`,
                        payment_method: "wallet",
                        transaction_amount: restante,
                        transaction_id
                    })
                } else {

                    pending = await Movements_payments.create({
                        date_created: Date.now(),
                        user_id,
                        status: "pending_payment",
                        status_detail: `Se debe un total de ${restante}, la billetera no tiene saldo`,
                        payment_method: "wallet",
                        transaction_amount: restante,
                        transaction_id
                    })  
                }
                await Nextonia_Transactions.update({
                    total_price,
                    transaction_state: "PENDING".toUpperCase()
                  },
                    { returning: true, where: { id: transaction_id } })
        
                
    
            } else {
                const data_payment = {
                    phoneNumber: phone,
                    valor: total_price,
                    referencia: transaction_id,
                    bolsilloId,
                    transaccionTipoId
                }
                res_payment = await request_bambbu(data_payment,'POST',"api/Transaccion/pago", req, user_id)
                if (_.isEmpty(res_payment)){
                    if (res_payment.estado != true){
                        res.status(500)
                        return res.json({
                            success: false,
                            data: res_payment,
                            message: "Error payment bambu"
                        })
                    } 
                }
                await Nextonia_Transactions.update({
                    total_price,
                    transaction_state: "APPROVED".toUpperCase()
                  },
                    { returning: true, where: { id: transaction_id } })
        
            }
            let data = null
            if (saldo > 0 && !pending){
                data = await Movements_payments.create({
                    date_created: Date.now(),
                    date_approved: Date.now(),
                    user_id,
                    status: "approved",
                    status_detail: "Ok",
                    payment_method: "wallet",
                    transaction_amount: total_price,
                    transaction_id
                })
            } else if(saldo > 0 && pending){
                data = await Movements_payments.create({
                    date_created: Date.now(),
                    date_approved: Date.now(),
                    user_id,
                    status: "approved",
                    status_detail: "Ok",
                    payment_method: "wallet",
                    transaction_amount: saldo,
                    transaction_id
            })
            }
            
            if(!pending){
                res.status(201)
                res.json({
                    success: true,
                    data,
                    res_payment,
                    msg: "full payment with waller"
                })
            } else {
                res.status(201)
                res.json({
                    success: true,
                    data,
                    res_payment,
                    msg: pending
                })
            }
        }

    } catch (error) {
        registerError(error, req, user_id);
        next(new Error(error));
    }
}


exports.test_charge_nextonia = async (req, res, next) => {

  console.log(req.body)
  const { products, user_id, bought_date, fridge_id } = req.body
  const descripcion = "Compra de productos en nevera práctico TEST"
  const cuotas = 1
  let total_price = 0

  const transaction = await Nextonia_Transactions.create({
    user_id,
    bought_date,
    fridge_id,
    recieved_date: Date.now(),
    transaction_state: 'TEST'
  })

  transaction_id = transaction.id


  //Get the total of the transaction
  for (let i = 0; i < products.length; i++) {
    product_id = products[i].sku
    await Fridge_x_Product.findOne({ where: { fridge_id, product_id } })
      .then(async data => {
        if (data) {
          total_price = total_price + products[i].price * products[i].quantity
          console.log(total_price)
          await Transaction_x_Product.create({
            transaction_id: transaction_id,
            product_id: product_id,
            quantity: products[i].quantity,
            per_unit_price: products[i].price
          })
        }
        else {
          res.status(404);
          res.json({
            success: false,
            msg: 'No se encuentra uno o más productos registrados en la nevera',
          });

        }

      })
  }

  //configure mp and make the payment
  mercadopago.configure({
    access_token: 'TEST-3069754945804033-011520-6828382dbe4b7480241a768143c18900-436472912',
    sandbox: true,
  });

  try {
    const { customermpid, card_token, email, dispenser } = await Users.findOne({ where: { id: user_id } });
    if (dispenser) {
      await Nextonia_Transactions.update({
        total_price: 0,
        transaction_state: 'STOCK'
      },
        { returning: true, where: { id: transaction_id } })


      res.status(201);
      res.json({
        success: true,
        data: 'USUARIO DE STOCK',
      });
    }
    else {

      if (_.isEmpty(card_token)) {
        next(new Error("This user doesn't have cartToken setted"));
      } else {
        try {
          const { response: { results } } = await mercadopago.customers.search({ qs: { email } });

          let customerFromMP = results[0].cards[0];
          let metodoPago = customerFromMP.payment_method.id
          console.log(customerFromMP)
          console.log(metodoPago)

          const data = await mercadopago.payment.save({
            transaction_amount: total_price,
            token: card_token,
            description: descripcion,
            installments: cuotas,
            payment_method_id: metodoPago,
            payer: {
              type: "customer",
              id: customermpid,
            }
          });


          const {
            id,
            date_created,
            date_approved,
            payment_method_id,
            status,
            status_detail,
            description,
            statement_descriptor,
            transaction_amount,
            installments,
          } = data.body;
          // Mercadopago_payment

          const dataPaymentCreate = await Mercadopago_payment.create({
            payment_id: id,
            user_id: user_id,
            date_created: date_created,
            date_approved: date_approved,
            payment_method_id,
            status,
            status_detail,
            description,
            statement_descriptor,
            transaction_amount,
            installments,
            transaction_id
          });

          await Nextonia_Transactions.update({
            total_price: transaction_amount,
            //transaction_state: status
            transaction_state: 'TEST_' + STATUS
          },
            { returning: true, where: { id: transaction_id } })

          res.status(201);
          res.json({
            success: true,
            data: dataPaymentCreate,
          });
        } catch (error) {
          console.log(error)
          if ([3003, 2006, 3006, 3008].find((errorCode) => error.cause[0].code === errorCode)) {
            await Users.update(
              {
                card_token: null,
              },
              { returning: true, where: { id: user_id } },
            );
            next(new Error("The stored card token expired or it was already used"));
          } else {
            next(new Error(error));
          }
        }
      }
    }
  } catch (error) {
    next(new Error(error));
  }
}


