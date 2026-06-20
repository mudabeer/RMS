const Transaction = require('../models/Transaction')
const {StatusCodes}  = require('http-status-codes')

const {
    BadRequestError
} = require('../errors/index')

const updateDebtPayment = async (req,res) => {
    const {
        payment
    } = req.body
    const member = req.transaction.splitAmong.find(
        m => {
            if(m.userId.toString() === req.params.memberId){
                return m
            }
        }
    )

    if(member.status === 'Paid'){
        throw new BadRequestError('the debt amount paid')
    }

    if(!payment ){
        throw new BadRequestError('please provide payment amount')
    }

    const dueAmount = member.debtAmount - member.paidAmount   

    const status = Number(dueAmount) === Number(payment) ? 'Paid' : 'Partial'

    member.paidAmount = Number(member.paidAmount) + Number(payment)
    member.status = status

    req.transaction.splitAmong.forEach((element,index,array) => {
            if(element.userId.toString() === member.userId.toString()){
                array[index] = member
            }
    })

    await req.transaction.save()

    res.status(StatusCodes).json({"msg":"updated debt"})
}

module.exports = {updateDebtPayment}