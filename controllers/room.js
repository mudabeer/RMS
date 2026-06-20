const Room = require('../models/Room')
const Vco = require('../models/Vco')
const User = require('../models/User')
const nanoid = require('nano-id')
const {StatusCodes} = require('http-status-codes')

const {
    sendVco,
    sendNewMember
} = require('../services/emailService')

const {
    NotFoundError,
    BadRequestError
} = require('../errors/index')

const getRooms = async (req,res) => {
    const {search,roomCode,sort} = req.query;

    const queryObject = {
        "members.user":req.user.userId
    }

    if(search){
        queryObject.name = { $regex: search, $options: 'i' };
    }

    if(roomCode){
        queryObject.roomCode = roomCode
    }

    let result = Room.find(queryObject)

    if(sort === 'latest'){
        result = result.sort('-createdAt')
    }

    if(sort === 'oldest'){
        result = result.sort('createdAt')
    }

    if(sort === 'a-z'){
        result = result.sort('name')
    }

    if(sort === 'z-a'){
        result = result.sort('-name')
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit;


    result = result.skip(skip).limit(limit)
    
    const rooms = await result;
    const totalRooms = await Room.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalRooms / limit)

    res.status(StatusCodes.OK).json({rooms,totalRooms,numOfPages})
}
const getSingleRoom = async (req,res) => {
    res.status(StatusCodes.OK).json({room:req.room})
}

const genVco = async (req,res) => {
    const {roomCode} = req.body

    if(!roomCode){
        throw new BadRequestError('please provide roomCode')
    }

    const room = await Room.findOne({roomCode})

    if(!room){
        throw new NotFoundError('room not found')
    }

    const alreadyExist = room.members.some(
        member => {
            return member.user.toString() === req.user.userId.toString()
        }
    )

    if(alreadyExist){
        throw new BadRequestError('user already exist in room')
    }

    const creator = await User.findOne({_id:room.creator})

    const code = nanoid(4)

    const vcoDoc = await Vco.findOne({userId:req.user.userId})

    if(vcoDoc){
        await vcoDoc.deleteOne({_id:vcoDoc._id})
    }

    const vco = await Vco.create({roomId:room._id,roomCode,userId:req.user.userId,code})

    await sendVco(creator.email,creator.name,code)

    res.status(StatusCodes.OK).json({msg:'verification code successfully send to creator of room!!'})
}

const joinRoom = async (req,res) => {
    const {vco} = req.body

    if(!vco){
        throw new BadRequestError('please provide vco')
    }

    const docVco = await Vco.findOne({userId:req.user.userId})

    if(!docVco){
        throw new BadRequestError('vco does not exist!!')
    }

    if(docVco.code !== vco){
        docVco.attempts += 1

        if(docVco.attempts >= 5){
            await Vco.deleteOne({userId:docVco.userId})

            throw new BadRequestError('Too many failed attempts. Please request a new VCO.')
        }

        await docVco.save()

        throw new BadRequestError('invalid vco')
    }

    await Vco.deleteOne({_id:docVco._id})

    const room = await Room.findByIdAndUpdate(
        {_id:docVco.roomId},
        { $push: 
            {
                members:{user:req.user.userId,role:'member'}
            }
        },
        { new: true, runValidators: true }
    )

    const creator = await User.findOne({_id:room.creator.toString()})

    await sendNewMember(req.user.userName,creator.email,room.name)

    res.status(StatusCodes.OK).json({"msg":"successfuly joined the room"})
}

const createRoom = async (req,res) => {
    const {roomName} = req.body
    
    const room = await Room.create({
        name:roomName,
        roomCode:nanoid(8),
        creator:req.user.userId,
        members:[{
            user:req.user.userId,
            role:'creator'
        }]
    })
    
    res.send('Create Room')
}

const updateRoom = async (req,res) => {
    const {
        body:{name}
    } = req

    if(!name){
        throw new BadRequestError('provide name')
    }

    req.room.name = name

    await req.room.save()

    res.status(StatusCodes.OK).json({"msg":'room updated'})
}

const deleteRoom = async (req,res) => {
    const {
        params: {roomId}
    }  = req

    const room = await Room.deleteOne({_id:roomId})

    if(!room){
        throw new NotFoundError('room not found')
    }

    res.status(StatusCodes.OK).json({'msg':'room deleted successfuly'})
}

module.exports = {
    getRooms,
    getSingleRoom,
    createRoom,
    genVco,
    joinRoom,
    deleteRoom,
    updateRoom
}