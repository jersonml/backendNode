module.exports = (sequelize, type) => {
    const Metricas_ws = sequelize.define(
        'metricas_ws',
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
        },

        {
            timestamps: true,
            freezeTableName: true,
            tableName: 'metricas_ws',
        },
    );

    Metricas_ws.prototype.toJSON = function blacklistMetricas_ws() {
        const data = Object.assign({}, this.get());
        return data;
    };

    return Metricas_ws;
};