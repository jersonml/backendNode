const { Help_center } = require("../../sequelize");
const { Metricas_ws } = require("../../sequelize");
const { registerError, verify_dirpath, read_token, write_token } = require("../utils")
var _ = require('lodash');

exports.Get_link = async (req, res, next) => {
    try {
        const user_id = req.decoded.id
        const verify = await verify_dirpath(2)
        const { phone, msg } =  await read_token(2)
        const date_metrica = await Metricas_ws.create({ user_id })
        res.status(200)
        return res.json({
            success: true,
            data: {phone, msg}, 
        })
	} catch (error) {
        registerError(error, req, null )
		return next(new Error(error));
	}
};

exports.Put_phone = async (req, res, next) => {
    const phone = req.params.phone
    const msg = req.body.msg 
    const data = { 
        phone,
        msg
    }
    try {
        const verify = await verify_dirpath(2)
        const result = await write_token(data, 2)
        res.status(200)
        return res.json({
            success: true,
            data: result
        })
    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error))
    }
}

exports.Get_help = async ( req, res, next ) => {
    try {
        const data = await Help_center.findAll({})
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

exports.Post_help = async ( req, res, next ) => {
    try {
        const {
            question,
            reply
        } = req.body
        const data = await Help_center.create({question, reply})
        res.status(201)
        return res.json({
            success:true,
            data
        })
    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error))
    }
}

exports.Put_help = async ( req, res, next ) => {
    try {
        const id = req.params.id
        const {
            question,
            reply
        } = req.body
        const data = await Help_center.update({question, reply}, {returning: true, where: { id }})
        res.status(200)
        return res.json({
            success:true,
            data,
            message: "update succes"
        })
    } catch (error) {
        registerError(error,req, null )
        return next(new Error(error))
    }
}

exports.Delete_help = async ( req, res, next ) => {
    const id = req.params.id
    try {
        const data = await Help_center.destroy({where: { id }})
        res.status(204)
        return res.json({
            success:true,
            message: "delete success"
        })
    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error))
    }
}


