const { Users: Model } = require("../../sequelize");
const { Movements_payments } = require("../../sequelize");

const { Op, where } = require("sequelize");

const { signToken, me } = require("../auth");
const nodemailer = require("nodemailer")
const random_gen = require("random-number-csprng")
const { Paymentmethod } = require("../../sequelize");
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "notificaciones@practico.com.co",
    pass: "duwpkoekjdiumeae"
  },
});

const { registerError, request_generic, request_bambbu} = require('../utils');


var _ = require('lodash');
const getRawBody = require("raw-body");

exports.create = async (req, res, next) => {
  const { body = {} } = req;

  Model.create(body)
    .then(data => {
      if (data.dispenser) {
        Paymentmethod.create({
          user_id: data.id,
          payment_method_id: '0000000000',
          hash_code: '$2a$10$t1p.Fe13FYK/NqCrsYi5cOn1K.BhzEou4gBZ5Ke.PmLW4p7uyIIgi',
          last_four_digits: '0000',
          customermpid: '000000000-aaaaaaaaaaaaaa'
        })
        Model.update({
          hash_code: '$2a$10$t1p.Fe13FYK/NqCrsYi5cOn1K.BhzEou4gBZ5Ke.PmLW4p7uyIIgi',

        }, { returning: true, where: { id: data.id } })

      }
      res.status(201);
      res.json({
        success: true,
        data,
      });
    })//cludygraffe@hotmail.com
    .catch(error => {
      next(new Error(error));
    });
};

//Create new User
exports.create_ = async (req, res, next) => {
  const { body = {} } = req;
  Model.create(body)
    .then(data => {
      random_gen(100000, 999999)
        .then(rand => {
          mailOptions = {
            to: body.email,
            subject: "Confirmación correo electrónico",
            html: '<table width="100%" cellspacing="0" border="0" bgcolor="#fff">' +
              '<tbody>' +
              '<tr>' +
              '<td style="background-color:#fff;color:#3332" valign="top" bgcolor="#fff" align="center">' +
              '<table style="max-width:600px" cellspacing ="0" cellpadding="0" border"0" bgcolor="#fff">' +
              '<tbody>' +
              '<tr>' +
              '<td style="background-color: #ffffff; padding - left: 10px; padding - right: 3px; font - size: 13px; line - height: 19px; font - family: Helvetica, sans - serif; color:#717171" bgcolor = "#ffffff" align = "left">' +
              '<br>' +
              '<table width="100% " cellspacing="0" cellpadding="0" border="0" >' +
              '<tbody>' +
              '<tr>' +
              '<td>' +
              '<table style=" padding-bottom:10px;border:none;border-left:0px;border-right:0px" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">' +
              '<tbody>' +
              '<tr>' +
              '<td>' +
              '</td>' +
              '</tr>' +
              '</tbody>' +
              '</table>' +
              '</td >' +
              '</tr>' +
              '<tr>' +
              '<td>' +
              '<table style=" padding-bottom: <tbody>' +
              '<tr>' +
              '<td align=" left">' +
              '<p style=" color:#1d3648;font-size:23px;font-family:sans-serif;font-weight:bold">Hola ' + body.name + '</p>' +
              '<p style="color:#1d3648">Gracias por registrarte en Práctico.' +
              '</p>' +
              '<p style="color:#1d3648">Debemos verificar tu correo electrónico.' +
              '<strong style="color:#1d3648"> Tu código de verificación es: </strong>' +
              '<div style="background:#fff;border:1px solid #6baea2;color:#1d3648;text-align:center;font-size:30px;padding:20px;border-radius:0;max-width:400px;margin:30px auto" ><strong>' + rand + '</strong> </div>' +
              '</p>' +
              '<br>' +
              '<p>' +
              '<strong style=" color:#1d3648">Recuerda que este código sólo tiene una vigencia de 2 horas. </strong>' +
              '</p>' +
              '</td >' +
              '</tr >' +
              '<tr>' +
              '<td>' +
              '<br>' +
              '<br>' +
              '</td>' +
              '</tr>' +
              '</tbody>' +
              '</table>' +
              '</td>' +
              '</tr >' +
              '</tbody>' +
              '</table>' +
              '</td>' +
              '</tr>' +
              '</tbody>' +
              '</table>' +
              '</td>' +
              '</tr>' +
              '</tbody >' +
              '</table>'

          }
          console.log(mailOptions);
          transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
              console.log(error);
              res.status(300);
              res.json({
                message: "No se pudo enviar correo"
              });
            } else {
              console.log("Message sent: " + response.message);
              Model.update({
                verification_code: rand,
                terms_acepted_date: Date.now(),
                code_updated_at: Date.now()
              }, { returning: true, where: { id: data.id } })
                .then(data => {
                  res.status(201);
                  res.json({
                    message: "User registered"
                  });

                })
                .catch(error => {
                  next(new Error(error));
                });
            }
          });

        })
        .catch(error => {
          next(new Error(error));
        });
    })
    .catch(error => {
      next(new Error(error));
    });
};

