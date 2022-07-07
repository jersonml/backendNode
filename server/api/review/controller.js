const { Review: Model, Users,
        Nextonia_Transactions, Transaction_x_Product,
        Product, Movements_payments, Paymentmethod, Transactions } = require("../../sequelize");
const { registerError, upload_imagen, request_generic } = require('../utils');
const containerName = "rectification"
let _ = require('lodash');
const requestSync = require('sync-request')

exports.postReview = async (req, res, next) => {
    try {
        const {
            user_id, commentary_user,
            transaction_id, title
            } = req.body
        
        var create_rectification
        if (!_.isEmpty(req.file)){
            const uploadResponse = await upload_imagen(req, containerName)
            if (!_.isEmpty(uploadResponse)){
                if (uploadResponse._response.status == 201){
                    const url = uploadResponse._response.request.url.slice(0,-15)
                    create_rectification = await Model.create({
                        user_id, commentary_user,
                        transaction_id, photo_user: url, title
                    })
                } else {
                    res.status(400)
                    return res.json({
                        success: false,
                        msg: "Error upload image"
                    })
                }
            }
        } else {
            create_rectification = await Model.create({
                user_id, commentary_user,
                transaction_id, title
            })
        }
        await Nextonia_Transactions.update({ onReviews: 1 }, { returning: true, where: { id: transaction_id } })
        res.status(201)
        return res.json({
            success:true,
            msg: "Review create sucess",
            data: create_rectification
        })
    } catch (error) {
        registerError(error, req, user_id)
        return next(new Error(error))
  }

};
  
exports.listReview = async (req, res, next) =>{
    const user_id = req.params.user_id
    try {
        const user = await Users.findOne({ where: { id: user_id } });
		if (_.isEmpty(user)){
			res.status(404);
			return res.json({
				success: false,
				msg: "Error user not found BD",
			});	
			
        }     
        const data = await Model.findAll({ 
            where: { user_id }, include: [
                { model: Nextonia_Transactions, as: 'details_invoice', required: true, include:[ 
                    { model: Movements_payments, as: 'details_payment', required:true, attributes:['status', 'status_detail', 'payment_method', 'transaction_amount', 'date_approved'], include:{ model: Paymentmethod, as:'card_details', required: false, attributes:[ 'last_four_digits', 'payment_method_id', 'card_default' ] } },
                    { model: Transaction_x_Product, as: 'transaction', required: false, attributes:['quantity', 'per_unit_price'], include: { model: Product, as: 'product', required: false } }
                ] }, 
            ], order: [['createdAt', 'DESC'],[{ model: Nextonia_Transactions, as: 'details_invoice'},{model:Transaction_x_Product, as:'transaction'}, 'createdAt', 'DESC']]
        })
        res.status(200)
        return res.json({
            success:true,
            data
        })

    } catch (error) {
        registerError(error, req, id)
        return next(new Error(error))
    }
}

// Módulo de práctico
exports.listAllReview = async (req, res, next) =>{
    try {
        const code = 'keaBgEGE8KXEWQqLPmjPVYKjinXKtIwKTpUBsiA8Jr097w3hfgJsdQ%3D%3D'
        const user = 'Practico'
        const method = "POST"
        const url = `https://sensinadmdev.azurewebsites.net/api/TempVideo?code=${code}&user=${user}`
        const user_bd = await Users.findAll({});
		if (_.isEmpty(user_bd)){
			res.status(404);
			return res.json({
				success: false,
				msg: "Error users not found BD",
			});	
			
        }//data, method, url, _headers, req, user_id = null, next
        let data =  await Model.findAll({ include: [
                { model: Nextonia_Transactions, as: 'details_invoice', required: true, include:[ 
                    { model: Movements_payments, as: 'details_payment', required:true, attributes:['status', 'status_detail', 'payment_method', 'transaction_amount', 'date_approved'], include:{ model: Paymentmethod, as:'card_details', required: false, attributes:[ 'last_four_digits', 'payment_method_id', 'card_default' ] } },
                    { model: Transaction_x_Product, as: 'transaction', required: false, attributes:['quantity', 'per_unit_price'], include: { model: Product, as: 'product', required: false, order: [["name", "DESC"]] } },
                ] }
            ], order: [[ 'createdAt', 'DESC' ]]
        })
        data = JSON.parse(JSON.stringify(data))
        for ( const i in data){
            idSale= data[i].details_invoice[0].id
            idFridge = data[i].details_invoice[0].fridge_id
            form = { idFridge, idSale} 
            resp = await requestSync(method, url, { json: form })
            if (resp.statusCode != 200){
                data[i].details_invoice[0].videos_review = [ ]    
            } else {
                resp_json = JSON.parse(resp.body.asciiSlice());
                if (_.isEmpty(resp_json)){
                    data[i].details_invoice[0].videos_review = [ ] 
                } else {
                    video_link = resp_json[0].urlHLS
                    data[i].details_invoice[0].videos_review = [ { video_link } ]
                }

            }
        }
        res.status(200)
        return res.json({
            success:true,
            data
        })

    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error))
    }
}

 exports.putReviews = async (req, res, next) => {
     try {
            const id = req.params.id
            const {
                status,
                response_text
            } = req.body
            var update_review
                if (!_.isEmpty(req.file)){
                const uploadResponse = await upload_imagen(req, containerName)
                if (!_.isEmpty(uploadResponse)){
                    if (uploadResponse._response.status == 201){
                        const url = uploadResponse._response.request.url.slice(0,-15)
                        update_review = await Model.update({
                            status, response_text, response_time: Date.now(),
                            response_photo: url
                        }, { returning: true, where: { id } })
                    } else {
                        res.status(400)
                        return res.json({
                            success: false,
                            msg: "Error upload image"
                        })
                    }
                 }
            } else {
                update_review = await Model.update({
                    status, response_text, response_time: Date.now()
                }, { returning: true, where: { id } })
            }
            const data = update_review[1][0]
            const transaction_id = data['transaction_id']
            await Nextonia_Transactions.update({onReviews: 2 }, {returning:true, where: { id: transaction_id }})
            res.status(200)
            return res.json({
                success:true,
                msg: "Update service",
                data
            })
        } catch (error) {
            registerError(error, req, id)
            return next(new Error(error))
        }
}