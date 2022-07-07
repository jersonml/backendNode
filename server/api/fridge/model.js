module.exports = (sequelize, type) => {
  const Fridge = sequelize.define(
    'fridge',
    {
      location: {
        type: type.STRING(100),
        allowNull: false,
      },
      state: {
        type: type.STRING(50),
        allowNull: false,
      },
      segment: {
        type: type.STRING(50),
        allowNull: false,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: 'fridge',
      paranoid: true,
    },
  );

  Fridge.prototype.toJSON = function blacklistFridge() {
    const data = Object.assign({}, this.get());
    return data;
  };

  return Fridge;
};