exports.resend_code = async (req, res, next) => {
  const { body = {} } = req;
  Model.findOne({ where: { email: body.email } })
    .then(data => {
      if (data) {
        if (!data.email_verification) {
          random_gen(100000, 999999)
            .then(rand => {
              mailOptions = {
                to: body.email,
                subject: "Confirmación correo electrónico",
                html: '<table width="100%" cellspacing="0" border="0" bgcolor="#fff">' +
                  '<tbody>' +
                  '<tr>' +
                  '<td style="background-color:#fff;color:#3332" valign="top" bgcolor="#fff" align="center">' +
                  '<table style="max-width:600px" cellspacing ="0" cellpadding="0" border"0" bgcolor="#fff">' +
                  '<tbody>' +
                  '<tr>' +
                  '<td style="background-color: #ffffff; padding - left: 10px; padding - right: 3px; font - size: 13px; line - height: 19px; font - family: Helvetica, sans - serif; color:#717171" bgcolor = "#ffffff" align = "left">' +
                  '<br>' +
                  '<table width="100% " cellspacing="0" cellpadding="0" border="0" >' +
                  '<tbody>' +
                  '<tr>' +
                  '<td>' +
                  '<table style=" padding-bottom:10px;border:none;border-left:0px;border-right:0px" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">' +
                  '<tbody>' +
                  '<tr>' +
                  '<td>' +
                  '</td>' +
                  '</tr>' +
                  '</tbody>' +
                  '</table>' +
                  '</td >' +
                  '</tr>' +
                  '<tr>' +
                  '<td>' +
                  '<table style=" padding-bottom: <tbody>' +
                  '<tr>' +
                  '<td align=" left">' +
                  '<p style=" color:#1d3648;font-size:23px;font-family:sans-serif;font-weight:bold">Hola ' + data.name + '</p>' +
                  '<p style="color:#1d3648">Gracias por registrarte en Práctico.' +
                  '</p>' +
                  '<p style="color:#1d3648">Debemos verificar tu correo electrónico.' +
                  '<strong style="color:#1d3648"> Tu código de verificación es: </strong>' +
                  '<div style="background:#fff;border:1px solid #6baea2;color:#1d3648;text-align:center;font-size:30px;padding:20px;border-radius:0;max-width:400px;margin:30px auto" ><strong>' + rand + '</strong> </div>' +
                  '</p>' +
                  '<br>' +
                  '<p>' +
                  '<strong style=" color:#1d3648">Recuerda que este código sólo tiene una vigencia de 2 horas. </strong>' +
                  '</p>' +
                  '</td >' +
                  '</tr >' +
                  '<tr>' +
                  '<td>' +
                  '<br>' +
                  '<br>' +
                  '</td>' +
                  '</tr>' +
                  '</tbody>' +
                  '</table>' +
                  '</td>' +
                  '</tr >' +
                  '</tbody>' +
                  '</table>' +
                  '</td>' +
                  '</tr>' +
                  '</tbody>' +
                  '</table>' +
                  '</td>' +
                  '</tr>' +
                  '</tbody >' +
                  '</table>'

              }
              console.log(mailOptions);
              transporter.sendMail(mailOptions, function (error, response) {
                if (error) {
                  console.log(error);
                  res.status(300);
                  res.json({
                    message: "No se pudo enviar correo"
                  });
                } else {
                  console.log("Message sent: " + response.message);
                  Model.update({
                    verification_code: rand,
                    code_updated_at: Date.now()
                  }, { returning: true, where: { email: body.email } })
                    .then(data => {
                      res.status(200);
                      res.json({
                        message: "Código reenviado"
                      });

                    })
                    .catch(error => {
                      next(new Error(error));
                    });
                }
              });

            })
        }
        else {
          res.status(400);
          res.json({
            message: "Correo ya verificado"
          });

        }
      }
      else {
        res.status(404);
        res.json({
          message: "Usuario no registrado"
        });
      }



    })
}

