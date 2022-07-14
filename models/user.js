import Joi from "joi";
import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  images: {
    type: [mongoose.SchemaTypes.String]
  }
})

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  records: {
    type: [RecordSchema]
  }
})

const User = mongoose.model('user', UserSchema)
const Record = mongoose.model('record', RecordSchema)

const validateUser = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().min(5).max(50).required()
  })

  return schema.validate(user, { allowUnknown: true })
}

const validateRecord = (record) => {
  const schema = Joi.object({
    name: Joi.string().required().min(1).max(50),
    description: Joi.string().required().min(1).max(100),
  })

  return schema.validate(record, { allowUnknown: true })
}

export {
  User,
  validateUser,
  Record,
  validateRecord
}