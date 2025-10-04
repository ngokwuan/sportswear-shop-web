// src/components/Pagination
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import styles from './Pagination.module.scss';

const cx = classNames.bind(styles);

function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  itemName = 'sản phẩm', // Tên item có thể thay đổi: 'sản phẩm', 'người dùng', 'đơn hàng'...
}) {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handlePageChange = (pageNumber) => {
    onPageChange(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cx('pagination')}>
      <div className={cx('pagination-info')}>
        Hiển thị {indexOfFirstItem + 1} -{' '}
        {Math.min(indexOfLastItem, totalItems)} trong tổng số {totalItems}{' '}
        {itemName}
      </div>

      <div className={cx('pagination-controls')}>
        <button
          className={cx('pagination-btn', 'prev-btn')}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          Trước
        </button>

        <div className={cx('pagination-numbers')}>
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;

            // Show first page, last page, current page, and pages around current
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNumber}
                  className={cx('pagination-number', {
                    active: currentPage === pageNumber,
                  })}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            } else if (
              pageNumber === currentPage - 2 ||
              pageNumber === currentPage + 2
            ) {
              return (
                <span key={pageNumber} className={cx('pagination-dots')}>
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        <button
          className={cx('pagination-btn', 'next-btn')}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
