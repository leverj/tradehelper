const { Order, OrderType, Side } = require('@leverj/gluon-plasma.exchange')
const { BN, toWei } = require("web3-utils")
const mathUtil = require('./mathutil')
const ORDER_TYPE_MAP = { LMT: OrderType.limit, MKT: OrderType.market }

module.exports = (function () {
    const signer = {}

    signer.toBN = function (number, decimalPlaces = 18) {
        const asWei = new BN(toWei(mathUtil.noExponents(number), 'ether'))
        return asWei.div(new BN(Math.pow(10, 18 - decimalPlaces)))
    }

    signer.createGluonPlasmaOrder = function (order, decimals) {
        const quantity = signer.toBN(order.quantity, decimals);
        const price = signer.toBN(order.price).div(new BN(Math.pow(10, decimals)));
        const timestamp = new BN(order.timestamp);
        const id = new BN(order.clientOrderId);
        const orderType = new BN(ORDER_TYPE_MAP[order.orderType]);
        const side = new BN(Side[order.side]);
        return new Order(id, timestamp, orderType, side, order.token, quantity, price, order.originator, order.accountId)
    }

    signer.sign = function (order, tokenDecimals, secret) {
        const signedGluonPlasmaOrder = signer.createGluonPlasmaOrder(order, tokenDecimals).signedBy(secret)
        return signedGluonPlasmaOrder.signature
    }

    return signer
})()