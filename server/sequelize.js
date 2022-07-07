const Sequelize = require('sequelize');
const UserModel = require('./api/users/model');
const TransactionsModel = require('./api/transactions/model');
const ProductModel = require('./api/product/model');
const Fridge_x_ProductModel = require('./api/fridge_x_product/model');
const FridgeModel = require('./api/fridge/model');
const paymentmethodModel = require('./api/payment_method/model');
const Transaction_x_ProductModel = require('./api/transaction_x_product/model');
const Mercadopago_paymentModel = require('./api/mercadopago/model');
const Mercadopago_refundsModel = require('./api/mercadopago_refunds/model');
const Nextonia_TransactionsModel = require('./api/transactions_nextonia/model');
const VideoModel = require('./api/video/model');
const Mercadopago_pseModel = require('./api/mercadopago_pse/model');
const Status_tokenModel  = require('./api/status_token/model');
const Movements_bambbuModel = require('./api/movements_bambbu/model');
const Log_errorModel = require('./api/log_error/model');
const Movements_paymentsModel = require('./api/movements_payments/model');
const Help_centerModel = require('./api/help_center/model');
const Metricas_wsModel = require('./api/metrica_ws/model');
const ReviewModel = require('./api/review/model');

const config = require('./config');
const logger = require('./config/logger');
const { flatMap } = require('lodash');

const {
  dbname, username, password, host, dialect,
} = config.database;

const sequelize = new Sequelize(dbname, username, password, {
  host,
  dialect,
  pool: {
    max: 10,
    min: 0,
    require: 30000,
    idle: 10000,
  },
  logging: false,
});

const db = {
  Users: UserModel(sequelize, Sequelize),
  Transactions: TransactionsModel(sequelize, Sequelize),
  Paymentmethod: paymentmethodModel(sequelize, Sequelize),
  Fridge: FridgeModel(sequelize, Sequelize),
  Fridge_x_Product: Fridge_x_ProductModel(sequelize, Sequelize),
  Product: ProductModel(sequelize, Sequelize),
  Transaction_x_Product: Transaction_x_ProductModel(sequelize, Sequelize),
  Mercadopago_payment: Mercadopago_paymentModel(sequelize, Sequelize),
  Mercadopago_refunds: Mercadopago_refundsModel(sequelize, Sequelize),
  Nextonia_Transactions: Nextonia_TransactionsModel(sequelize, Sequelize),
  Video: VideoModel(sequelize, Sequelize),
  Mercadopago_pse: Mercadopago_pseModel(sequelize, Sequelize),
  Status_token: Status_tokenModel(sequelize, Sequelize),
  Movements_bambbu: Movements_bambbuModel(sequelize, Sequelize),
  Log_error: Log_errorModel(sequelize, Sequelize),
  Movements_payments: Movements_paymentsModel(sequelize, Sequelize),
  Help_center: Help_centerModel(sequelize, Sequelize),
  Metricas_ws: Metricas_wsModel(sequelize, Sequelize),
  Review: ReviewModel(sequelize, Sequelize),
};

// Model relations


db.Transactions.belongsTo(db.Users, {
  as: 'user',
  foreignKey: 'user_id',
  targetKey: 'id',
  constraints: false,
});
db.Paymentmethod.belongsTo(db.Users, {
  as: 'user',
  foreignKey: 'user_id',
  targetKey: 'id',
  constraints: false
});
db.Mercadopago_payment.belongsTo(db.Users, {
  as: 'user',
  foreignKey: 'user_id',
  constraints: false,
});

db.Mercadopago_pse.belongsTo(db.Users, {
  as: 'user',
  foreignKey:'user_id',
  constraints: false
});
db.Status_token.belongsTo(db.Users,{
  as:'user',
  foreignKey:'user_id',
  constraints: false
});
db.Movements_bambbu.belongsTo(db.Users, {
  as:'user',
  foreignKey:'user_id',
  constraints:false
});
db.Log_error.belongsTo(db.Users, {
  as:'user',
  foreignKey:'user_id',
  constraints: false
});
db.Movements_payments.belongsTo(db.Users, {
  as:'user',
  foreignKey:'user_id',
  constraints: false
});
db.Users.hasMany(db.Mercadopago_payment, {
  as: 'payments',
  foreignKey: 'user_id',
  constraints: false,
});
db.Fridge_x_Product.belongsTo(db.Fridge, {
  as: 'fridge',
  foreignKey: 'fridge_id',
  targetKey: 'id',
  constraints: false
});
db.Fridge_x_Product.belongsTo(db.Product, {
  as: 'product',
  foreignKey: 'product_id',
  targetKey: 'id',
  constraints: false
});
db.Transaction_x_Product.belongsTo(db.Product, {
  as: 'product',
  foreignKey: 'product_id',
  targetKey: 'id',
  constraints: false
});

db.Transaction_x_Product.belongsTo(db.Transactions, {
  as: 'transaction',
  foreignKey: 'transaction_id',
  targetKey: 'id',
  constraints: false
});
db.Transactions.hasMany(db.Transaction_x_Product, {
  as: 'transaction',
  foreignKey: 'transaction_id',
  targetKey: 'id',
  constraints: false
});
db.Product.hasMany(db.Fridge_x_Product, {
  as: 'product',
  foreignKey: 'product_id',
  targetKey: 'id',
  constraints: false
});
db.Nextonia_Transactions.hasMany(db.Mercadopago_payment, {
  as: 'card_payment',
  foreignKey: 'transaction_id',
  targetKey: 'id',
  constraints: false
})
db.Nextonia_Transactions.hasMany(db.Transaction_x_Product, {
  as: 'transaction',
  foreignKey: 'transaction_id',
  targetKey: 'id',
  constraints: false
});
db.Nextonia_Transactions.hasMany(db.Movements_payments,{
  as: 'details_payment',
  foreignKey: 'transaction_id',
  targetKey: 'id',
  constraints: false
});
db.Movements_payments.hasMany(db.Paymentmethod,{
  as: 'card_details',
  foreignKey: 'payment_method_id',
  sourceKey: 'payment_method_id',
  constraints: false
});
db.Transactions.hasMany(db.Video, {
  as: 'videos',
  foreignKey: 'transaction_id',
  sourceKey: 'transaction_id',
  constraints: false
});

db.Review.hasMany(db.Nextonia_Transactions, {
  as: 'details_invoice',
  foreignKey: 'id',
  sourceKey: 'transaction_id',
  constraints: false
});

db.Nextonia_Transactions.hasMany(db.Review, {
  as: 'review',
  foreignKey: 'transaction_id',
  sourceKey: 'id',
  constraints: false
});

// Load relations of models
Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connected.');
  })
  .catch((err) => {
    logger.error('Database not connected.');
  });

sequelize.sync().then(() => {
  logger.info('Synchronized database.');
});

module.exports = { ...db };
