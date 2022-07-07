module.exports = (sequelize, type) => {
  const Payment_method = sequelize.define(
    'payment_method',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: type.BIGINT,
      },
      user_id: {
        allowNull: false,
        type: type.STRING,
      },
      last_four_digits: {
        type: type.STRING(4),
        allowNull: false,
        validate: {
          notNull: {
            args: false,
            msg: 'Last_four_digits are required.',
          },
          len: {
            args: [4, 4],
            msg: 'last four digits must have 4 digits',
          },
        },
      },
      payment_method_id: {
        type: type.STRING,
        allowNull: false
      },
      hash_code: {
        type: type.STRING
      },
      customermpid: {
        type: type.STRING(24),
        allowNull: true,
      },
      card_default: {
          type: type.BOOLEAN,
          defaultValue: true,
      },

    },
    {
      timestamps: true,
      tableName: 'payment_method',
    },
  );

  Payment_method.prototype.toJSON = function blacklistPayment_method() {
    const data = Object.assign({}, this.get());
    return data;
  };

  return Payment_method;
};
