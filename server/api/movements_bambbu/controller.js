const { Users: Model } = require("../../sequelize");
const { Movements_bambbu } = require("../../sequelize");
const { Movements_payments } = require("../../sequelize");
const { Mercadopago_pse } = require("../../sequelize")
const { Nextonia_Transactions } = require("../../sequelize")
const { Mercadopago_payment } = require("../../sequelize")
const { Log_error } = require("../../sequelize")
const { Status_token } = require("../../sequelize")
const { Op } = require("sequelize");


const { registerError,read_token, request_bambbu} = require('../utils');
const request = require('request');
var mercadopago = require('mercadopago');
var _ = require('lodash');
const { response } = require("express");

exports.Payment_Card = async (req, res, next) => {
	const user_id_decoded = req.decoded.id
	const route = `${req.baseUrl}${req.url}` 
	const message_log = JSON.stringify(req.body)
    mercadopago.configure({
		access_token: 'APP_USR-3069754945804033-011520-276c0102cac698bfb9c292fed0c127f5-436472912',
		sandbox: true,
	});
	const comercioid = '768b3474-94e2-4683-d186-08d87a1548bd';
	const bolsilloId = 'c41a30f4-e45c-47e9-262a-08d87a15727c';
	const transaccionTipoId = "4C1028C6-9A8D-420A-6E10-08D6B97C9EA9";
	const api_url = 'https://apibambbu.azurewebsites.net';
	const descripcion = 'recharging wallet whit card';
	const cuotas = 1
	const { body = {} } = req;
	const {
		user_id,
		card_token,
	} = body;
	var { transaction_amount } = body
	try {
		const result = await Log_error.create({
			user_id: user_id_decoded,
			route,
			message:message_log
		});
		const eval = String(transaction_amount)
		if (transaction_amount > 40000 && (eval.substr(-2) == "03" || eval.substr(-2) == "60")){
			transaction_amount = parseInt(eval.slice(0, -1))
			if (String(transaction_amount).substr(-1)== "6"){
				transaction_amount = parseInt(eval.slice(0, -2) + '0')
			}
		}
		const content =  await read_token()
        const {
          token
        } = content
		const user = await Model.findOne({ where: { id: user_id } });
		const phone = user.phone;
		const customermpid = user.customermpid;
		const data = await mercadopago.payment.save({
			transaction_amount,
			token: card_token,
			description: descripcion,
			installments: cuotas,
			statement_descriptor: "Práctico",
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
			payment_type_id,
			status,
			status_detail,
			description,
		} = data.body;

		var card_id = data.body.card.id

		await Movements_bambbu.create({
			user_id,
			date_created,
			date_approved,
			status,
			status_detail,
			transaction_amount,
			payment_method_id,
			payment_type_id,
			card_id,	
			transaction_id: id,
		});
		if(status === 'approved'){
			const recharge = {
				"phoneNumber": phone,
				"bolsilloId": bolsilloId,
				"valor": transaction_amount,
				"transaccionTipoId": transaccionTipoId
			}
			request({
				url:`${api_url}/api/Transaccion/recarga`,
				method: 'POST',
				json:true,
				headers:{
					'Authorization': `Bearer ${token}`
				},
				body: recharge
			}, async (error, response, body) => {
				if(!body){
					return next(new Error("Error recharge users"));
				}
				if(error || body.estado != 'OK'){
					return next(new Error("Error recharge users"));
				}
				await Movements_bambbu.update({
					code_bambbu_id : body.code
				},{
					returning: true, where: { transaction_id: id}
				})
				res.status(201);
				res.json({
					success: true,
					data: body,
					message: status
				});	
			});
		} else {
			res.status(201);
				res.json({
					success: false,
					data: body,
					message: status_detail
				});	
		}
	} catch (error) {
		registerError(error, req, user_id);
		return next(new Error(error))
	}
	
}

exports.get_money = async (req, res, next) => {
	mercadopago.configure({
		access_token: 'APP_USR-3069754945804033-011520-276c0102cac698bfb9c292fed0c127f5-436472912'
	});
	const comercioid = '768b3474-94e2-4683-d186-08d87a1548bd';
	const bolsilloId = 'c41a30f4-e45c-47e9-262a-08d87a15727c';
	const transaccionTipoId = "4C1028C6-9A8D-420A-6E10-08D6B97C9EA9";
	const id = req.params.user_id
	let busqueda
	let recharge
	let response
	let status_rechargue
	let transaction_pending
	let transaction_pendig_id
	let mercadopago_card 
	try {
		const user = await Model.findOne({ where: { id } });
		if (!user){
			res.status(500);
			return res.json({
				success: false,
				msg: "Error user not found BD",
				statusCode: 500

			});	
			
		}
		const phone = user.phone
		const movements = await Mercadopago_pse.findAll({ where: { user_id: id, recharge_status: false, status: "pending" } })
		if(!_.isEmpty(movements)){
			const tempo = await Model.findOne({ where: { id }, attributes: ['update_rechargue_time'] }) 
			const update_rechargue_time = tempo.update_rechargue_time
			if(!((Date.now()  - update_rechargue_time)/ 3600000  < (1/60))){
				await Model.update({ update_rechargue_time: Date.now() }, { returning: true, where: { id } })
				for (let i = 0; i < movements.length; i++) {
					transaction_id = movements[i].transaction_id	
					busqueda = await mercadopago.payment.get(transaction_id);
					if (busqueda.body.status === 'approved'){
						recharge = {
							"phoneNumber": phone,
							"bolsilloId": bolsilloId,
							"valor": busqueda.body.transaction_amount,
							"transaccionTipoId": transaccionTipoId
						}
						status_rechargue = await Mercadopago_pse.findOne({ where: { user_id: id, transaction_id } })
						if (!status_rechargue.recharge_status){
							response = await request_bambbu(recharge, 'POST', "api/Transaccion/recarga", req, id);
							if (!_.isEmpty(response)){
								if (response.estado === 'OK'){
									await Mercadopago_pse.update(
										{
										recharge_status: true,
										status: busqueda.body.status,
										status_detail: busqueda.body.status_detail
					
									},{
										returning: true, where: {user_id:id, transaction_id}
									}
									);
									await Movements_bambbu.update(
										{
										status: busqueda.body.status,
										status_detail: busqueda.body.status_detail,
										code_bambbu_id: response.code
									},{
										returning: true, where: {user_id:id, transaction_id}
									}
									);
								} else {
									msg = "Rechargue bambbu pay error response"
								}
							}
						}
		
					} else if (busqueda.status != 'pending') {
						await Mercadopago_pse.update(
							{
							status: busqueda.body.status,
							status_detail: busqueda.body.status_detail
		
						},{
							returning: true, where: {user_id: id, transaction_id}
						}
						);
						await Movements_bambbu.update(
							{
							status: busqueda.body.status,
							status_detail: busqueda.body.status_detail,
						},{
							returning: true, where: {user_id: id, transaction_id}
						}
						);
					}
				}
			}
		}
		transaction_pending = await Movements_payments.findAll({  where: {user_id: id,[Op.or]:[
															{status_detail: "pending_review_manual"},
															{status_detail: "pending_contingency"}]  }})
		if (!_.isEmpty(transaction_pending)){
			for (let j = 0; j < transaction_pending.length; j++ ){
				transaction_pendig_id =  transaction_pending[j].transaction_id
				mercadopago_card = await Mercadopago_payment.findOne({ where: { transaction_id: transaction_pendig_id } })
				busqueda = await mercadopago.payment.get(mercadopago_card.payment_id);
				if (busqueda.body.status == 'approved'){
					await Movements_payments.update({
						status: busqueda.body.status,
						status_detail: busqueda.body.status_detail,
						date_approved: busqueda.body.date_approved,
					}, {
						returning: true, where: { user_id:id, transaction_id:transaction_pendig_id, status_detail: "pending_review_manual" }
					})
		
					await Nextonia_Transactions.update({
						transaction_state: "APPROVED"
					}, {
						returning: true, where: { user_id:id, id:transaction_pendig_id }
					}) 

					await Mercadopago_payment.update({
						status: busqueda.body.status,
						status_detail: busqueda.body.status_detail,
						date_approved: busqueda.body.date_approved,
					}, {
						returning: true, where: { user_id:id, transaction_id:transaction_pendig_id, status_detail: "pending_review_manual" }
					})
				} else if (busqueda.body.status == "in_process" && (busqueda.body.status_detail == "pending_review_manual" ||busqueda.body.status_detail == "pending_contingency")){
					continue
				} else {
					await Movements_payments.update({
						status: busqueda.body.status,
						status_detail: busqueda.body.status_detail,
					}, {
						returning: true, where: { user_id:id, transaction_id:transaction_pendig_id, status: "pending_payment" }
					})
					await Mercadopago_payment.update({
						status: busqueda.body.status,
						status_detail: busqueda.body.status_detail,
					}, {
						returning: true, where: { user_id:id, transaction_id:transaction_pendig_id, status: "pending_payment" }
					})
				}

			}
		}
		
		const user_status_token = await Status_token.findAll({ where: { user_id:id, status: true } });
		let i = 0;
		while(i < user_status_token.length){
			if(!((Date.now()  - user_status_token[i].createdAt)/ 3600000  < 168)){
				status_token = await mercadopago.card_token.get(user_status_token[i].card_token)
				if (Date.parse(status_token.response.date_due) <= Date.now() || status_token.response.status != 'active'){
					await Status_token.update(
						{
						status: false
						},
						{ returning: true, where: { id: user_status_token[i].id } },
					);

				}
					
			} 
			i++
		}
		

		const movements_user = await Movements_bambbu.findOne({ where: { user_id: id, status: "approved" } })
		if (!movements_user){
			return res.json({
				success: false,
				data: "recharge wallet to enjoy the services",
				msg: user,
				statusCode: 500
			});	
		}
		const res_json = await request_bambbu(true, 'GET' ,`api/UsuarioBolsillo/bolsillos/57/${user.phone}/${comercioid}`, req, id);
		var resto
		var saldo 
		if (!_.isEmpty(res_json)){
			saldo = res_json[0].saldo
			resto = saldo
			var saldo_pendig 
			transaction_pending = await Movements_payments.findAll({  where: {user_id: id, status: "pending_payment" }})
			if (!_.isEmpty(transaction_pending)){
				const tempo_payment = await Model.findOne({ where: { id }, attributes: ['update_payment_time'] }) 
				const update_payment_time = tempo_payment.update_payment_time
				if(!((Date.now()  - update_payment_time)/ 3600000  < (1/60))){
					await Model.update({ update_payment_time: Date.now() }, { returning: true, where: { id } })
					for (let i = 0; i < transaction_pending.length; i++) {
						saldo_pendig = transaction_pending[i].transaction_amount
						transaction_pendig_id =  transaction_pending[i].transaction_id
						if ( transaction_pending[i].status_detail == "pending_review_manual"){
							continue
						}
						if (saldo >= saldo_pendig){
							const data_payment = {
								phoneNumber: phone,
								valor: Number.parseInt(saldo_pendig,10),
								referencia: transaction_pendig_id,
								bolsilloId,
								transaccionTipoId: "64D9C1D8-00B6-4E3F-6E0F-08D6B97C9EA9"
							}
							const res_payment = await request_bambbu(data_payment,'POST',"api/Transaccion/pago", req, id)
							if (!_.isEmpty(res_payment)){
								if (res_payment.estado == true){
									await Movements_payments.update({
										status: "approved",
										status_detail: "OK",
										date_approved: Date.now(),
										payment_method: "wallet"
									}, {
										returning: true, where: { user_id:id, transaction_id:transaction_pendig_id, status: "pending_payment" }
									})
						
									await Nextonia_Transactions.update({
										transaction_state: "APPROVED"
									}, {
										returning: true, where: { user_id:id, id:transaction_pendig_id }
									}) 
		
									saldo = saldo - saldo_pendig
									resto = saldo
								} 
							} else {
								msg = "Payment bambbu pay error response"
							}

						} else {
							resto = resto - saldo_pendig
						
						}
					}
				} else {
					for (let i = 0; i < transaction_pending.length; i++) {
						saldo_pendig = transaction_pending[i].transaction_amount
						resto = resto - saldo_pendig
					}
				}
			}
			res_json[0].saldo = resto 
			res.status(200);
				res.json({
				success: true,
				data: res_json,
				msg: user
			});	
		} else {
			res.status(500);
			return res.json({
				success: false,
				data: "Error, user not found in the bambu api",
				msg: user,
			});	
		}

	} catch (error) {
		registerError(error,req,id);	
		return next(new Error(`Error, details: ${error}`));
	}
}

exports.get_movements = async (req, res, next) => {
	const user_id = req.params.user_id;
	try {
		const movements = await Movements_bambbu.findAll({ where: { user_id }, order: [[ 'date_created', 'ASC' ]] })
		res.status(201);
		res.json({
			success: true,
			data: movements,
		});	
	} catch (error) {
		registerError(error,req,user_id);
		return next(new Error(`Error, details: ${error}`));
	}
}