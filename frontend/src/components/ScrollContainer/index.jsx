import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ScrollContainer.module.scss';

const cx = classNames.bind(styles);

function ScrollContainer({
  items = [],
  itemsPreView = 2,
  renderItem,
  className = '',
  showDots = true,
  showArrows = true,
  gap = 16,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalPages = Math.ceil(items.length / itemsPreView);
  const currentPage = Math.floor(currentIndex / itemsPreView);

  const handleNext = () => {
    if (currentIndex + itemsPreView < items.length) {
      setCurrentIndex((prev) => prev + itemsPreView);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - itemsPreView);
    }
  };

  const goToPage = (pageIndex) => {
    setCurrentIndex(pageIndex * itemsPreView);
  };

  const hasNext = currentIndex + itemsPreView < items.length;
  const hasPrev = currentIndex > 0;

  const visibleItems = items.slice(currentIndex, currentIndex + itemsPreView);

  if (items.length === 0) return null;

  let gridTemplateColumns;
  let gridClass = '';

  if (itemsPreView === 6) {
    gridTemplateColumns = 'repeat(3, 1fr)';
    gridClass = 'grid-3x2';
  } else {
    gridTemplateColumns = `repeat(${itemsPreView}, 1fr)`;
  }

  return (
    <div className={cx('scroll-container', className)}>
      <div className={cx('scroll-wrapper')}>
        {/* Products Grid - hiển thị động theo itemsPreView */}
        <div
          className={cx('products-grid', gridClass)}
          style={{
            gap: `${gap}px`,
            gridTemplateColumns: gridTemplateColumns,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={currentIndex + index} className={cx('product-item')}>
              {renderItem(item, currentIndex + index)}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showArrows && (
          <>
            {hasPrev && (
              <button
                onClick={handlePrev}
                className={cx('nav-arrow', 'prev-arrow')}
              >
                ←
              </button>
            )}
            {hasNext && (
              <button
                onClick={handleNext}
                className={cx('nav-arrow', 'next-arrow')}
              >
                →
              </button>
            )}
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {showDots && totalPages > 1 && (
        <div className={cx('dots-indicator')}>
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <button
              key={pageIndex}
              className={cx('dot', { active: currentPage === pageIndex })}
              onClick={() => goToPage(pageIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ScrollContainer;
