import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // hoặc 'smooth' nếu muốn có animation
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
