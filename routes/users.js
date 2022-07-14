import express from 'express'
import { User, validateUser } from '../models/user.js'

const router = express.Router()

router.post('/', async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email })
  if (existingUser) {
    return res.status(200).send({
      message: 'Logged in successfully.',
      body: {
        id: existingUser._id
      }
    })
  }

  const user = new User({
    email: req.body.email,
    records: []
  })

  const { error } = validateUser(user)
  if (error) {
    return res.status(400).send({ message: error.details[0].message })
  }

  try {
    const result = await user.save()
    return res.status(200).send({
      message: 'User created successfully.',
      body: {
        id: result._id
      }
    })
  } catch (ex) {
    return res.status(400).send({
      message: 'Cannot connect to the database.'
    })
  }
})

export default router