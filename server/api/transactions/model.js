module.exports = (sequelize, type) => {
  const Transaction = sequelize.define(
    'transactions',
    {
      register_id: {
        allowNull: false,
        type: type.STRING(100),
        validate: {
          notNull: {
            args: false,
            msg: 'register_id is required.',
          },
        },
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
      bought_date: {
        type: type.DATE,
        allowNull: false,
        validate: {
          notNull: {
            args: false,
            msg: 'bought date is required.',
          },
        },
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
      video_name: {
        type: type.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            args: false,
            msg: 'video name is required.',
          },
        },
      },
      video_link: {
        allowNull: false,
        type: type.STRING(200),
        validate: {
          notNull: {
            args: false,
            msg: 'Video link is required.',
          },
        },
      },
      video_duration: {
        allowNull: false,
        type: type.BIGINT,
      },
      transaction_state: {
        type: type.STRING(100),
        defaultValue: "UNPAID",
      },
      transaction_id: {
        type: type.STRING(100),

      },
      charged_date: {
        type: type.DATE,
      },
      video_size: {
        type: type.FLOAT,
      },
      fridge_alert_level: {
        type: type.INTEGER,
      },
      fridge_temp: {
        type: type.FLOAT,
      },
      card_token: {
        type: type.STRING(32),
      },


    },
    {
      timestamps: false,
    },
  );

  Transaction.afterCreate(async transaction => await transaction.reload());

  return Transaction;
};
