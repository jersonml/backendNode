module.exports = (sequelize, type) => {
  const Transaction_x_Product = sequelize.define(
    'transaction_x_product',
    {
      transaction_id: {
        allowNull: false,
        primaryKey: true,
        type: type.STRING,
      },
      product_id: {
        allowNull: false,
        primaryKey: true,
        type: type.BIGINT,
      },
      quantity: {
        allowNull: false,
        type: type.BIGINT,
      },
      per_unit_price: {
        allowNull: false,
        type: type.BIGINT,
      },
    },
    {
      timestamps: true,
    },
  );

  Transaction_x_Product.afterCreate(async transaction_x_product => await transaction_x_product.reload());

  return Transaction_x_Product;
};