exports.verify_email = async (req, res, next) => {
  const { body = {} } = req;

  Model.findOne({ where: { email: body.email } })
    .then(data => {
      if (body.code === data.verification_code) {
        if ((Date.now() - data.code_updated_at) / 3600000 < 2) {
          Model.update({
            email_verification: true,
            verification_code: null,
            code_updated_at: null
          }, { returning: true, where: { id: data.id } })
            .then(response => {
              res.status(200);
              res.json({
                success: true,
                message: "email_verified"
              });

            })
        }
        else {
          res.status(401);
          res.json({
            success: false,
            message: "Código vencido"
          });

        }

      }
      else {
        res.status(400);
        res.json({
          message: "Código de verificación inválido"
        });
      }
    })
    .catch(error => {
      next(new Error(error));
    });
};

exports.resend_pass = async (req, res, next) => {
  const { body = {} } = req;
  random_gen(100000, 999999)
    .then(async rand => {
      mailOptions = {
        to: req.body.email,
        subject: "Reestablecimiento de contraseña Práctico",
        html: '<table width="100%" cellspacing="0" border="0" bgcolor="#fff">' +
          '<tbody>' +
          '<tr>' +
          '<td style="background-color:#fff;color:#3332" valign="top" bgcolor="#fff" align="center">' +
          '<table style="max-width:600px" cellspacing ="0" cellpadding="0" border"0" bgcolor="#fff">' +
          '<tbody>' +
          '<tr>' +
          '<td style="background-color: #ffffff; padding - left: 10px; padding - right: 3px; font - size: 13px; line - height: 19px; font - family: Helvetica, sans - serif; color:#717171" bgcolor = "#ffffff" align = "left">' +
          '<br>' +
          '<table width="100% " cellspacing="0" cellpadding="0" border="0" >' +
          '<tbody>' +
          '<tr>' +
          '<td>' +
          '<table style=" padding-bottom:10px;border:none;border-left:0px;border-right:0px" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">' +
          '<tbody>' +
          '<tr>' +
          '<td>' +
          '</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '</td >' +
          '</tr>' +
          '<tr>' +
          '<td>' +
          '<table style=" padding-bottom: <tbody>' +
          '<tr>' +
          '<td align=" left">' +
          '<p style=" color:#1d3648;font-size:23px;font-family:sans-serif;font-weight:bold">Reestablecer Contraseña</p>' +
          '<p style="color:#1d3648">Ha recibido este correo porque solicitó reestablecer su contraseña para su cuenta de Práctico' +
          '</p>' +
          '<strong style="color:#1d3648"> El código para reestablecer la contraseña es: </strong>' +
          '<div style="background:#fff;border:1px solid #6baea2;color:#1d3648;text-align:center;font-size:30px;padding:20px;border-radius:0;max-width:400px;margin:30px auto" ><strong>' + rand + '</strong> </div>' +
          '</p>' +
          '<br>' +
          '<p>' +
          '<strong style=" color:#1d3648">Recuerda que este código sólo tiene una vigencia de 2 horas. </strong>' +
          '<p style="color:#1d3648">Si usted no solicitó este cambio, puede ignorar este correo. Aún no hemos hecho modificaciones a su contraseña.' +
          '</p>' +
          '</p>' +
          '</td >' +
          '</tr >' +
          '<tr>' +
          '<td>' +
          '<br>' +
          '<br>' +
          '</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '</td>' +
          '</tr >' +
          '</tbody>' +
          '</table>' +
          '</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '</td>' +
          '</tr>' +
          '</tbody >' +
          '</table>'
      }
      try {
        const { verification_code } = await Model.findOne({ where: { email: body.email } })
        console.log(verification_code)
        if (_.isEmpty(verification_code)) {
          res.status(400);
          res.json({
            message: "No ha registrado la nueva clave"
          });
        }
        else {
          console.log(mailOptions);
          transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
              console.log(error);
              res.status(300);
              res.json({
                message: "No se pudo enviar correo"
              });
            } else {
              console.log("Message sent ");
              Model.findOne({ where: { email: body.email } })
                .then(data => {
                  data.update({
                    verification_code: rand,
                    code_updated_at: Date.now()
                  })
                  const { id, email_verification, super_user, email } = data;
                  const token = signToken({
                    id,
                    email_verification,
                    super_user,
                    email,
                  });

                  res.json({
                    success: true,
                    meta: {
                      token,
                    },
                  });

                })
                .catch(error => {
                  next(new Error(error));
                });
            }
          });
        }

      }
      catch (error) {
        next(new Error(error));
      }


    })


};



