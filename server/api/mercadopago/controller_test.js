const { Users: Model } = require("../../sequelize");
const { Mercadopago_payment } = require("../../sequelize");
const { Mercadopago_refunds } = require("../../sequelize");
const { Paymentmethod } = require("../../sequelize")
const { Status_token } = require("../../sequelize");

var mercadopago = require('mercadopago');
var _ = require('lodash');



exports.realizarPago = async (req, res, next) => {
  mercadopago.configure({
    access_token: 'TEST-3069754945804033-011520-6828382dbe4b7480241a768143c18900-436472912',
    sandbox: true,
  });
  const { body = {} } = req;
  const {
    valor,
    descripcion,
    cuotas,
    idUsuario,
  } = body;

  try {
    const { customermpid, card_token, email } = await Model.findOne({ where: { id: idUsuario } });
    if (_.isEmpty(card_token)) {
      next(new Error("This user doesn't have cartToken setted"));
    } else {
      try {
        const { response: { results } } = await mercadopago.customers.search({ qs: { email } });
        let customerFromMP = results[0].cards[0];
        let metodoPago = customerFromMP.payment_method.id
        const data = await mercadopago.payment.save({
          transaction_amount: valor,
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
          user_id: idUsuario,
          date_created: date_created,
          date_approved: date_approved,
          payment_method_id,
          status,
          status_detail,
          description,
          statement_descriptor,
          transaction_amount,
          installments,
        });

        res.status(201);
        res.json({
          success: true,
          data: dataPaymentCreate,
        });
      } catch (error) {
        if ([3003, 2006, 3006, 3008].find((errorCode) => error.cause[0].code === errorCode)) {
          await Model.update(
            {
              card_token: null,
            },
            { returning: true, where: { id: idUsuario } },
          );
          next(new Error("The stored card token expired or it was already used"));
        } else {
          next(new Error(error));
        }
      }
    }
  } catch (error) {
    next(new Error(error));
  }
};

