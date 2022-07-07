module.exports = (sequelize, type) => {
    const Log_error = sequelize.define(
        'log_error',
        {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: type.BIGINT,
            },
            user_id: {
                type: type.STRING(20),
                allowNull: true,
            },
            route: {
                type: type.STRING(100),
                allowNull:true,
            },
            message: {
                type: type.STRING(5000),
                allowNull: false,
            },
        },
        {
            timestamps: true,
            freezeTableName: true,
            tableName: 'log_error',
        },
    );

    Log_error.prototype.toJSON = function blacklistLog_error() {
        const data = Object.assign({}, this.get());
        return data;
    };  

    return Log_error;
};