exports.change_passw = async (req, res, next) => {
  const { body = {} } = req;
  random_gen(100000, 999999)
    .then(rand => {
      mailOptions = {
        to: req.body.email,
        subject: "Reestablecimiento de contraseña Práctico",
        html: '<table width="100%" cellspacing="0" border="0" bgcolor="#fff">' +
          '<tbody>' +
          '<tr>' +
          '<td style="background-color:#fff;color:#3332" valign="top" bgcolor="#fff" align="center">' +
          '<table style="max-width:600px" cellspacing ="0" cellpadding="0" border"0" bgcolor="#fff">' +
          '<tbody>' +
          '<tr>' +
          '<td style="background-color: #ffffff; padding - left: 10px; padding - right: 3px; font - size: 13px; line - height: 19px; font - family: Helvetica, sans - serif; color:#717171" bgcolor = "#ffffff" align = "left">' +
          '<br>' +
          '<table width="100% " cellspacing="0" cellpadding="0" border="0" >' +
          '<tbody>' +
          '<tr>' +
          '<td>' +
          '<table style=" padding-bottom:10px;border:none;border-left:0px;border-right:0px" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">' +
          '<tbody>' +
          '<tr>' +
          '<td>' +
          '</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '</td >' +
          '</tr>' +
          '<tr>' +
          '<td>' +
          '<table style=" padding-bottom: <tbody>' +
          '<tr>' +
          '<td align=" left">' +
          '<p style=" color:#1d3648;font-size:23px;font-family:sans-serif;font-weight:bold">Reestablecer Contraseña</p>' +
          '<p style="color:#1d3648">Ha recibido este correo porque solicitó reestablecer su contraseña para su cuenta de Práctico' +
          '</p>' +
          '<strong style="color:#1d3648"> El código para reestablecer la contraseña es: </strong>' +
          '<div style="background:#fff;border:1px solid #6baea2;color:#1d3648;text-align:center;font-size:30px;padding:20px;border-radius:0;max-width:400px;margin:30px auto" ><strong>' + rand + '</strong> </div>' +
          '</p>' +
          '<br>' +
          '<p>' +
          '<strong style=" color:#1d3648">Recuerda que este código sólo tiene una vigencia de 2 horas. </strong>' +
          '<p style="color:#1d3648">Si usted no solicitó este cambio, puede ignorar este correo. Aún no hemos hecho modificaciones a su contraseña.' +
          '</p>' +
          '</p>' +
          '</td >' +
          '</tr >' +
          '<tr>' +
          '<td>' +
          '<br>' +
          '<br>' +
          '</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '</td>' +
          '</tr >' +
          '</tbody>' +
          '</table>' +
          '</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '</td>' +
          '</tr>' +
          '</tbody >' +
          '</table>'
      }
      console.log(mailOptions);
      transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
          res.status(300);
          res.json({
            message: "No se pudo enviar correo"
          });
        } else {
          console.log("Message sent ");
          Model.findOne({ where: { email: body.email } })
            .then(data => {
              data.update({
                new_password: body.password,
                verification_code: rand,
                code_updated_at: Date.now()
              })
              const { id, email_verification, super_user, email } = data;
              const token = signToken({
                id,
                email_verification,
                super_user,
                email,
              });

              res.json({
                success: true,
                meta: {
                  token,
                },
              });

            })
            .catch(error => {
              next(new Error(error));
            });
        }
      });

    })


};

