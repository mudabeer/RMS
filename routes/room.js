const express = require('express')
const router = express.Router()

const auth = require('../meddlewares/authentication')
const loadRoomAndMember = require('../meddlewares/loadRoomAndMember')

const {
    updateMember,
    deleteMember
} = require('../controllers/member')

const {
    getRooms,
    getSingleRoom,
    createRoom,
    genVco,
    joinRoom,
    deleteRoom,
    updateRoom
} = require('../controllers/room')

router.route('/').get(auth,getRooms).post(auth,createRoom)
router.route('/join-room').patch(auth,joinRoom)
router.route('/:id').get(auth,getSingleRoom).patch(auth,updateRoom).delete(auth,deleteRoom)
router.route('/gen-vco').post(auth,genVco)
router.route('/:roomId/member/:memberId').patch(auth,loadRoomAndMember,updateMember)
router.route('/:roomId/member/:memberId').delete(auth,loadRoomAndMember,deleteMember)  

module.exports = router