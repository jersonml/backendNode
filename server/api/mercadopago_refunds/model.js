module.exports = (sequelize, type) => {
  const Mercadopago_refund = sequelize.define(
    'mercadopago_refund',
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
      status: {
        type: type.STRING(20),
        allowNull: false,
      },
      transaction_amount_refunded: {
        type: type.BIGINT,
        allowNull: false,
      },
      date_created: {
        type: type.DATE,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: 'mercadopago_refund',
    },
  );

  Mercadopago_refund.prototype.toJSON = function blacklistMercadopago_refund() {
    const data = Object.assign({}, this.get());
    return data;
  };

  return Mercadopago_refund;
};
