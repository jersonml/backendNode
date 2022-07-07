module.exports = (sequelize, type) => {
  const Mercadopago_payment = sequelize.define(
    'mercadopago_payment',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: type.BIGINT,
      },
      payment_id: {
        type: type.BIGINT,
        allowNull: false,
      },
      user_id: {
        type: type.STRING(20),
        allowNull: false,
      },
      date_created: {
        type: type.DATE,
        allowNull: false,
      },
      date_approved: {
        type: type.DATE,
      },
      payment_method_id: {
        type: type.STRING(20),
        allowNull: false,
      },
      status: {
        type: type.STRING(20),
        allowNull: false,
      },
      status_detail: {
        type: type.STRING(50),
        allowNull: false,
      },
      description: {
        type: type.STRING(255),
      },
      statement_descriptor: {
        type: type.STRING(20),
      },
      transaction_amount: {
        type: type.BIGINT,
        allowNull: false,
      },
      installments: {
        type: type.BIGINT,
        allowNull: false,
      },
      transaction_id: {
        allowNull: false,
        type: type.STRING(100),
        validate: {
          notNull: {
            args: false,
            msg: 'transaction id is required.',
          },
        },
      },
    },

    {
      timestamps: false,
      freezeTableName: true,
      tableName: 'mercadopago_payment',
    },
  );

  Mercadopago_payment.prototype.toJSON = function blacklistMercadopago_payment() {
    const data = Object.assign({}, this.get());
    return data;
  };

  return Mercadopago_payment;
};
