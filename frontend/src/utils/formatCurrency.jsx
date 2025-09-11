export const formatCurrency = (amount) => {
  // Kiểm tra và chuyển đổi sang number
  const numAmount = Number(amount);

  // Kiểm tra có phải là number hợp lệ không
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return '0đ';
  }

  // Format theo định dạng Việt Nam
  return new Intl.NumberFormat('vi-VN').format(numAmount) + 'đ';
};