exports.verify_password = async (req, res, next) => {
  const { body = {} } = req;

  Model.findOne({ where: { email: body.email } })
    .then(data => {
      if (body.code === data.verification_code) {
        if ((Date.now() - data.code_updated_at) / 3600000 < 2) {
          Model.update({
            verification_code: null,
            code_updated_at: null,
            password: data.new_password,
            new_password: null
          }, { returning: true, where: { id: data.id } })
            .then(response => {
              res.status(200);
              res.json({
                success: true,
                message: "Password changed"
              });

            })
        }
        else {
          Model.update({
            verification_code: null,
            code_updated_at: null,
            new_password: null
          }, { returning: true, where: { id: data.id } })
            .then(response => {
              res.status(401);
              res.json({
                message: "Código de verificación expirado",
              });

            })

        }

      }
      else {
        res.status(400);
        res.json({
          message: "Código de verificación inválido"
        });
      }
    })
    .catch(error => {
      next(new Error(error));
    });
};

//Login
exports.login = async (req, res, next) => {
  const { body = {} } = req;
  const { email, password } = body;
  const message = "Email or password are invalid.";

  Model.findOne({ where: { email }, attributes: ['id', 'identification', 'name', 'phone', 'email', 'customermpid', 'email_verification', 'hash_code', 'status_user', 'password', 'super_user','terms_acepted_date','acepted_conditions','acepted_treatment_data'] })
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
      if (!(await data.comparePassword(password))) {
        return next({
          success: false,
          message,
          statusCode: 401,
          level: "info",
        });
      }
      return data;
    })
    .then(async user => {
      const { id, email_verification, super_user } = user;
      const token = signToken({
        id,
        email_verification,
        super_user,
        email,
      });

      res.json({
        success: true,
        data: user,
        meta: {
          token,
        },
      });
    })
    .catch(error => {
      next(new Error(error));
    });
};


exports.login_web = async (req, res, next) => {
  const { body = {} } = req;
  const { email, password } = body;
  const message = "Email or password are invalid.";

  Model.findOne({ where: { email } })
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
      if (!(await data.comparePassword(password))) {
        return next({
          success: false,
          message,
          statusCode: 401,
          level: "info",
        });
      }
      return data;
    })
    .then(async user => {
      const { id, email_verification, super_user } = user;
      if (!super_user) {
        return next({
          success: false,
          message,
          statusCode: 401,
          level: "info",
        });
      }
      const token = signToken({
        id,
        email_verification,
        super_user,
        email,
      });

      res.json({
        success: true,
        data: user,
        meta: {
          token,
        },
      });
    })
    .catch(error => {
      next(new Error(error));
    });
};

exports.listUsers = async (req, res, next) => {
  Model.findAll()
    .then(async data => {
      if (!data) {
        return next({
          success: false,
          message,
          statusCode: 401,
          level: "info",
        });
      }
      res.status(200)
      res.json({
        success: true,
        data
      })

    })
    .catch((error) => {
      next(new Error(error));
    });
}


exports.inactive = async (req, res, next) => {
  const { params = {} } = req;
  const user_id = params.user_id
  Model.update({
    status_user: 'Inactive',
  },
    { returning: true, where: { id: user_id } })
    .then(data => {
      res.status(201);
      res.json({
        success: true,
      });
    })
    .catch(error => {
      next(new Error(error));
    });
};

