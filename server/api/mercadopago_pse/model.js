module.exports = (sequelize, type) => {
        const Mercadopago_pse = sequelize.define(
            'mercadopago_pse',
            {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    type: type.BIGINT,
                },
                user_id: {
                    type: type.STRING(20),
                    allowNull: false,
                },
                date_created: {
                    type: type.DATE,
                    allowNull: false,
                },
                date_approved: {
                    type: type.DATE,
                },
                status: {
                    type: type.STRING(20),
                    allowNull: false,
                },
                status_detail: {
                    type: type.STRING(50),
                    allowNull: false
                },
                bank_id:{
                    type: type.BIGINT,
                    allowNull: false
                },
                description: {
                    type: type.STRING(255),
                },
                transaction_amount: {
                    type: type.BIGINT,
                    allowNull: false,
                },
                transaction_id: {
                    allowNull: false,
                    type: type.STRING(100),
                    validate: {
                        notNull: {
                            args: false,
                            msg: 'transaction id is required.',
                        },
                    },
                },
                recharge_status:{
                    type: type.BOOLEAN,
                    defaultValue: false
                },
                callback_url:{
                    type: type.STRING(150),
                    allowNull: false
                },
                callback_return:{
                    type: type.STRING(250),
                    allowNull: false
                }
            },

            {
                timestamps: false,
                freezeTableName: true,
                tableName: 'mercadopago_pse',
            },
        );

        Mercadopago_pse.prototype.toJSON = function blacklistMercadopago_pse() {
            const data = Object.assign({}, this.get());
            return data;
        };

        return Mercadopago_pse;
    };