const Transaction = require('../models/Transaction')
const {StatusCodes}  = require('http-status-codes')

const {
    BadRequestError,
    ForbiddenError
} = require('../errors/index')

const updateDebtPayment = async (req,res) => {
    // Guard: only the creditor (paidBy) can record debt settlements
    if(req.transaction.paidBy.toString() !== req.user.userId.toString()){
        throw new ForbiddenError('only the creditor can settle debts')
    }

    const {
        payment
    } = req.body

    // Validate payment is a positive number
    const paymentAmount = Number(payment)
    const paymentCents = Math.round(paymentAmount * 100)
    if(!Number.isFinite(paymentAmount) || paymentCents <= 0){
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

    const debtCents = Math.round(Number(member.debtAmount) * 100)
    const paidCents = Math.round(Number(member.paidAmount) * 100)
    const dueCents = debtCents - paidCents

    if (paymentCents > dueCents) {
        throw new BadRequestError('payment exceeds due amount');
    }

    const newPaidCents = paidCents + paymentCents
    const status = newPaidCents === debtCents ? 'Paid' : 'Partial'

    member.paidAmount = newPaidCents / 100
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