exports.addCardTokenToUser = async (req, res, next) => {
	mercadopago.configure({
		access_token: 'TEST-3069754945804033-011520-6828382dbe4b7480241a768143c18900-436472912',
		sandbox: true,
	});

	const { body = {} } = req;
	const {
		userId,
		cardToken,
		hash_code,
	} = body;

	try {
		let usuario = await Model.findOne({ where: { id: userId } });

		if (_.isEmpty(usuario)) {
			next(new Error("User not found in DB"));
		} else {
			const { phone, identification, email, name } = usuario;
			let { customermpid } = usuario;
			if (_.isEmpty(customermpid)) {
				const { response: { results } } = await mercadopago.customers.search({ qs: { email } });
				let customerFromMP = results[0];
				if (_.isEmpty(customerFromMP)) {
					const new_results = await mercadopago.customers.create({
						email,
						first_name: name,
						phone: {
							area_code: "057",
							number: phone,

						},
						identification: {
							type: "CC",
							number: identification,
						},
					});
					customerFromMP = new_results.response
				}
				customermpid = customerFromMP.id;
				const card_data = await mercadopago.customers.cards.create({
					token: cardToken,
					id: customermpid,
				});
				try {
                    
					let metodoPago = card_data.response.payment_method.id
					const data = await mercadopago.payment.save({
						transaction_amount: 1000,
						token: cardToken,
						description: "Cobro de verificación",
						installments: 1,
						payer: {
							type: "customer",
							id: customermpid,
						}
                    });
                    
					var {
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
                    
					if (true) {

						await Paymentmethod.create({
							user_id: userId,
							last_four_digits: 6451,
							payment_method_id: card_data.response.id,
							hash_code: hash_code,
							customermpid: customermpid
						})

						const a = await mercadopago.payment.refund(data.body.id)
						await Model.update(
							{
								card_token: cardToken,
								customermpid: customermpid,
								hash_code: hash_code
							},
							{ returning: true, where: { id: userId } },
						);

                        
						let {
							id,
							transaction_amount_refunded,
							date_created,
							status
						} = a.body
						const s = await Mercadopago_refunds.create({
							payment_id: id,
							user_id: userId,
							status,
							transaction_amount_refunded: transaction_amount_refunded,
							date_created,
						})
                        
						res.status(201);
						res.json({
							success: true,
							data: "The Card is valid",
						});
					} else {
						let id = customermpid
						let card_id = card_data.response.id
						const delete_tc = await mercadopago.customers.cards.delete(id, card_id)
						res.status(401);
						res.json({
							success: false,
							data: "The Card is not valid",
						});
					}


				} catch (error) {
					console.log("HUBO UN ERRORR")
					console.log(error)
					if ([3003, 2006, 3006, 3008].find((errorCode) => error.cause[0].code === errorCode)) {

						await Model.update(
							{
								card_token: null,
							},
							{ returning: true, where: { id: userId } },
						);
						next(new Error("The stored card token expired or it was already used"));
					} else {
						next(new Error(error));
					}



				}

			} else {

				let payment_method_bd = await Paymentmethod.findAll({ where: { user_id: userId } });
				if (_.isEmpty(payment_method_bd)) {
					const { response: { results } } = await mercadopago.customers.search({ qs: { email } });
					let customerFromMP = results[0];
					customermpid = customerFromMP.id
					console.log(customerFromMP)
					await Paymentmethod.create({
						user_id: userId,
						last_four_digits: customerFromMP.cards[0].last_four_digits,
						payment_method_id: customerFromMP.cards[0].id,
						hash_code: hash_code,
						customermpid: customermpid

					})
				}
				let user_card_default = await Paymentmethod.findOne({where: {user_id: userId, card_default: true}})
				var default_payment_id
				if (_.isEmpty(user_card_default)){
					return next(new Error("Error not card default"))

				} else {
					default_payment_id = user_card_default.payment_method_id
				}
				await Status_token.create(
					{
					user_id: userId,
					status: true,
					payment_id : default_payment_id,
					card_token: cardToken
				})
				await Model.update(
					{
						card_token: cardToken,
						customermpid: customermpid,
						hash_code

					},
					{ returning: true, where: { id: userId } },
				);
				res.status(200);
				res.json({
					success: true,
					data: "Card token added correctly",
				});
			}

		}
	} catch (error) {
		next(new Error(error));
	}
};
exports.addCardsMultiples = async(req, res, next) => {
	mercadopago.configure({
		access_token: 'APP_USR-3069754945804033-011520-276c0102cac698bfb9c292fed0c127f5-436472912',
		sandbox: true,
	});

	const { body = {} } = req;
	const {
		userId,
		cardToken,
		hash_code,
	} = body;

    try {
        const usuario = await Model.findOne({ where: { id: userId } });

        if (_.isEmpty(usuario)) {
            return next(new Error("User not found in DB"));
        }
    
        
        let { customermpid } = usuario;
        if (_.isEmpty(customermpid)) {
            return next(new Error("Users not found mercadopago"));
        }
        // función para crear un usuario en bambu si no lo tiene
        // { phone, identification, email, name } = usuario;
        const card_data = await mercadopago.customers.cards.create({
            token: cardToken,
            id: customermpid,
        });
        const card_id = card_data.response.id;
        const last_four_digits = card_data.response.last_four_digits;
        const payment_method_id_card = card_data.response.payment_method.id;
        let userCard = await Paymentmethod.findOne({ where: { payment_method_id: card_id } });	
            
        if (!_.isEmpty(userCard)) {
            return next(new Error("card already registered"));
        }
        const data = await mercadopago.payment.save({
            transaction_amount: 1000,
            token: cardToken,
            description: "Cobro de verificación",
            installments: 1,
            payer: {
                type: "customer",
                id: customermpid,
            }
        });
        if (data.response.status === 'approved') {
            const refund_payment_id = data.body.id 
            const a = await mercadopago.payment.refund(refund_payment_id);		
            try {
                await Paymentmethod.create({
                    user_id: userId,
                    last_four_digits: last_four_digits,
                    payment_method_id: card_id,
                    hash_code: hash_code,
                    customermpid: customermpid,
                    card_default: false
                });
            } catch (error) {
                return next(new Error(`Failed creating card record in BD, details: ${error} `));
            }
            let {
                transaction_amount_refunded,
                date_created,
                status
            } = a.body;
            let refund_id = a.body.id;
            try {
                await Mercadopago_refunds.create({
                    payment_id: refund_id,
                    user_id: userId,
                    status,
                    transaction_amount_refunded: transaction_amount_refunded,
                    date_created,
                })	
            } catch (error) {
                next(new Error(`Error creating payment refunds Db, details: ${error}`))
            }
            
            res.status(201);
            res.json({
                success: true,
                data: "The Card is valid",
            });
        } else {
            try {
                await mercadopago.customers.cards.delete(customermpid, card_id)
                res.status(401);
                res.json({
                    success: false,
                    data: "The Card is not valid",
                });
            } catch (error) {
                next(new Error(`Error delete card mercadopago, details ${error}`))
            }
            
        }
    } catch (error) {
        next(new Error(`Error, details: ${error}`))
    }

}
// exports.pagosRealizados = async (req, res, next) => {
//   const usuario = await Model.findOne({ where: { id: "U0001" } });
//   const pagos = await usuario.getPayments();
//   res.status(200)
//   res.json({
//     success: true,
//     data: pagos,
//   })
// };
