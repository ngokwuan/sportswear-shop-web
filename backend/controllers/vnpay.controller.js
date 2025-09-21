import crypto from 'crypto';
import moment from 'moment';
import qs from 'qs';
import axios from 'axios';
import { Order, Cart } from '../models/index.js';
// Cấu hình VNPay - bạn nên lưu trong file .env
const VNP_TMN_CODE = process.env.VNP_TMN_CODE || '';
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || '';
const VNP_URL = process.env.VNP_URL;
const VNP_API = process.env.VNP_API;
const VNP_RETURN_URL = process.env.VNP_RETURN_URL;
const FRONTEND_URL_RS = process.env.FRONTEND_URL_RS;

function sortObject(obj) {
  const sorted = {};
  const str = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }

  str.sort();

  for (let i = 0; i < str.length; i++) {
    const key = str[i];
    sorted[key] = encodeURIComponent(obj[decodeURIComponent(key)]).replace(
      /%20/g,
      '+'
    );
  }

  return sorted;
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket && req.connection.socket.remoteAddress) ||
    req.ip
  );
}

export const createPaymentUrl = async (req, res) => {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const ipAddr = getClientIp(req);

    // Sử dụng order_number từ request (được truyền từ frontend)
    const {
      amount,
      bankCode = '',
      language = 'vn',
      orderInfo,
      order_number,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền thanh toán không hợp lệ',
      });
    }

    if (!order_number) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu order_number',
      });
    }

    let locale = language;
    if (locale === null || locale === '') {
      locale = 'vn';
    }

    const currCode = 'VND';
    let vnp_Params = {};

    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = VNP_TMN_CODE;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = order_number;
    vnp_Params['vnp_OrderInfo'] =
      orderInfo || `Thanh toan cho don hang: ${order_number}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = VNP_RETURN_URL;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl =
      VNP_URL + '?' + qs.stringify(vnp_Params, { encode: false });

    console.log('Generated VNPay payment URL for order:', order_number);

    return res.status(200).json({
      success: true,
      data: {
        paymentUrl,
        orderId: order_number,
      },
    });
  } catch (error) {
    console.error('Create payment URL error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tạo URL thanh toán',
      error: error.message,
    });
  }
};

export const vnpayReturnRedirect = async (req, res) => {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const vnpayOrderId = req.query['vnp_TxnRef'];
    const responseCode = req.query['vnp_ResponseCode'];
    const amount = parseInt(req.query['vnp_Amount']) / 100;

    if (secureHash !== signed) {
      console.log('Invalid signature in VNPay return');
      return res.redirect(
        `${FRONTEND_URL_RS}?status=error&message=invalid_signature`
      );
    }

    try {
      const order = await Order.findOne({
        where: { order_number: vnpayOrderId },
      });

      if (order) {
        if (order.payment_status === 'pending') {
          console.log(
            'Order still pending - updating from return handler as fallback'
          );

          let newPaymentStatus, newOrderStatus;

          if (responseCode === '00') {
            newPaymentStatus = 'paid';
            newOrderStatus = 'processing';
          } else {
            newPaymentStatus = 'failed';
            newOrderStatus = 'cancelled';
          }

          // Update the order
          const [updatedRowsCount] = await Order.update(
            {
              payment_status: newPaymentStatus,
              status: newOrderStatus,
              updated_at: new Date(),
            },
            {
              where: { order_number: vnpayOrderId },
            }
          );

          // Clear cart if payment successful
          if (responseCode === '00') {
            try {
              const deletedCount = await Cart.destroy({
                where: { user_id: order.user_id },
              });
            } catch (cartError) {
              console.error(
                'Error clearing cart in return handler:',
                cartError
              );
            }
          }

          // Verify the update
          const verifyOrder = await Order.findOne({
            where: { order_number: vnpayOrderId },
          });
        } else {
          console.log('Order already processed by IPN - no update needed');
        }

        // Redirect with appropriate status
        if (responseCode === '00') {
          console.log('Payment successful for VNPay order:', vnpayOrderId);
          return res.redirect(
            `${FRONTEND_URL_RS}?status=success&order_id=${order.id}&order_number=${vnpayOrderId}&amount=${amount}&payment_status=${order.payment_status}`
          );
        } else {
          console.log(
            'Payment failed for VNPay order:',
            vnpayOrderId,
            'Code:',
            responseCode
          );
          return res.redirect(
            `${FRONTEND_URL_RS}?status=failed&order_id=${order.id}&order_number=${vnpayOrderId}&code=${responseCode}`
          );
        }
      } else {
        console.log('Order not found:', vnpayOrderId);
        return res.redirect(
          `${FRONTEND_URL_RS}?status=error&message=order_not_found&order_number=${vnpayOrderId}`
        );
      }
    } catch (dbError) {
      console.error('Database error in return handler:', dbError);

      if (responseCode === '00') {
        return res.redirect(
          `${FRONTEND_URL_RS}?status=success&order_number=${vnpayOrderId}&amount=${amount}`
        );
      } else {
        return res.redirect(
          `${FRONTEND_URL_RS}?status=failed&order_number=${vnpayOrderId}&code=${responseCode}`
        );
      }
    }
  } catch (error) {
    console.error('VNPay return redirect error:', error);
    return res.redirect(`${FRONTEND_URL_RS}?status=error&message=system_error`);
  }
};
export const vnpayIpn = async (req, res) => {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];
    const orderId = vnp_Params['vnp_TxnRef']; // Đây là order_number
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Kiểm tra chữ ký
    if (secureHash !== signed) {
      console.log('❌ Invalid signature in VNPay IPN');
      return res.status(200).json({
        RspCode: '97',
        Message: 'Checksum failed',
      });
    }

    // Tìm order trong database

    const order = await Order.findOne({
      where: { order_number: orderId },
    });

    if (!order) {
      return res.status(200).json({
        RspCode: '01',
        Message: 'Order not found',
      });
    }

    // Kiểm tra số tiền
    const orderAmount = parseFloat(order.total_amount);

    if (Math.abs(orderAmount - amount) > 0.01) {
      return res.status(200).json({
        RspCode: '04',
        Message: 'Amount invalid',
      });
    }

    // Kiểm tra trạng thái thanh toán hiện tại

    if (order.payment_status !== 'pending') {
      return res.status(200).json({
        RspCode: '02',
        Message: 'This order has been updated to the payment status',
      });
    }

    // Cập nhật trạng thái thanh toán dựa trên response code
    let newPaymentStatus;
    let newOrderStatus;

    if (rspCode === '00') {
      newPaymentStatus = 'paid';
      newOrderStatus = 'processing';
    } else {
      newPaymentStatus = 'failed';
      newOrderStatus = 'cancelled';
    }

    const [updatedRowsCount] = await Order.update(
      {
        payment_status: newPaymentStatus,
        status: newOrderStatus,
        updated_at: new Date(),
      },
      {
        where: { order_number: orderId },
      }
    );

    console.log('Updated rows count:', updatedRowsCount);

    // Verify the update
    const updatedOrder = await Order.findOne({
      where: { order_number: orderId },
    });

    // Clear cart if payment successful
    if (rspCode === '00') {
      try {
        const deletedCount = await Cart.destroy({
          where: { user_id: order.user_id },
        });
      } catch (cartError) {
        console.error('Error clearing cart:', cartError);
      }
    }

    return res.status(200).json({
      RspCode: '00',
      Message: 'Success',
    });
  } catch (error) {
    return res.status(200).json({
      RspCode: '99',
      Message: 'Internal server error',
    });
  }
};

export const queryTransaction = async (req, res) => {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();

    const { orderId, transDate } = req.body;

    if (!orderId || !transDate) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin orderId hoặc transDate',
      });
    }

    const vnp_RequestId = moment(date).format('HHmmss');
    const vnp_Version = '2.1.0';
    const vnp_Command = 'querydr';
    const vnp_TmnCode = VNP_TMN_CODE;
    const vnp_TxnRef = orderId;
    const vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;
    const vnp_TransactionDate = transDate;
    const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
    const vnp_IpAddr = getClientIp(req);

    const data =
      vnp_RequestId +
      '|' +
      vnp_Version +
      '|' +
      vnp_Command +
      '|' +
      vnp_TmnCode +
      '|' +
      vnp_TxnRef +
      '|' +
      vnp_TransactionDate +
      '|' +
      vnp_CreateDate +
      '|' +
      vnp_IpAddr +
      '|' +
      vnp_OrderInfo;

    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const vnp_SecureHash = hmac
      .update(Buffer.from(data, 'utf-8'))
      .digest('hex');

    const dataObj = {
      vnp_RequestId: vnp_RequestId,
      vnp_Version: vnp_Version,
      vnp_Command: vnp_Command,
      vnp_TmnCode: vnp_TmnCode,
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_TransactionDate: vnp_TransactionDate,
      vnp_CreateDate: vnp_CreateDate,
      vnp_IpAddr: vnp_IpAddr,
      vnp_SecureHash: vnp_SecureHash,
    };

    const response = await axios.post(VNP_API, dataObj, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Query transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi truy vấn giao dịch',
      error: error.message,
    });
  }
};

// Hoàn tiền
export const refund = async (req, res) => {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();

    const { orderId, transDate, amount, transType, user } = req.body;

    if (!orderId || !transDate || !amount || !transType || !user) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc',
      });
    }

    const vnp_RequestId = moment(date).format('HHmmss');
    const vnp_Version = '2.1.0';
    const vnp_Command = 'refund';
    const vnp_TmnCode = VNP_TMN_CODE;
    const vnp_TransactionType = transType;
    const vnp_TxnRef = orderId;
    const vnp_Amount = amount * 100;
    const vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;
    const vnp_TransactionNo = '0';
    const vnp_TransactionDate = transDate;
    const vnp_CreateBy = user;
    const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
    const vnp_IpAddr = getClientIp(req);

    const data =
      vnp_RequestId +
      '|' +
      vnp_Version +
      '|' +
      vnp_Command +
      '|' +
      vnp_TmnCode +
      '|' +
      vnp_TransactionType +
      '|' +
      vnp_TxnRef +
      '|' +
      vnp_Amount +
      '|' +
      vnp_TransactionNo +
      '|' +
      vnp_TransactionDate +
      '|' +
      vnp_CreateBy +
      '|' +
      vnp_CreateDate +
      '|' +
      vnp_IpAddr +
      '|' +
      vnp_OrderInfo;

    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const vnp_SecureHash = hmac
      .update(Buffer.from(data, 'utf-8'))
      .digest('hex');

    const dataObj = {
      vnp_RequestId: vnp_RequestId,
      vnp_Version: vnp_Version,
      vnp_Command: vnp_Command,
      vnp_TmnCode: vnp_TmnCode,
      vnp_TransactionType: vnp_TransactionType,
      vnp_TxnRef: vnp_TxnRef,
      vnp_Amount: vnp_Amount,
      vnp_TransactionNo: vnp_TransactionNo,
      vnp_CreateBy: vnp_CreateBy,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_TransactionDate: vnp_TransactionDate,
      vnp_CreateDate: vnp_CreateDate,
      vnp_IpAddr: vnp_IpAddr,
      vnp_SecureHash: vnp_SecureHash,
    };

    const response = await axios.post(VNP_API, dataObj, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hoàn tiền',
      error: error.message,
    });
  }
};
