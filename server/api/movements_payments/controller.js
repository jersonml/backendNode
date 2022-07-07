const { Users: Model } = require("../../sequelize");
const { Movements_payments } = require("../../sequelize");
const { Movements_bambbu } = require('../../sequelize')
const { Mercadopago_payment } = require("../../sequelize")
const { Transaction_x_Product: Transaction_x_Product } = require('../../sequelize')
const { Product: Product, Fridge_x_Product } = require('../../sequelize')
const { Nextonia_Transactions } = require('../../sequelize')
const { Paymentmethod } = require('../../sequelize')
const { Review } = require('../../sequelize')


const { registerError,read_token, request_bambbu} = require('../utils');
var mercadopago = require('mercadopago');
var _ = require('lodash');
const { data } = require("../../config/logger");



exports.payment_wallet = async (req, res, next) => {
	const comercioid = '768b3474-94e2-4683-d186-08d87a1548bd';
	const bolsilloId = 'c41a30f4-e45c-47e9-262a-08d87a15727c';
	const transaccionTipoId = "64D9C1D8-00B6-4E3F-6E0F-08D6B97C9EA9";
    const { products, user_id, bought_date, fridge_id } = req.body
    let total_price = 0
    var pending = false
    var res_payment

    try {
		const user = await Model.findOne({ where: { id: user_id } });
		if (!user){
			return next(new Error("Error user not found BD"));
		}
        const phone = user.phone
        const transaction = await Nextonia_Transactions.create({
            user_id,
            bought_date,
            fridge_id,
            recieved_date: Date.now(),
            transaction_state: 'UNPAID'
          })
        
        const transaction_id = transaction.id

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
                await Transaction_x_Product.create({
                  transaction_id: transaction_id,
                  product_id: product_id,
                  quantity: products[i].quantity,
                  per_unit_price: data.price
                })
            })
        }
        const res_json = await request_bambbu(true, 'GET', `api/UsuarioBolsillo/bolsillos/57/${phone}/${comercioid}`,req, user_id )
        if (_.isEmpty(res_json)){
            return next(new Error(`api bambbu bolsillo not found, details: ${res_json}`))
        }
        const saldo = res_json[0].saldo
        if( saldo < total_price){
            if (saldo > 0){
                const restante = total_price - saldo
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
            }
            pending = await Movements_payments.create({
                date_created: Date.now(),
                user_id,
                status: "pending_payment",
                status_detail: "remaining payment, wallet not enough balance",
                payment_method: "wallet",
                transaction_amount: restante,
                transaction_id
            })
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
        if (saldo > 0){
            const data = await Movements_payments.create({
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
                data: {data, res_payment},
                message: "full payment whih waller"
            })
        } else {
            res.status(201)
            res.json({
                success: true,
                data: {data ,res_payment},
                message: pending
            })
        }

	} catch (error) {
		registerError(error,req,id);
		return next(new Error(`Error, details: ${error}`));
	}
}

exports.get_movements_payment = async (req, res, next) => {
	const user_id = req.params.user_id;
	try {
        const expired = await Nextonia_Transactions.findAll({where:{onReviews:2 }})
        var update_time
        var review_id
        for ( let i= 0; i < expired.length; i++){
            update_time = expired[i].createdAt
            review_id =  expired[i].id
            if(((Date.now()  - update_time )/ 3600000  < (87600/60))){
                await Model.update({ onReviews:0 }, {returning:true, where: {id:review_id }})
            }
        }
        const movements = await Nextonia_Transactions.findAll({
            where: { user_id: user_id}, include: [
                { model: Movements_payments, as: 'details_payment', required:true, attributes:['status', 'status_detail', 'payment_method', 'transaction_amount', 'date_approved'], include:{ model: Paymentmethod, as:'card_details', required: false, attributes:[ 'last_four_digits', 'payment_method_id', 'card_default' ] } },
                { model: Transaction_x_Product, as: 'transaction', required: false, attributes:['quantity', 'per_unit_price'], include: { model: Product, as: 'product', required: false } },
                { model: Review, as: 'review', required: false, attributes:["commentary_user","title","photo_user","status","response_text", "response_photo", "response_time","createdAt", "updatedAt"]}
                ], order: [[ 'bought_date', 'DESC' ] ,[{model:Transaction_x_Product, as:'transaction'}, 'createdAt', 'DESC'],  [{ model: Review, as: 'review'},"createdAt","DESC"], [ { model: Review, as: 'review'},"status", "DESC"]]
            })
		res.status(200);
		res.json({
			success: true,
			data: movements,
		});	
	} catch (error) {
		registerError(error,req,user_id);
		return next(new Error(`Error, details: ${error}`));
	}
}

exports.card_payment_pending = async (req, res, next) => {
	mercadopago.configure({
		access_token: 'APP_USR-3069754945804033-011520-276c0102cac698bfb9c292fed0c127f5-436472912'
	});
	const { body = {} } = req;
	const {
		user_id,
		card_token,
        transaction_id,
        valor
	} = body;

	try {
        const { customermpid} = await Model.findOne({ where: { id: user_id } });
        const card_data = await Paymentmethod.findOne({ where: { user_id, card_default: true } })
        const card_id = card_data.payment_method_id
		const data = await mercadopago.payment.save({
			transaction_amount: valor,
			token: card_token,
			description: "payment transactions pending",
			installments: 1,
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
			status,
            status_detail,
            description, 
            payment_method_id,
            statement_descriptor
        } = data.body;
        
        if (status === 'approved'){
            await Movements_payments.update({
                status,
                status_detail,
                date_approved,
                payment_method: payment_method_id,
                payment_method_id: card_id 

            }, {
                returning: true, where: { user_id, transaction_id, status: "pending_payment" }
            })

            await Nextonia_Transactions.update({
                transaction_state: status.toUpperCase()
            }, {
                returning: true, where: { user_id, id:transaction_id }
            })
        }
        await Mercadopago_payment.create({
            payment_id:id,
            user_id,
            date_created,
            date_approved,
            payment_method_id,
            status,
            status_detail,
            description,
            statement_descriptor,
            transaction_amount: valor,
            installments: 1,
            transaction_id
        }) 
		res.status(200);
		res.json({
			success: true,
			status,
            status_detail   
		});
	} catch (error) {
        registerError(error, req, user_id)
		next(new Error(error));
	}
}