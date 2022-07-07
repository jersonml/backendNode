module.exports = (sequelize, type) => {
	const Review = sequelize.define(
		'review',
		{
            user_id: {
                allowNull: false,
                type: type.STRING(50),
                validate: {
                  notNull: {
                    args: false,
                    msg: 'user_id is required.',
                  },
                },
              },
			commentary_user: {
				type: type.STRING(10000),
				allowNull: false,
				validate: {
					notNull: {
						args: false,
						msg: 'Comentary is required',
					},
				},
			},
			transaction_id: {
				type: type.STRING(10),
				allowNull: false,
				validate: {
					notNull: {
						args: false,
						msg: 'Number facture is required',
					},
				},
			},
			title: {
				type: type.STRING(100),
				allowNull: false,
				defaultValue: "Otro"
			},
			photo_user:{
				type: type.STRING(200),
				allowNull: true,
			},
			status: {
				type: type.STRING(100),
                allowNull: false,
                defaultValue: "process"
			},
			response_text: {
				type: type.STRING(10000),
				allowNull: true
            },
            response_photo:{
                type: type.STRING(200),
				allowNull: true,
			},
			response_time: {
				type: type.DATE,
				allowNull: true,
			},
		},
		{
			timestamps: true,
		},
	);

	Review.prototype.toJSON = function blacklistRectification() {
		const data = Object.assign({}, this.get());
		return data;
	};
	return Review;
};
