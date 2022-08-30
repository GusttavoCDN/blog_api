const Joi = require('joi');
const throwError = require('../helpers/throwError');

const { User } = require('../database/models');
const generateToken = require('../helpers/generateToken');

class UserService {
  static validateUserBody(unknown) {
    const schema = Joi.object({
      displayName: Joi.string().min(8).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      image: Joi.string().required(),
    });

    const { error } = schema.validate(unknown);
    return { error } || null;
  }

  static async exists(email) {
    return User.findOne({ where: { email } });
  }

  static async create(user) {
    const { error } = this.validateUserBody(user);
    if (error) return throwError('badRequest', error.message);

    const userAlreadyExists = await this.exists(user.email);
    if (userAlreadyExists) {
      return throwError('conflict', 'User already registered');
    }

    const newUser = await User.create(user);
    const token = generateToken(newUser);
    return token;
  }

  static async getAll() {
    const users = User.findAll({ attributes: { exclude: ['password'] } });
    return users;
  }

  static async getOne(id) {
    const user = await User.findOne({
      where: { id },
      attributes: { exclude: ['password'] },
    });

    if (!user) return throwError('notFound', 'User does not exist');
    return user;
  }
}

module.exports = UserService;
