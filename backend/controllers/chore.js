const Chore = require('../models/Chore')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors/index')

const getRoomChores = async (req, res) => {
    const chores = await Chore.find({ roomId: req.params.roomId })
        .populate('assignedTo', 'name')
        .sort({ dueDate: 1, createdAt: -1 })

    res.status(StatusCodes.OK).json({ success: true, data: { chores } })
}

const createChore = async (req, res) => {
    const { title, assignedTo, dueDate } = req.body
    if (!title || !title.trim()) throw new BadRequestError('please provide a chore title')

    if (assignedTo) {
        const isRoomMember = req.room.members.some(member => member.user.toString() === assignedTo)
        if (!isRoomMember) throw new BadRequestError('assignee must be a room member')
    }

    const chore = await Chore.create({
        roomId: req.params.roomId,
        title: title.trim(),
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
        createdBy: req.user.userId
    })
    await chore.populate('assignedTo', 'name')

    res.status(StatusCodes.CREATED).json({ success: true, data: { chore }, msg: 'chore created' })
}

const updateChore = async (req, res) => {
    const chore = await Chore.findOne({ _id: req.params.choreId, roomId: req.params.roomId })
    if (!chore) throw new NotFoundError('chore not found')

    const { status, assignedTo, dueDate, title } = req.body
    if (status !== undefined) {
        if (!['Pending', 'Completed'].includes(status)) throw new BadRequestError('invalid chore status')
        chore.status = status
    }
    if (title !== undefined) {
        if (!title.trim()) throw new BadRequestError('chore title cannot be empty')
        chore.title = title.trim()
    }
    if (assignedTo !== undefined) {
        if (assignedTo && !req.room.members.some(member => member.user.toString() === assignedTo)) {
            throw new BadRequestError('assignee must be a room member')
        }
        chore.assignedTo = assignedTo || null
    }
    if (dueDate !== undefined) chore.dueDate = dueDate || null

    await chore.save()
    await chore.populate('assignedTo', 'name')
    res.status(StatusCodes.OK).json({ success: true, data: { chore }, msg: 'chore updated' })
}

const deleteChore = async (req, res) => {
    const chore = await Chore.findOneAndDelete({ _id: req.params.choreId, roomId: req.params.roomId })
    if (!chore) throw new NotFoundError('chore not found')
    res.status(StatusCodes.NO_CONTENT).end()
}

module.exports = { getRoomChores, createChore, updateChore, deleteChore }
