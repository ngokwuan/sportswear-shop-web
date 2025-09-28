export const formatCurrency = (amount) => {
  const numAmount = Number(amount);

  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return '0đ';
  }

  return new Intl.NumberFormat('vi-VN').format(numAmount) + 'đ';
};
