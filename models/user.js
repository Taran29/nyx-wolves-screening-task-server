import Joi from "joi";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
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
    name: Joi.string().required().min(1).max(50)
  })

  return schema.validate(user, { allowUnknown: true })
}

export {
  User,
  validateUser
}