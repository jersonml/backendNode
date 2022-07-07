module.exports = (sequelize, type) => {
  const Fridge_x_Product = sequelize.define(
    'fridge_x_product',
    {
      fridge_id: {
        allowNull: false,
        primaryKey: true,
        type: type.STRING(50),
      },
      product_id: {
        allowNull: false,
        primaryKey: true,
        type: type.BIGINT,
      },
      quantity: {
        type: type.BIGINT,
      },
      price: {
        type: type.BIGINT,
        allowNull: false
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: 'fridge_x_product',
      paranoid: true,
    },
  );

  Fridge_x_Product.prototype.toJSON = function blacklistFridge_x_Product() {
    const data = Object.assign({}, this.get());
    return data;
  };

  return Fridge_x_Product;
};
