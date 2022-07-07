module.exports = (sequelize, type) => {
    const Movements_payments = sequelize.define(
        'movements_payments',
        {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: type.BIGINT,
            },
            date_created: {
                type: type.DATE,
                allowNull: false,
            },
            date_approved: {
                type: type.DATE,
            },
            user_id: {
                type: type.STRING(20),
                allowNull: false,
            },
            status: {
                type: type.STRING(150),
                allowNull: false,
            },
            status_detail: {
                type: type.STRING(150),
                allowNull: false
            },
            payment_method: {
                type: type.STRING(20),
                allowNull: false
            },
            transaction_amount: {
                type: type.BIGINT,
                allowNull: false,
            },
            transaction_id:{
                type: type.STRING(25),
                allowNull: false
            },
            payment_method_id: {
                type: type.STRING,
                allowNull: true
              },

        },

        {
            timestamps: false,
            freezeTableName: true,
            tableName: 'movements_payments',
        },
    );

    Movements_payments.prototype.toJSON = function blacklistMovements_payments() {
        const data = Object.assign({}, this.get());
        return data;
    };

    return Movements_payments;
};