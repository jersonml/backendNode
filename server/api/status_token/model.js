module.exports = (sequelize, type) => {
    const Status_token = sequelize.define(
        'status_token',
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
            status: {
                type: type.BOOLEAN,
                defaultValue:true,
            },
            payment_id: {
                type: type.BIGINT,
                allowNull: false,
            },
            card_token: {
                type: type.STRING(32),
				allowNull: true,
            }
        },
        {
            timestamps: true,
            freezeTableName: true,
            tableName: 'status_token',
        },
    );

    Status_token.prototype.toJSON = function blacklistStatus_token() {
        const data = Object.assign({}, this.get());
        return data;
    };

    return Status_token;
};