exports.accept_conditions = async (req, res, next) => {
  const { params = {} } = req;
  const user_id = params.user_id;
  Model.update(
    {
    acepted_treatment_data : true,
    acepted_conditions: true,
    terms_acepted_date : Date.now()
  },
  { returning: true, where : { id: user_id } }
  )
  .then(data => {
    res.status(200);
    res.json({
      success:true,
    });
  })
  .catch(error => {
    next(new Error(error));
  })
}

exports.method_payment = async (req, res, next) => {
    const user_id = req.params.user_id
    const comercioid = '768b3474-94e2-4683-d186-08d87a1548bd';
    try {
        const user_data = await Model.findOne({ where: { id: user_id }, attributes: ["select_payment","status_user", "dispenser","phone", "super_user"]})
        const {
            select_payment,
            status_user,
            phone,
            super_user,
            dispenser
        } = user_data
        if (!user_data){
            res.status(404)
            return res.json({
                    success:false,
                    message: "User not found in DB"
                })
        }
        const transactions_pending = await Movements_payments.findAll({ where: { user_id, status: "pending_payment" } })
        const saldo = await request_bambbu(true, 'GET', `api/UsuarioBolsillo/bolsillos/57/${phone}/${comercioid}`,req, user_id )

        res.status(200)
        res.json({
            success: true,
            data: { user: { 
                        select_payment, 
                        status_user,
                        super_user,
                        dispenser
                    }, 
                    transactions_pending, 
                    saldo
                }
        })

    } catch (error) {
        registerError(error, req, user_id);
        return next(new Error(error))
    }
}

exports.update_method_payment = async (req, res, next) => {
    const user_id = req.params.user_id
    const method_payment = req.body.method_payment
    let data_return = false
    try {
        const data = await Model.update({ 
            select_payment: method_payment
            }, { returning: true, where: { id: user_id }} 
         );
         
        if (data[0]){
            data_return = true
        }
        const user = await Model.findOne({ where: { id: user_id }, attributes: ["select_payment","status_user"]})
        const transactions_pending = await Movements_payments.findAll({ where: { user_id, status: "pending_payment" } })
        res.status(200)
        res.json({
            success: data_return,
            data:{user, transactions_pending}
        })
    } catch (error) {
        registerError(error, req, user_id);
        return next(new Error(error))
    }
}

exports.active = async (req, res, next) => {
  const { params = {} } = req;
  const user_id = params.user_id
  try {
    await Model.update({
      status_user: 'Active',
    },
      { returning: true, where: { id: user_id } })
      .then(data => {
        res.status(201);
        res.json({
          success: true,
          data
        });
      })
      .catch(error => {
        registerError(error, req, user_id);
        next(new Error(error));
      });
    
  } catch (error) {
        registerError(error, req, user_id);
        next(new Error(error));
  }
};


//Login
exports.login_new = async (req, res, next) => {
  const { body = {} } = req;
  const { email, password, oauth_id,identify } = body;
  const message = "Email or password are invalid.";
  var user = null
  let where_data = {email}

  try {
    if (oauth_id){
      if (identify == 'facebook'){
        where_data = {facebook_id: oauth_id}
      } else if (identify == 'google'){
        where_data = {google_id: oauth_id}
      } else if (identify == 'apple'){
        where_data = {apple_id: oauth_id}
      } else {
        return next({
          success: false, 
          message:"identify not detected",
          statusCode: 404,
          level: "info",
      })
      }
    }
   
    user = await Model.findOne({
            where: where_data
            });
    if (_.isEmpty( user )){
        return next({
            success: false, 
            message:"user not found",
            statusCode: 404,
            level: "info",
        })
    }
    if(!oauth_id){
        try {
            if (!(await user.comparePassword(password))) {
                return next({
                  success: false,
                  message,
                  statusCode: 401,
                  level: "info",
                });
              }
        } catch (error) {
            return next({
                success: false, 
                message:"user not register convencional",
                statusCode: 400,
                level: "info",
            })
        }
    } else {
        if (oauth_id != user.google_id && oauth_id != user.facebook_id && oauth_id != user.apple_id ){
            if (identify == 'google'){
                user = await Model.update(    
                    { google_id: oauth_id }
                , { returning: true, where: { email }})

            } else if (identify == 'facebook'){ 
                user = await Model.update(    
                    { facebook_id: oauth_id }
                , { returning: true, where: { email }})

            } else if ( identify == 'apple'){
                user = await Model.update(    
                    { apple_id: oauth_id }
                , { returning: true, where: { email }})

            } else {
                return next({
                    success: false, 
                    message:"identify not detected",
                    statusCode: 404,
                    level: "info",
                })
            }
            user = user[1][0]
        }
    }
    const {
        id,
        email_verification,
        super_user
    } = user

    const token = await signToken({
        id,
        email_verification,
        super_user,
        email,
      });
      res.status(200)
      res.json({
        success: true,
        data: user,
        meta: {
          token,
        },
      });

  } catch (error) {
      registerError(error, req, user)
      return next(new Error(error))
    
  }

};



