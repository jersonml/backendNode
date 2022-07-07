module.exports = (sequelize, type) => {
    const Movements_bambbu = sequelize.define(
        'movements_bambbu',
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
                type: type.STRING(20),
                allowNull: false,
            },
            status_detail: {
                type: type.STRING(50),
                allowNull: false
            },
            payment_method_id: {
                type: type.STRING(50),
                allowNull: false
            },
            transaction_amount: {
                type: type.BIGINT,
                allowNull: false,
            },
            payment_type_id:{
                type: type.STRING(80),
                allowNull:false
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
            code_bambbu_id:{
                type: type.STRING(70),
                allowNull: true
            },
            card_id:{
                type: type.STRING(100),
                allowNull: true
            }

        },

        {
            timestamps: false,
            freezeTableName: true,
            tableName: 'movements_bambbu',
        },
    );

    Movements_bambbu.prototype.toJSON = function blacklistMovements_bambbu() {
        const data = Object.assign({}, this.get());
        return data;
    };

    return Movements_bambbu;
};