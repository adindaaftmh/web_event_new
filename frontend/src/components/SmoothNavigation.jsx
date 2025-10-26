import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SmoothNavigation = () => {
  const location = useLocation();

  useEffect(() => {
    // Smooth scroll to top on route change
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Add page enter animation class
    const root = document.getElementById('root');
    if (root) {
      root.classList.remove('page-enter');
      // Trigger reflow
      void root.offsetWidth;
      root.classList.add('page-enter');
    }
  }, [location.pathname]);

  return null;
};

export default SmoothNavigation;