exports.create_oauth = async (req, res, next) => {
    
    try {
        const {
            email,
            name,
            oauth_id,
            identify,
            identification,
            phone,
            gender,
            birthdate,
        } = req.body
        var user
        var repeated_dating = {}
 
        user = await Model.findOne({
          where: {
              [Op.or]: [
                  { phone },
                  { identification }
              ]
          }
          });
        if (!_.isEmpty(user)){
            if (user.phone == phone && user.identification == identification){
                repeated_dating.phone = phone 
                repeated_dating.identification = identification
                res.status(400)
                return res.json({
                    success: false,
                    msg: "this user has already registered the identifier and phone",
                    repeated_dating
                })
            } else if (user.identification == identification){
                repeated_dating.identification = identification
            } else {
                repeated_dating.phone = phone
            }
            res.status(401)
            return res.json({
                sucess: false,
                msg: "this user has already registered the phone",
                repeated_dating
            })
  
        } else {

            if(identify == 'google'){
                user = await Model.create({ 
                    email, name, identification,
                    phone, google_id: oauth_id,
                    birthdate, gender, acepted_conditions:true,
                    acepted_treatment_data: true,
                    terms_acepted_date: Date.now()
                    })
    
            } else if( identify == 'facebook'){
                user = await Model.create({ 
                    email, name, identification, 
                    phone, facebook_id: oauth_id,
                    birthdate, gender,acepted_conditions:true,
                    acepted_treatment_data:true,
                    terms_acepted_date: Date.now()
                    })
    
            } else if( identify == 'apple'){
                user =  await Model.create({ 
                    email, name,identification,
                    phone, apple_id: oauth_id ,
                    birthdate, gender,acepted_conditions:true ,
                    acepted_treatment_data:true,
                    terms_acepted_date: Date.now()
                    })
            } else {
                return next({
                    success: false, 
                    message:"Error create user not identify",
                    statusCode: 400,
                    level: "info",
                })

            }
        }
        const {
            id,
            email_verification,
            super_user,
        } = user
        const token = await signToken({
            id,
            email_verification,
            super_user,
            email,
          });
          res.status(200)
          return res.json({
            success: true,
            data: user,
            meta: {
              token,
            },
          });

    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error))
    }
}

exports.create_new = async (req, res, next) => { 
    try {
        const { body } = req
        const user = await Model.create(body)
        const {
            id,
            email_verification,
            super_user,
            email
        } = user
        const token = await signToken({
            id,
            email_verification,
            super_user,
            email,
        });
        res.status(200)
        return res.json({
            success: true,
            data: user,
            meta: {
                token,
            },
        });
    } catch (error) {
        registerError(error, req, null)
        return next(new Error(error))
    }
}

exports.verify_code_sms = async ( req, res, next ) => {
    const code_params = "BRXxd217Aj19uxVvQY7PdaCo9eLiq1nFclzkojDMHC7BPwrZQkPd4g%3D%3D"
    const method = 'POST'
    const { code, to,countryCode } = req.body
    const { id } = req.params
    const user_param = 'f49e265bad238eccadaf'
    const data = {
        code,
        countryCode,
        to
    }
    var buffer = false
    try {
        const url = `https://sensinadm.azurewebsites.net/api/ssverifysmscode?code=${code_params}&user=${user_param}`
        const resp = await request_generic(data, method, url, {}, req, id, next)
        try {
            buffer = resp.body.asciiSlice()
        } catch (error) {
            res.status(200)
            return res.json(resp)
        }
        res.status(400)
        delete resp.body
       return res.json({resp, buffer})
    } catch (error) {
        registerError(error,req,id)
        return next(Error(error))
    }

}

