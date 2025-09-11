import crypto from 'crypto';
import moment from 'moment';
import qs from 'qs';
import axios from 'axios';
import { Order, Cart } from '../models/index.js';
// Cấu hình VNPay - bạn nên lưu trong file .env
const VNP_TMN_CODE = process.env.VNP_TMN_CODE || '';
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || '';
const VNP_URL =
  process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_API =
  process.env.VNP_API ||
  'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
const VNP_RETURN_URL =
  process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/vnpay/return';

// Frontend URL for redirect
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function sortObject(obj) {
  const sorted = {};
  const str = [];

  // Use Object.prototype.hasOwnProperty.call() instead of obj.hasOwnProperty()
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

// Get client IP address
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

    // Validate required fields
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
    vnp_Params['vnp_TxnRef'] = order_number; // SỬ DỤNG ORDER_NUMBER thay vì tạo mới
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
        orderId: order_number, // Trả về order_number
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

export const vnpayReturn = async (req, res) => {
  try {
    console.log('VNPay return callback received:', req.query);

    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const vnpayTxnRef = req.query['vnp_TxnRef']; // Order ID từ VNPay
    const responseCode = req.query['vnp_ResponseCode'];
    const amount = parseInt(req.query['vnp_Amount']) / 100;

    console.log('VNPay validation - SecureHash valid:', secureHash === signed);
    console.log('VNPay TxnRef (order_number):', vnpayTxnRef);
    console.log('Response code:', responseCode);

    if (secureHash === signed) {
      if (responseCode === '00') {
        // Thanh toán thành công - CẬP NHẬT DATABASE
        console.log('Payment successful for VNPay TxnRef:', vnpayTxnRef);

        try {
          // QUAN TRỌNG: Tìm order bằng order_number (không phải id)
          const order = await Order.findOne({
            where: { order_number: vnpayTxnRef },
          });

          if (order) {
            // Cập nhật trạng thái thanh toán
            await order.update({
              payment_status: 'paid',
              status: 'processing',
            });

            // Xóa cart của user sau khi thanh toán thành công
            await Cart.destroy({
              where: { user_id: order.user_id },
            });

            console.log(`Order ${vnpayTxnRef} updated successfully`);

            // FIXED: Redirect đến đúng route PaymentResult với đúng params
            return res.redirect(
              `${FRONTEND_URL}/payment-result?status=success&vnpay_order_id=${vnpayTxnRef}&amount=${amount}&code=${responseCode}&message=success`
            );
          } else {
            console.error(`Order with order_number ${vnpayTxnRef} not found`);
            return res.redirect(
              `${FRONTEND_URL}/payment-result?status=error&message=order_not_found&vnpay_order_id=${vnpayTxnRef}&code=01`
            );
          }
        } catch (dbError) {
          console.error('Database update error:', dbError);
          return res.redirect(
            `${FRONTEND_URL}/payment-result?status=error&message=database_error&vnpay_order_id=${vnpayTxnRef}&code=99`
          );
        }
      } else {
        // Thanh toán thất bại
        console.log(
          'Payment failed for VNPay TxnRef:',
          vnpayTxnRef,
          'Code:',
          responseCode
        );

        try {
          // Cập nhật trạng thái thất bại
          const order = await Order.findOne({
            where: { order_number: vnpayTxnRef },
          });

          if (order) {
            await order.update({
              payment_status: 'failed',
              status: 'cancelled',
            });
          }
        } catch (dbError) {
          console.error('Database update error for failed payment:', dbError);
        }

        return res.redirect(
          `${FRONTEND_URL}/payment-result?status=failed&vnpay_order_id=${vnpayTxnRef}&code=${responseCode}&message=payment_failed`
        );
      }
    } else {
      console.log('Invalid signature in VNPay return');
      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=error&message=invalid_signature&code=97`
      );
    }
  } catch (error) {
    console.error('VNPay return error:', error);
    return res.redirect(
      `${FRONTEND_URL}/payment-result?status=error&message=system_error&code=99&error=${encodeURIComponent(
        error.message
      )}`
    );
  }
};

// Xử lý callback từ VNPay (redirect từ VNPay về frontend)
export const vnpayReturnRedirect = async (req, res) => {
  try {
    console.log('VNPay return redirect received:', req.query);

    let vnp_Params = { ...req.query }; // Create a copy
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

    console.log('VNPay validation - SecureHash valid:', secureHash === signed);
    console.log('Response code:', responseCode);

    if (secureHash === signed) {
      if (responseCode === '00') {
        // Thanh toán thành công - redirect đến frontend
        console.log('Payment successful for VNPay order:', vnpayOrderId);

        return res.redirect(
          `${FRONTEND_URL}?status=success&vnpay_order_id=${vnpayOrderId}&amount=${amount}`
        );
      } else {
        // Thanh toán thất bại - redirect đến frontend
        console.log(
          'Payment failed for VNPay order:',
          vnpayOrderId,
          'Code:',
          responseCode
        );

        return res.redirect(
          `${FRONTEND_URL}?status=failed&vnpay_order_id=${vnpayOrderId}&code=${responseCode}`
        );
      }
    } else {
      console.log('Invalid signature in VNPay return');
      return res.redirect(
        `${FRONTEND_URL}?status=error&message=invalid_signature`
      );
    }
  } catch (error) {
    console.error('VNPay return redirect error:', error);
    return res.redirect(`${FRONTEND_URL}?status=error&message=system_error`);
  }
};

// Xử lý IPN (Instant Payment Notification)
export const vnpayIpn = async (req, res) => {
  try {
    let vnp_Params = { ...req.query }; // Create a copy
    const secureHash = vnp_Params['vnp_SecureHash'];
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    let paymentStatus = '0'; // Trạng thái khởi tạo
    let checkOrderId = true; // Kiểm tra orderId có tồn tại trong DB
    let checkAmount = true; // Kiểm tra số tiền

    if (secureHash === signed) {
      if (checkOrderId) {
        if (checkAmount) {
          if (paymentStatus == '0') {
            if (rspCode == '00') {
              // Thanh toán thành công - cập nhật database
              // paymentStatus = '1';
              return res
                .status(200)
                .json({ RspCode: '00', Message: 'Success' });
            } else {
              // Thanh toán thất bại - cập nhật database
              // paymentStatus = '2';
              return res
                .status(200)
                .json({ RspCode: '00', Message: 'Success' });
            }
          } else {
            return res.status(200).json({
              RspCode: '02',
              Message: 'This order has been updated to the payment status',
            });
          }
        } else {
          return res
            .status(200)
            .json({ RspCode: '04', Message: 'Amount invalid' });
        }
      } else {
        return res
          .status(200)
          .json({ RspCode: '01', Message: 'Order not found' });
      }
    } else {
      return res
        .status(200)
        .json({ RspCode: '97', Message: 'Checksum failed' });
    }
  } catch (error) {
    console.error('VNPay IPN error:', error);
    return res
      .status(200)
      .json({ RspCode: '99', Message: 'Internal server error' });
  }
};

// Truy vấn kết quả thanh toán
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
