const express = require('express')
const router = express.Router()

const {
    getAllTrans,
    getSingleTrans,
    createTrans,
    updateTrans,
    deleteTrans
} = require('../controllers/transaction')

const {
    updateDebtPayment
} = require('../controllers/settleDebt')

const auth = require('../meddlewares/authentication')
const loadRoom = require('../meddlewares/loadRoom')
const requireRoomMember = require('../meddlewares/requireRoomMember')
const loadTransaction = require('../meddlewares/loadTransaction')

router.route('/:roomId/').post(auth,loadRoom,requireRoomMember,createTrans).get(auth,loadRoom,requireRoomMember,getAllTrans)
router.route('/:roomId/:transactionId')
    .get(auth,loadRoom,requireRoomMember,loadTransaction,getSingleTrans)
    .patch(auth,loadRoom,requireRoomMember,loadTransaction,updateTrans)
    .delete(auth,loadRoom,requireRoomMember,loadTransaction,deleteTrans)

router.route('/:roomId/:transactionId/payment/:memberId').patch(auth,loadRoom,requireRoomMember,loadTransaction,updateDebtPayment)

module.exports = router