module.exports = (sequelize, type) => {
    const Help_center = sequelize.define(
        'help_center',
        {
            question: {
                type: type.STRING(2000),
                allowNull: false,
            },
            reply: {
                type: type.STRING(2000),
                allowNull: false
            }
        },
        {
            timestamps: true,
            freezeTableName: true,
            tableName: 'help_center',
        },
    );

    Help_center.prototype.toJSON = function blacklistHelp_center() {
        const data = Object.assign({}, this.get());
        return data;
    };  

    return Help_center;
};