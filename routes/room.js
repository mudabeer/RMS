const express = require('express')
const router = express.Router()

const auth = require('../meddlewares/authentication')
const loadRoom = require('../meddlewares/loadRoom')
const memberExistsInRoom = require('../meddlewares/memberExistsInRoom')
const requireCreator = require('../meddlewares/requireCreator')
const requireRoomMember = require('../meddlewares/requireRoomMember')

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
router.route('/:roomId').get(auth,loadRoom,requireRoomMember,getSingleRoom)
                        .patch(auth,loadRoom,requireCreator,updateRoom)
                        .delete(auth,loadRoom,requireCreator,deleteRoom)
router.route('/gen-vco').post(auth,genVco)
router.route('/:roomId/member/:memberId').patch(auth,
                                                loadRoom,
                                                memberExistsInRoom,
                                                requireCreator,
                                                updateMember)
router.route('/:roomId/member/:memberId').delete(auth,
                                                loadRoom,
                                                memberExistsInRoom,
                                                requireCreator,
                                                deleteMember)  

module.exports = router