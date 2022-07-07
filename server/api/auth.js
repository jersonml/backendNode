const { sign, verify } = require('jsonwebtoken');
const request = require('request');
const _ = require('lodash')
const querystring = require('querystring');
const config = require('../config');

const { Users} = require("../sequelize");
const { data } = require('../config/logger');
const { registerError, verify_dirpath, read_token, write_token } = require('./utils');

const { secret } = config.token;

const signToken = payload => sign(payload, secret, {
  algorithm: 'HS256',
});

const auth = (req, res, next) => {
  let token = req.headers.authorization || req.query.token || '';

  if (token.startsWith('Bearer ')) {
    token = token.substring(7);
  }

  if (!token) {
    const message = 'Unauthorized';
    next({
      success: false,
      message,
      statusCode: 401,
      level: 'info',
    });
  } else {
    verify(token, config.token.secret, (err, decoded) => {
      if (err) {
        const message = 'Unauthorized';
        next({
          success: false,
          message,
          statusCode: 401,
          level: 'info',
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }
};

const me = (req, res, next) => {
  const { decoded = {}, params = {} } = req;
  const { _id } = decoded;
  const { id } = params;

  if (_id !== id) {
    const message = 'Forbidden';
    next({
      success: false,
      message,
      statusCode: 403,
      type: 'warn',
    });
  } else {
    next();
  }
};

const owner = (req, res, next) => {
  const { decoded = {}, doc = {} } = req;
  const { _id } = decoded;
  const { id } = doc.userId;

  if (_id !== id) {
    const message = 'Forbidden';
    next({
      success: false,
      message,
      statusCode: 403,
      type: 'warn',
    });
  } else {
    next();
  }
};

const isUserAdmin = (req, res, next) => {
  const { decoded = {} } = req;
  const { super_user } = decoded;

  if (!super_user) {
    const message = 'Forbidden';
    next({
      success: false,
      message,
      statusCode: 403,
      type: 'warn',
    });
  } else {
    next();
  }
};


const isGetUserAdmin = async (req, res, next) => {
  const { decoded = {} } = req;
  const { id } = decoded;
  try {
    const user = await Users.findOne({ where:{ id }})
    if(!user.super_user){
      const message = 'Forbidden';
      next({
        success: false,
        message,
        statusCode: 403,
        type: 'warn',
      });
    } else {
      return next()
    }
  } catch (error) {
    registerError(error, req, id)
    return next(new Error(error))
  }

};


const isUserTransaction = (req, res, next) => {
  const { decoded = {} } = req;
  const { super_user } = decoded;

  if (!super_user) {
    const message = 'Forbidden';
    next({
      success: false,
      message,
      statusCode: 403,
      type: 'warn',
    });
  } else {
    next();
  }
};
/*
const conditionsPermit = (req, res, next) => {
  const { decoded = {} } = req;
  const { _id } = decoded;
  const { user } = await Model.findOne({ where: { id: _id } });
  if (!user){
    const message = 'User no found';
    next({
      success: false,
      message,
      statusCode: 404,
      type: 'warn',
    });
  }
  if (!user.acepted_conditions){
    
   // date_update = user.
  }

};
*/

const verify_and_token_bambu = async (req, res, next ) => {
    try {
        const verify = await verify_dirpath()
        const content =  await read_token()
        const {
          token,
          updateAt
        } = content
        if(!((Date.now()  - updateAt)/ 3600000  < 0.90) || !token){
        const data = {
            grant_type:"client_credentials",
            client_id: "bambbu2_practico_001",
            client_secret: "ZSmARSt7Z8vk",
            scope: "apibambbu"
        };
        await request({
                url:`https://igsts.azurewebsites.net/connect/token`,
                method: 'POST',
                json:true,
                headers:{
                    'Content-Type':'application/x-www-form-urlencoded',
                    'Accept': '*/*'
                },
                form: data,
            },async (error, res, body) => {
                if (!error && res.statusCode == 200) {
                    const data_write = {
                      token : body.access_token,
                      updateAt : Date.now()
                    }
                    await write_token(data_write)
                    next();
                }  
      });
    } else {
      next();
    }
    } catch (error) {
        await registerError(error,req,null);
        return next(new Error(`Error, details: ${error}`));
    }
   
}

const verify_register_bambbu = async (req, res, next) => {
    const user_id = req.body.user_id || req.params.user_id || "";
    var identification_user
    if(!user_id){
        return next(new Error("Error params user_id"))
    } 
    try {
        const user = await Users.findOne({ where: { id:user_id } });
        if (_.isEmpty(user)){
          res.status(404)
          res.json({
            success:false,
            msg:"Users not fount"
          })
        }
        if (!user.identification){
          identification_user = `57${user.phone}`
        } else {
          identification_user = user.identification
        }
        if (!user.register_bambbu){
            const billeteraid = '6f13d987-1df5-468a-d038-08d6b97dc24a';
            const api_url = 'https://apibambbu.azurewebsites.net';
            const content =  await read_token()
            const {
                token
            } = content
            const array = user.name.split(" ").filter(Boolean)
            let name, apellido
            if(array.length === 1 ){
                name = apellido = array[0]
            } else if ( array.length === 2){
                name = array[0]
                apellido = array[1]
            } else if ( array.length === 3){
                name = `${array[0]} ${array[1]}`
                apellido = array[2]
            } else {
                name = `${array[0]} ${array[1]}`
                apellido = `${array[2]} ${array[3]}`
            }
            const data = {
                "indicativo": 57,
                "celular": user.phone,
                "documento": identification_user,
                "nombres": name,
                "apellidos": apellido,  
                "email": user.email,
                "billeteraId": billeteraid
            }
            const dataRequest = {
                url:`${api_url}/api/Usuario/create`,
                method: 'POST',
                json:true,
                headers:{
                    'Authorization': `Bearer ${token}`
                },
                body: data
            }
            await request( dataRequest, async (error, response, body) =>{
                if (!error && response.statusCode == 200) {
                    if (body.state === true ||body.msg === "Usuario ya existe" ){
                      await Users.update({
                        register_bambbu: true,
                      }, {
                          returning: true, where: { id: user_id }
                      });
                      next();
                    } else if (body){
                        return  next({
                            success: true,
                            message: `${body}`,
                            statusCode: response.statusCode,
                            level: "info"
                        });
                    } else {
                        return next(new Error("Error create users"))
                    }
                   
                } else {
                    if (error){
                        await registerError(error,req,user_id);
                    }
                   return  next(new Error("Error register users Bambbu api"));
                }
            });
        } else {
            next();
        }
    } catch (error) {
        await registerError(error,req,user_id);
        return next(new Error(`Error, details: ${error}`));
    }
    
}
module.exports = {
  signToken,
  auth,
  me,
  owner,
  isUserAdmin,
  isUserTransaction,
  verify_and_token_bambu,
  verify_register_bambbu,
  isGetUserAdmin
};
