import express from 'express'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import cors from 'cors'
import register from './routes/users.js'
import { Server } from 'socket.io'
import http from 'http'

import {
  addRecord,
  getRecords,
  getRecordInfo,
  editRecord,
  deleteRecords,
} from './controllers/records.js'

config()

const app = express()
const io = new Server(http.Server(app), {
  cors: {
    origin: '*'
  }
})
app.use(express.json())
app.use(express.static('uploads'))
app.options('*', cors())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

app.use('/api/register', register)

io.on('connection', (socket) => {
  socket.on("create", (record, callback) => { addRecord(record, callback) })
  socket.on("fetchAll", (email, callback) => { getRecords(email, callback) })
  socket.on("fetchOne", (recordID, userEmail, callback) => { getRecordInfo(recordID, userEmail, callback) })
  socket.on("editRecord", (recordID, updatedRecord, userEmail, callback) => { editRecord(recordID, updatedRecord, userEmail, callback) })
  socket.on("delete", (recordID, userEmail, callback) => { deleteRecords({ socket, recordID, userEmail, callback }) })
})
io.listen(5001)

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB...")
  }).catch((err) => {
    console.error(err)
  })

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})