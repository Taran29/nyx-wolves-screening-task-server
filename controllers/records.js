import { Record, User, validateRecord } from "../models/user.js"
import firebaseStorage from '../firebase.js'
import { ref, deleteObject } from "firebase/storage"

const addRecord = async (record, callback) => {

  const { error } = validateRecord(record)
  if (error) {
    callback({
      message: error.details[0].message,
      status: 400
    })
    return
  }

  const user = await User.findOne({ email: record.user })
  if (!user) {
    callback({
      message: 'User does not exist',
      status: 401
    })
    return
  }

  const newRecord = new Record({
    name: record.name,
    description: record.description,
    images: record.images
  })

  const result = await User.findByIdAndUpdate(user._id, {
    $push: {
      records: newRecord
    }
  }, { new: true })


  callback({
    message: 'Record added successfully.',
    body: result,
    status: 200
  })
}

const getRecords = async (email, callback) => {
  const user = await User.findOne({ email: email })
  if (!user) {
    callback({
      message: 'User does not exist',
      status: 401
    })
    return
  }

  callback({
    message: 'Records found',
    body: user.records,
    status: 200
  })
}

const getRecordInfo = async (recordID, userEmail, callback) => {
  const user = await User.findOne({ email: userEmail })
  if (!user) {
    callback({
      message: 'User does not exist',
      status: 401
    })
    return
  }

  const record = user.records.filter(record => record._id == recordID)

  if (record.length === 0) {
    callback({
      message: 'Record not found',
      status: 400
    })
    return
  }


  callback({
    message: 'Record found',
    body: record[0],
    status: 200
  })
}

const editRecord = async (recordID, updatedRecord, userEmail, callback) => {
  const { error } = validateRecord(updatedRecord)

  if (error) {
    callback({
      message: error.details[0].message,
      status: 400
    })
    return
  }

  const user = await User.findOne({ email: userEmail })
  if (!user) {
    callback({
      message: 'User does not exist',
      status: 401
    })
    return
  }

  await User.findOneAndUpdate({ email: userEmail, 'records._id': recordID }, {
    $set: {
      'records.$.name': updatedRecord.name,
      'records.$.description': updatedRecord.description,
      'records.$.images': updatedRecord.images
    }
  })

  callback({
    message: 'Record edited successfully.',
    status: 200
  })
}

const deleteRecords = async ({ socket, recordID, userEmail, callback }) => {
  const user = await User.findOne({ email: userEmail })
  if (!user) {
    callback({
      message: 'User does not exist',
      status: 401
    })
    return
  }

  let images
  for (const item of user.records) {
    if (item._id == recordID) {
      images = item.images
    }
  }

  for (const item of images) {
    try {
      const itemRef = ref(firebaseStorage, item)
      deleteObject(itemRef).then(() => { }).catch((ex) => { })
    } catch (ex) { }
  }

  await User.findOneAndUpdate({ email: userEmail }, {
    $pull: {
      records: { _id: recordID }
    }
  })

  socket.emit('fetchAgain')

  callback({
    message: 'Delete successful.',
    status: 200
  })
}

export {
  addRecord,
  getRecords,
  getRecordInfo,
  editRecord,
  deleteRecords
}