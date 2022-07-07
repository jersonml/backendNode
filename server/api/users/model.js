const { hash, compare } = require('bcryptjs');

module.exports = (sequelize, type) => {
	const User = sequelize.define(
		'user',
		{
			identification: {
				type: type.STRING(50),
				allowNull: true,
				unique: true,
				validate: {
					len: {
						args: [6, 50],
						msg: 'identification must be between 6 and 50 characters in length.',
					},
					isUnique(identification, done) {
						User.findOne({ where: { identification } }).then((user) => {
							if (user) {
								done(new Error('identification address already in use.'));
							} else {
								done();
							}
						});
					},
				},
			},
			name: {
				type: type.STRING(100),
				allowNull: false,
				validate: {
					notNull: {
						args: false,
						msg: 'Name is required.',
					},
				},
			},
			phone: {
				type: type.STRING(10),
				allowNull: false,
				unique: true,
				validate: {
					notNull: {
						args: false, 
						msg: 'Phone is required.',
					},
					len: {
						args: [7, 10],
						msg: 'Phone must be between 7 and 10 characters in length.',
					},
					isUnique(phone, done) {
						User.findOne({ where: { phone } }).then((user) => {
							if (user) {
								done(new Error('Phone address already in use.'));
							} else {
								done();
							}
						});
					},
				},
			},
			email: {
				type: type.STRING(50),
				allowNull: false,
				unique: true,
				validate: {
					notNull: {
						args: false,
						msg: 'Email address is required.',
					},
					len: {
						args: [6, 50],
						msg: 'Email address must be between 6 and 50 characters in length.',
					},
					isEmail: {
						msg: 'Email address is invalid.',
					},
					isUnique(email, done) {
						User.findOne({ where: { email } }).then((user) => {
							if (user) {
								done(new Error('Email address already in use.'));
							} else {
								done();
							}
						});
					},
				},
			},
			birthdate:{
				type: type.DATE,
				allowNull: true,
				},
			gender:{
				type: type.STRING(25),
				allowNull: true,
			},
			customermpid: {
				type: type.STRING(24),
				allowNull: true,
				unique: true,
				isUnique(customermpid, done) {
					User.findOne({ where: { customermpid } }).then((user) => {
						if (user) {
							done(new Error('Customer Id already set on MP.'));
						} else {
							done();
						}
					});
				},
			},
			card_token: {
				type: type.STRING(900),
				allowNull: true,
			},
			email_verification: {
				type: type.BOOLEAN,
				defaultValue: false,
			},
			hash_code: {
				type: type.STRING(100),
				allowNull: true
			},
			status_user: {
				type: type.STRING(20),
				defaultValue: 'Active',
			},
			password: {
				type: type.STRING(100),
				allowNull: true
			},
			super_user: {
				type: type.BOOLEAN,
				defaultValue: false,
			},
			dispenser: {
				type: type.BOOLEAN,
				defaultValue: false,
			},
			verification_code: {
				type: type.STRING(6),
				allowNull: true,
			},
			code_updated_at: {
				type: type.DATE,
				allowNull: true,
			},
			new_password: {
				type: type.STRING(100),
				allowNull: true,
			},
			acepted_conditions: {
				type: type.BOOLEAN,
				defaultValue: false,
			},
			acepted_treatment_data: {
				type: type.BOOLEAN,
				defaultValue: false,
			},
			terms_acepted_date:{
				type: type.DATE,
				allowNull: true,
			},
			register_bambbu: {
				type: type.BOOLEAN,
				defaultValue: false
			},
			select_payment: {
				type: type.BIGINT,
				defaultValue: 1,
				allowNull: false
			},
			facebook_id:{
				type: type.STRING(100),
				allowNull: true
			},
			google_id:{
				type: type.STRING(100),
				allowNull: true
			},
			apple_id: {
				type: type.STRING(100),
				allowNull: true
			},
			update_rechargue_time: {
				type: type.DATE,
				allowNull: true,
			},
			update_payment_time: {
				type: type.DATE,
				allowNull: true,
				default: Date.now()
			},
			phone_verification:{
				type: type.BOOLEAN,
				default: false
			},
		},
		{
			timestamps: true,
		},
	);
	async function encryptPasswordIfChanged(user) {
		if (user.changed('password')) {
			user.password = await hash(user.password, 10);
		}
	}
	async function encryptNewPasswordIfChanged(user) {
		if (user.changed('new_password')) {
			user.new_password = await hash(user.new_password, 10);
		}
	}

	User.afterCreate(async user => await user.reload());
	User.beforeCreate(encryptPasswordIfChanged);
	User.beforeUpdate(encryptNewPasswordIfChanged);

	User.prototype.comparePassword = async function comparePassword(password) {
		return compare(password, this.password);
	};
	User.prototype.toJSON = function blacklistUser() {
		const data = Object.assign({}, this.get());
		delete data.password;
		delete data.new_password;
		return data;
	};
	return User;
};
