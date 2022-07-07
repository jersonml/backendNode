const { Users: Model } = require("../../sequelize");
const { Mercadopago_pse } = require("../../sequelize");
const { Movements_bambbu } = require("../../sequelize")

const { registerError,read_token, request_bambbu} = require('../utils');
const request = require('request');


var mercadopago = require('mercadopago');
var _ = require('lodash');

exports.make_mercadopago_pse = async (req, res, next) => {
	mercadopago.configure({
		access_token: 'APP_USR-3069754945804033-011520-276c0102cac698bfb9c292fed0c127f5-436472912'
	});
	const { body = {} } = req;
	const {
        user_id,
		bank_id,
		transaction_amount,
		name_bank_id
	} = body;
	const description = "Recarga con pse";
	var ip_address
	try {
		//const prueba2 = await mercadopago.payment.cancel(12339839886)
		let user = await Model.findOne({ where: { id: user_id } });
		if (_.isEmpty(user)){
			next(new Error("Users not found DB"));
		}
		//let token = req.headers.authorization.substring(7) || req.query.token || '';
		if( req.headers.host.split(":")[0] === "localhost"){
			ip_address = "127.0.0.1"
		} else {
			ip_address = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress || "127.0.0.1";
		}
		let callback_url = `https://alpina-fridge.appspot.com/api/mercadopago_pse/confirm_pse/${user_id}`;
		const {
			identification,
			email,
			name,
			phone
		} = user;

		const data = await mercadopago.payment.save({
			description,
			payment_method_id: "pse",
			payer:{
				email,
				identification:{
					type: "CC",
					number: identification,
				},
				entity_type: "individual"
			},
			transaction_details:{
				financial_institution: bank_id
			},
			additional_info:{
				ip_address,
				payer:{
					first_name: name,
					phone:{
						area_code: "057",
						number:phone
					}
				}
			},
			transaction_amount,
			callback_url
		});
		
		const {
			id,
			date_created,
			date_approved,
			payment_method_id,
			status,
			status_detail,
		} = data.body;

		const callback_return = data.body.transaction_details.external_resource_url;

		response = await Mercadopago_pse.create({
			user_id,
			date_created,
			date_approved,
			status,
			status_detail,
			bank_id,
			description,
			transaction_amount,
			callback_url,
			callback_return,
			transaction_id: id
		}) ;


		await Movements_bambbu.create({
			user_id,
			date_created,
			date_approved,
			status,
			status_detail,
			transaction_amount,
			payment_method_id,
			payment_type_id: name_bank_id,
			card_id: null,	
			transaction_id: id,
		});
		res.status(201);
		res.json({
			success: true,
			data: response,
		});
		
	} catch (error) {
		registerError(error, req, user_id);
		return next(new Error(`Error generic, details: ${error}`))
		
	}
};

exports.confirm_pse = async (req, res, next) => {
	mercadopago.configure({
		access_token: 'APP_USR-3069754945804033-011520-276c0102cac698bfb9c292fed0c127f5-436472912'
	});
	const bolsilloId = 'c41a30f4-e45c-47e9-262a-08d87a15727c';
	const transaccionTipoId = "4C1028C6-9A8D-420A-6E10-08D6B97C9EA9";
	const user_id = req.params.user_id;
	var res_json
	try {
		const user = await Model.findOne({ where: { id: user_id } });
		if (!user){
			return next(new Error("Error user not found BD"));
		}
		const phone = user.phone
		const movements = await Mercadopago_pse.findAll({ where: { user_id, recharge_status: false, status: "pending" } })
		if(!_.isEmpty(movements)){
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
					res_json = await request_bambbu(recharge, 'POST', "api/Transaccion/recarga", req, user_id);
					if (!_.isEmpty(res_json)){
						if (res_json.estado === 'OK'){
							await Mercadopago_pse.update(
								{
								recharge_status: true,
								status: busqueda.body.status,
								status_detail: busqueda.body.status_detail
			
							},{
								returning: true, where: {user_id, transaction_id}
							}
							);
							await Movements_bambbu.update(
								{
								status: busqueda.body.status,
								status_detail: busqueda.body.status_detail,
								code_bambbu_id: res.code
							},{
								returning: true, where: {user_id, transaction_id}
							}
							);
						}
					}
	
				} else if (busqueda.status != 'pending') {
					await Mercadopago_pse.update(
						{
						status: busqueda.body.status,
						status_detail: busqueda.body.status_detail
	
					},{
						returning: true, where: {user_id, transaction_id}
					}
					);
					await Movements_bambbu.update(
						{
						status: busqueda.body.status,
						status_detail: busqueda.body.status_detail,
					},{
						returning: true, where: {user_id, transaction_id}
					}
					);
				}
			}
		}
		res.redirect('https://www.practico.com.co/tks')
	} catch (error) {
		registerError(error, req, user_id)
		res.redirect('https://www.practico.com.co/tks')
	}

}

exports.cancel_pse = async (req, res, next) => {
	mercadopago.configure({
		access_token: 'APP_USR-3069754945804033-011520-276c0102cac698bfb9c292fed0c127f5-436472912'
	});
	const { transaction_id } = req.params
	try {
		const cancel = await mercadopago.payment.cancel(transaction_id);
		busqueda = await mercadopago.payment.get(transaction_id);
		await Mercadopago_pse.update(
			{
			status: busqueda.body.status,
			status_detail: busqueda.body.status_detail

		},{
			returning: true, where: {user_id, transaction_id}
		}
		);
		await Movements_bambbu.update(
			{
			status: busqueda.body.status,
			status_detail: busqueda.body.status_detail,
		},{
			returning: true, where: {user_id, transaction_id}
		}
		);
		res.status(201);
		res.json({
			success: true,
			data: cancel,
		});
	} catch (error) {
		registerError(error, req, null);
		return next(new Error(`Error, details ${error}`))
	}

}