exports.send_code_sms = async ( req, res, next ) => {
  const code_params = "dae5aGeXno2pPOWSkrMyRzyRMGoP9fOsVpNBofiM08AlaaJrL%2FSBWw%3D%3D"
  const user_param = 'f49e265bad238eccadaf'
  const method = 'POST'
  const channel = "sms"
  var buffer = false
  const { to,countryCode } = req.body
  const { id } = req.params
  try {
       
       const data = {
             to,
             countryCode,
             channel
       }
       const url = `https://sensinadm.azurewebsites.net/api/ssgensmscode?code=${code_params}&user=${user_param}`
       const resp = await request_generic(data, method, url, {}, req, id, next)
        try {
            buffer = resp.body.asciiSlice()
        } catch (error) {
            res.status(200)
            return res.json(resp)
        }
        res.status(400)
        delete resp.body
       return res.json({resp, buffer})
  } catch (error) {
       registerError(error,req,id)
       return next(Error(error))
  }

}

exports.update_phone = async (req, res, netx) => {
    const { id } = req.params
    const { phone } = req.body
    try {
        const data = await Model.findOne({ where: { id } })
        if (!data){
            res.status(404)
            return res.json({
                   succes:false,
                   msg: "User not found BD"
            })
        }
        const data_new = await Model.update({ phone:phone },
                            { returning: true, where: { id } })
        const user = data_new[1][0]
        res.status(200)
        return res.json(user)
    } catch (error) {
        registerError(error, req, id)
        return next(Error(error))
    }
}


exports.consult_user = async (req, res, next) => {
    const {
        email,
        identification,
        phone
    } = req.query
    var repeated_dating = {}
    var msg = "User already"
    try {
        const data = await Model.findOne({
            where: {
                [Op.or]:[
                    {email},
                    {identification},
                    {phone}
                ]
            }
        })
        if (_.isEmpty(data)){
            return next({
                success: false, 
                message:"user not found",
                statusCode: 404,
                level: "info",
            })
        }
        if (data.email == email){
            repeated_dating.email = email
        } 
        if (data.phone == phone){
            repeated_dating.phone = phone
        } 
        if (data.identification == identification){
            repeated_dating.identification = identification
        }
        res.status(200)
        return res.json({
            succes:true,
            repeated_dating,
            msg
        })
    } catch (error) {
        registerError(error, req, email)
        return next(new Error(error))
    }

}

exports.change_identification = async (req, res, next) => {
    const id = req.params.id
    const identification = req.body.identification
    try {
        const data = await Model.findOne({ where: { id } })
        if (_.isEmpty(data)){
            return next({
                success: false, 
                message:"user not found",
                statusCode: 404,
                level: "info",
            })
        }
        const update = await Model.update({ identification }, {returning:true, where: { id }})
        const user = update[1][0]
        res.status(200)
        res.json({
            sucess:true,
            user
        })
        
    } catch (error) {
        registerError(error, req, id)
        return next(new Error(error))
    }

}

exports.getUserDispenser = async (req, res, next) => {
    try {
        const data = await Model.findAll({ where: {dispenser: true}, attributes:["id", "identification","name","phone","email","createdAt","status_user","birthdate"] })
        res.status(200)
        res.json({
            sucess: true, 
            data
        })
    } catch (error) {
        registerError(req, error, null)
        return next(new Error(error))
    }
}

exports.postDispenser = async (req, res, next) => {
    try {
        req.body.dispenser = true
        req.body.acepted_conditions = true 
        req.body.acepted_treatment_data = true
        req.body.terms_acepted_date = Date.now() 
        const data = await Model.create(req.body)
        res.status(201)
        res.json({
            sucess: true,
            data
        })
    } catch (error) {
        return next(new Error(error))
    }
}