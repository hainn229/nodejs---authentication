const passport = require("passport");
const bcryptjs = require("bcryptjs");
const { signToken } = require("./jwt");

const User = require("../models/User");

const login = async (data) => {
  try {
    const user = await User.findOne({
      email: data.email,
    });
    if (!user) {
      return {
        message: "Could not find email address !",
      };
    } else {
      const match = await bcryptjs.compare(data.password, user.password);
      if (match) {
        return {
          user: user,
          token: signToken(user._id, user.email, user.role),
          message: "Login successfully!",
        };
      } else {
        return { message: "Wrong password!" };
      }
    }
  } catch (error) {
    throw error;
  }
};

const signup = async (data) => {
  try {
    const salt = await bcryptjs.genSalt(10);
    data.password = await bcryptjs.hash(data.password, salt);
    const newUser = new User(data);
    const user = await newUser.save();
    if (user) {
      return {
        user: user,
        token: signToken(user._id, user.email, user.role),
      };
    }
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, data) => {
  try {
    const user = await User.findByIdAndUpdate(
      {
        _id: id,
      },
      data
    );
    return user;
  } catch (error) {
    throw error;
  }
};

const changePassword = async (id, data) => {
  try {
    const user = await User.findOne({ _id: id });
    if (user) {
      const match = bcryptjs.compareSync(data.current_password, user.password);
      if (match == true) {
        const salt = await bcryptjs.genSalt(10);
        data.new_password = await bcryptjs.hash(data.new_password, salt);
        user.password = data.new_password;
        await user.save();
        return { match: true };
      } else {
        return { match: false };
      }
    } else {
      return { match: false };
    }
  } catch (error) {
    throw error;
  }
};

const deleteUser = (id) => {
  return User.deleteOne({
    _id: id,
  });
};

const findUserByEmail = async (email) => {
  const user = await User.findOne({
    email: email,
  });
  return user;
};

const findUserByGoogleId = async (id) => {
  const user = await User.findOne({
    ggId: id,
  });
  return user;
};

const findUserByFacebookId = async (id) => {
  const user = await User.findOne({ fbId: id });
  return user;
};

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

module.exports = {
  login,
  signup,
  updateUser,
  changePassword,
  deleteUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserByFacebookId,
};
