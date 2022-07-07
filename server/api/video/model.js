module.exports = (sequelize, type) => {
  const Video = sequelize.define(
    'video',
    {
      transaction_id: {
        type: type.STRING(100),

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
      video_size: {
        type: type.FLOAT,
      },
      fridge_alert_level: {
        type: type.INTEGER,
      },
      fridge_temp: {
        type: type.FLOAT,
      },
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


    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: 'video',
    },
  );

  Video.prototype.toJSON = function blacklistVideo() {
    const data = Object.assign({}, this.get());
    return data;
  };

  return Video;
};
