module.exports = (sequelize, type) => {
  const Nextonia_transaction = sequelize.define(
    'nextonia_transactions',
    {

      bought_date: {
        type: type.DATE,
        allowNull: false
      },
      user_id: {
        allowNull: false,
        type: type.STRING(50),
        validate: {
          notNull: {
            args: false,
            msg: 'user_id is required.',
          },
        },
      },
      fridge_id: {
        allowNull: false,
        type: type.STRING(100),
        validate: {
          notNull: {
            args: false,
            msg: 'fridge id is required.',
          },
        },
      },
      total_price: {
        type: type.BIGINT,
      },
      recieved_date: {
        type: type.DATE,
        allowNull: false,
        validate: {
          notNull: {
            args: false,
            msg: 'recieved date is required.',
          },
        },
      },
      transaction_state: {
        type: type.STRING(20),
        defaultValue: "UNPAID",
      },
      onReviews: {
        type: type.BIGINT,
        defaultValue: 0
      }


    },
    {
      timestamps: false,
    },
  );

  Nextonia_transaction.afterCreate(async nextonia_transactions => await nextonia_transactions.reload());

  return Nextonia_transaction;
};
