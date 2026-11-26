const Transaction = require('../models/Transaction')
const Room = require('../models/Room')

const {StatusCodes} = require('http-status-codes')

const {
    NotFoundError,
    BadRequestError,
    UnauthenticatedError
} = require('../errors/index')
const { json } = require('express')

const createTrans = async (req,res) =>{
    const {
        title,amount,category,splitType
    } = req.body

    let {members} = req.body    

    if(!splitType){
        throw new BadRequestError('please provide split type')
    }

    if(splitType === 'allRoomMember'){

        members = req.membersDoc
       
    }else if(splitType === 'custom'){

        if(!Array.isArray(members) || members.length === 0){
            throw new BadRequestError('provide members')
        }

        members = [...new Set(members.map(String))]
        const roomMemberSet = new Set(req.membersDoc)
        const allBelongToRoom = members.every(id => roomMemberSet.has(id))
        if(!allBelongToRoom){
            throw new BadRequestError('all split members must belong to the room')
        }
    }else{
        throw new BadRequestError('invalid split type')
    }

    const numericAmount = Number(amount)
    if(amount === undefined || amount === null || amount === '' || !Number.isFinite(numericAmount) || numericAmount <= 0){
        throw new BadRequestError('please provide a valid positive amount')
    }

    const totalCents = Math.round(numericAmount * 100)
    if(totalCents <= 0){
        throw new BadRequestError('please provide a valid positive amount')
    }

    const baseCents = Math.floor(totalCents / members.length)
    const remainder = totalCents % members.length

    const splitAmong = members.map((member, index) => {
        const memberDebt = (baseCents + (index < remainder ? 1 : 0)) / 100
        if(member === req.user.userId.toString()){
            return {userId:member,debtAmount:memberDebt,paidAmount:memberDebt,status:'Paid'}
        }else{
            return {userId:member,debtAmount:memberDebt}
        }
    })

        const transaction = await Transaction.create({
            title,
            amount: totalCents / 100,
            category,
            roomId:req.params.roomId,
            shareAmount: baseCents / 100,
            paidBy:req.user.userId,
            splitAmong
        })

    res.status(StatusCodes.CREATED).json({
        success: true,
        'msg':'created transaction'
    })
}

const getSingleTrans = async (req,res) =>{
    res.status(StatusCodes.OK).json({
        success: true,
        data:req.transaction,
        msg:"found transaction"
    })
}

const getAllTrans = async (req,res) =>{
    const {search,amount,category,paidBy,debts,debtAmount,status,sort,numericFilters} = req.query;

    const queryObject = {
        roomId: req.params.roomId
    }

    if(search){
        queryObject.title = { $regex: search, $options: 'i' };
    }

    if(category && category !== 'all'){
        queryObject.category = category
    }

    let options = ['amount'];

    if(debts){
        options[1] = 'debtAmount' 
    }

    const splitAmong = {}
    if (numericFilters) {
        
        const operatorMap = {
        '>': '$gt',
        '>=': '$gte',
        '=': '$eq',
        '<': '$lt',
        '<=': '$lte',
        };

        const regEx = /\b(<|>|>=|=|<|<=)\b/g;

        let filters = numericFilters.replace(
            regEx,
            (match) => `-${operatorMap[match]}-`
        );

        

        filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-');
            
            if (options.includes(field)) {
                if(field === 'debtAmount'){
                    splitAmong.debtAmount = { [operator]: Number(value) };
                }
                else{
                queryObject[field] = { [operator]: Number(value) };
                }
            }
        });
    }
    
    if(debts){
        splitAmong.userId = debts        
        if(status){
            splitAmong.status = status
        }
        queryObject.splitAmong = {
            $elemMatch: splitAmong
        }
        
    }


    if(paidBy){
        queryObject.paidBy = paidBy
    }

    let result =  Transaction.find(queryObject)

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

    const transactions = await result
        .populate('paidBy', 'name')
        .populate('splitAmong.userId', 'name');
    const totaltransactionss = await Transaction.countDocuments(queryObject);
    const numOfPages = Math.ceil(totaltransactionss / limit)
    
    res.status(StatusCodes.OK).json({
        success: true,
        data: {
        transactions,totaltransactionss,numOfPages},
        msg: "matching transactions"
    })
}

const updateTrans = async (req,res) =>{
    const {
        paidBy,
        title,
        shareAmount,
        amount,
        category,
        members,
        splitType
    } = req.body

    if(!title && !category){
        throw new BadRequestError('please provide title or category')
    }

    if(title){
    req.transaction.title = title
    }

    if(category){
    req.transaction.category = category
    }

    if(amount || paidBy || members || splitType || shareAmount){
        throw new BadRequestError('can not edit transaction details except title and category but you can delete transaction create new')
    }

    await req.transaction.save()

    res.status(StatusCodes.OK).json({
        success: true,
        'msg':'update transaction'
    })
}

const deleteTrans = async (req,res) => {
    const hasSettledMember = req.transaction.splitAmong.some(
        m => {
            if(m.userId.toString() !== req.transaction.paidBy.toString()){
                return m.status === 'Paid' || m.status === 'Partial'
            }
            return false
        }
    )

    if(hasSettledMember){
        throw new BadRequestError('if any one\'s debt amount paid or partial can delete transaction')
    }

    const transaction = await Transaction.deleteOne({_id:req.params.transactionId})
    
    if(!transaction){
        throw new NotFoundError('transaction not found')
    }

    res.status(StatusCodes.NO_CONTENT).end()
}

module.exports = {
    createTrans,
    getAllTrans,
    getSingleTrans,
    updateTrans,
    deleteTrans
}
