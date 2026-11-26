const Transaction = require('../models/Transaction')
const {StatusCodes}  = require('http-status-codes')

const {
    BadRequestError
} = require('../errors/index')

const updateDebtPayment = async (req,res) => {
    // Guard: only the creditor (paidBy) can record debt settlements
    if(req.transaction.paidBy.toString() !== req.user.userId.toString()){
        throw new BadRequestError('only the creditor can settle debts')
    }

    const {
        payment
    } = req.body

    // Validate payment is a positive number
    const paymentAmount = Number(payment)
    if(isNaN(paymentAmount) || paymentAmount <= 0){
        throw new BadRequestError('please provide a valid positive payment amount')
    }

    const member = req.transaction.splitAmong.find(
        m => {
            if(m.userId.toString() === req.params.memberId){
                return m
            }
        }
    )

    if(!member){
        throw new BadRequestError('member not found in this transaction')
    }

    if(member.status === 'Paid'){
        throw new BadRequestError('the debt amount paid')
    }

    const dueAmount = member.debtAmount - member.paidAmount   

    if (payment > dueAmount) {
        throw new BadRequestError('payment exceeds due amount');
    }

    const status = Number(dueAmount) === Number(payment) ? 'Paid' : 'Partial'

    member.paidAmount = Number(member.paidAmount) + Number(payment)
    member.status = status

    req.transaction.splitAmong.forEach((element,index,array) => {
            if(element.userId.toString() === member.userId.toString()){
                array[index] = member
            }
    })

    await req.transaction.save()

    res.status(StatusCodes.OK).json({
        success: true,
        "msg":"updated debt"
    })
}

module.exports = {updateDebtPayment}