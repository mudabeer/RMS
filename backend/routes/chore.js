const express = require('express')
const router = express.Router()
const auth = require('../middlewares/authentication')
const loadRoom = require('../middlewares/loadRoom')
const requireRoomMember = require('../middlewares/requireRoomMember')
const { getRoomChores, createChore, updateChore, deleteChore } = require('../controllers/chore')

router.route('/:roomId')
    .get(auth, loadRoom, requireRoomMember, getRoomChores)
    .post(auth, loadRoom, requireRoomMember, createChore)

router.route('/:roomId/:choreId')
    .patch(auth, loadRoom, requireRoomMember, updateChore)
    .delete(auth, loadRoom, requireRoomMember, deleteChore)

module.exports = router
