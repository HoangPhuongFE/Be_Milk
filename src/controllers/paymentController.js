const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');
require('dotenv').config();

const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_HASHSECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURNURL;

function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

async function createPaymentUrl(orderId, amount, ipAddr) {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const txnRef = moment(date).format('HHmmss');
    const orderInfo = `Thanh toan don hang ${orderId}`;
    const orderType = 'billpayment';
    const locale = 'vn';
    const currCode = 'VND';

    const vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_Locale': locale,
        'vnp_CurrCode': currCode,
        'vnp_TxnRef': txnRef,
        'vnp_OrderInfo': orderInfo,
        'vnp_OrderType': orderType,
        'vnp_Amount': (amount * 100).toString(),
        'vnp_ReturnUrl': vnp_ReturnUrl,
        'vnp_IpAddr': ipAddr,
        'vnp_CreateDate': createDate
    };

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    sortedParams['vnp_SecureHash'] = signed;
    const paymentUrl = `${vnp_Url}?${querystring.stringify(sortedParams, { encode: false })}`;

    return paymentUrl;
}

exports.createPaymentUrl = async (req, res) => {
    try {
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);

        const { orderId, amount } = req.body;
        const paymentUrl = await createPaymentUrl(orderId, amount, ipAddr);

        res.status(200).json({ paymentUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.vnpayReturn = async (req, res) => {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        const orderId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];

        try {
            const order = await Order.findOne({ where: { order_id: orderId } });
            if (!order) {
                return res.status(404).json({ RspCode: '01', Message: 'Order not found' });
            }

            if (responseCode === '00') {
                // Thanh toán thành công
                order.status = 'paid';
            } else {
                // Thanh toán thất bại
                order.status = 'failed';
            }

            await order.save();

            res.status(200).json({ RspCode: '00', Message: 'success' });
        } catch (err) {
            res.status(500).json({ RspCode: '99', Message: 'Unknown error' });
        }
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
    }
};

module.exports.createPaymentUrl = createPaymentUrl;
