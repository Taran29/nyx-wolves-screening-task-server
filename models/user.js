import Joi from "joi";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  records: {
    type: [{
      title: {
        type: String,
      },
      description: {
        type: String,
      },
    }]
  }
})

const User = mongoose.model('user', UserSchema)

const validateUser = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().min(5).max(50).required()
  })

  return schema.validate(user, { allowUnknown: true })
}

export {
  User,
  validateUser
}