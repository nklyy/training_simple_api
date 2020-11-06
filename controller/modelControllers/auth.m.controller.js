// Import model
const bc = require('bcrypt');
const userModel = require('../../model/user.model');

// Lib

// Class controller для find, create, save.
class UserModelController {
  static async createUser(body) {
    const { name, id, password } = body;

    const hashPass = await bc.hash(password, 10);

    const data = await userModel.create({ name, id, password: hashPass });

    return data;
  }
}

module.exports = UserModelController;
