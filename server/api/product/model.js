module.exports = (sequelize, type) => {
  const Product = sequelize.define(
    'product',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: type.BIGINT,
      },
      name: {
        type: type.STRING,
        allowNull: false
      },
      photo: {
        type: type.STRING(200),
        allowNull: true
      },
      status: {
        type: type.STRING(50),
        defaultValue: "Active"
      }
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: 'product',
      paranoid: true,
    },
  );

  Product.prototype.toJSON = function blacklistProduct() {
    const data = Object.assign({}, this.get());
    return data;
  };

  return Product;
};
