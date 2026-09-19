import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faCreditCard,
  faShield,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
  motion,
  MotionConfig,
  animate,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import styles from './Home.module.scss';
import Question from './Question';
import Blogs from './Blogs';
import Trending from './Trending';
import Groups from './Groups';
import NewProducts from './NewProducts';

const cx = classNames.bind(styles);

/* ------------------------------------------------------------------ */
/*  Motion vocabulary: mọi thứ "lao" vào từ vạch xuất phát bên trái     */
/* ------------------------------------------------------------------ */
const EASE_BURST = [0.16, 1, 0.3, 1];

const stagger = (gap = 0.1) => ({
  visible: { transition: { staggerChildren: gap } },
});

const dash = {
  hidden: { opacity: 0, x: -60, skewX: 12 },
  visible: {
    opacity: 1,
    x: 0,
    skewX: 0,
    transition: { duration: 0.6, ease: EASE_BURST },
  },
};

// Từng dòng tiêu đề được "quét" ra như vạch về đích
const titleLine = {
  hidden: { x: -80, skewX: 14, clipPath: 'inset(-20% 120% -20% -20%)' },
  visible: {
    x: 0,
    skewX: 0,
    clipPath: 'inset(-20% -20% -20% -20%)',
    transition: { duration: 0.7, ease: EASE_BURST },
  },
};

/* ------------------------------------------------------------------ */
/*  Dữ liệu                                                            */
/* ------------------------------------------------------------------ */
const marqueeItems = [
  'PREMIUM SPORTSWEAR',
  'FREE SHIPPING ON ORDERS OVER $100',
  'NEW ARRIVALS',
  'BUILT FOR THE RELENTLESS',
];

const speedLines = [
  { top: '12%', width: '38%', duration: 2.2, delay: 0 },
  { top: '24%', width: '26%', duration: 1.7, delay: 0.6 },
  { top: '37%', width: '44%', duration: 2.8, delay: 1.1 },
  { top: '52%', width: '30%', duration: 1.9, delay: 0.3 },
  { top: '66%', width: '40%', duration: 2.5, delay: 1.5 },
  { top: '79%', width: '24%', duration: 1.6, delay: 0.9 },
  { top: '90%', width: '34%', duration: 2.1, delay: 0.2 },
];

const features = [
  {
    icon: faTruck,
    title: 'WORLDWIDE SHIPPING',
    desc: 'Fast & trackable delivery.',
  },
  {
    icon: faShield,
    title: 'PREMIUM QUALITY',
    desc: 'Tested by pro athletes.',
  },
  {
    icon: faCreditCard,
    title: 'SECURE CHECKOUT',
    desc: '100% safe payments.',
  },
];

// TODO: thay bằng số liệu thật của shop
const stats = [
  { value: 50000, suffix: '+', label: 'Athletes wearing our gear' },
  { value: 120, suffix: '+', label: 'Performance styles' },
  { value: 48, suffix: '', label: 'Countries we ship to' },
  { value: 4.9, decimals: 1, suffix: '/5', label: 'Average customer rating' },
];

/* ------------------------------------------------------------------ */
/*  Component nhỏ                                                      */
/* ------------------------------------------------------------------ */

// Thanh tiến độ cuộc đua ở đầu trang
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });
  return <motion.div className={cx('scroll-progress')} style={{ scaleX }} />;
}

// Tiêu đề section: vệt highlight neon quét qua khi cuộn tới
function SectionTitle({ children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  return (
    <div className={cx('section-header')}>
      <h2 ref={ref} className={cx('section-title', { 'in-view': inView })}>
        {children}
      </h2>
    </div>
  );
}

const formatNumber = (value, decimals) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

// Số chạy như bảng điểm
function CountUp({ to, decimals = 0, duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!inView || !node) return undefined;

    if (reduce) {
      node.textContent = formatNumber(to, decimals);
      return undefined;
    }

    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        node.textContent = formatNumber(v, decimals);
      },
    });
    return () => controls.stop();
  }, [inView, reduce, to, decimals, duration]);

  return <span ref={ref}>{formatNumber(0, decimals)}</span>;
}

// Hai hàng chữ chạy ngược chiều nhau, lặp liền mạch (translate -50%)
function Marquee() {
  const rows = [
    { key: 'forward', items: marqueeItems, reverse: false },
    { key: 'backward', items: [...marqueeItems].reverse(), reverse: true },
  ];

  return (
    <div className={cx('marquee')} aria-hidden="true">
      {rows.map(({ key, items, reverse }) => (
        <div
          key={key}
          className={cx('marquee-row', { reverse, outline: reverse })}
        >
          <div className={cx('marquee-track')}>
            {[0, 1].map((half) => (
              <div className={cx('marquee-half')} key={half}>
                {[...items, ...items].map((text, i) => (
                  <span className={cx('marquee-item')} key={i}>
                    {text}
                    <i className={cx('marquee-sep')} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trang chủ                                                          */
/* ------------------------------------------------------------------ */
function Home() {
  const reduce = useReducedMotion();
  const heroRef = useRef(null);
  const showcaseRef = useRef(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const { scrollYProgress: showcaseProgress } = useScroll({
    target: showcaseRef,
    offset: ['start end', 'end start'],
  });

  // Parallax nhẹ cho ảnh hero, chữ watermark trôi ngang ở showcase
  const imageY = useTransform(heroProgress, [0, 1], reduce ? [0, 0] : [0, 90]);
  const watermarkX = useTransform(
    showcaseProgress,
    [0, 1],
    reduce ? ['0%', '0%'] : ['8%', '-38%'],
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className={cx('page-wrapper')}>
        <ScrollProgress />

        <main className={cx('main-content')}>
          {/* Hero */}
          <section className={cx('hero-section')} ref={heroRef}>
            <div className={cx('hero-split-bg')}>
              {speedLines.map((line, i) => (
                <span
                  key={i}
                  className={cx('speed-line')}
                  style={{
                    top: line.top,
                    width: line.width,
                    animationDuration: `${line.duration}s`,
                    animationDelay: `${line.delay}s`,
                  }}
                />
              ))}
            </div>

            <div className={cx('container', 'hero-container')}>
              <motion.div
                className={cx('hero-content')}
                initial="hidden"
                animate="visible"
                variants={stagger(0.1)}
              >
                {/* motion ở lớp ngoài, skew (CSS) ở lớp trong để không bị ghi đè */}
                <motion.div className={cx('hero-badge-slot')} variants={dash}>
                  <div className={cx('hero-badge')}>
                    <span className={cx('pulse-dot')} /> NEW SEASON DROP
                  </div>
                </motion.div>

                <motion.h1
                  className={cx('hero-title')}
                  variants={stagger(0.12)}
                >
                  <motion.span
                    className={cx('title-line')}
                    variants={titleLine}
                  >
                    UNLEASH
                  </motion.span>
                  <motion.span
                    className={cx('title-line')}
                    variants={titleLine}
                  >
                    YOUR
                  </motion.span>
                  <motion.span
                    className={cx('title-line', 'text-neon')}
                    variants={titleLine}
                  >
                    POTENTIAL
                  </motion.span>
                </motion.h1>

                <motion.p className={cx('hero-description')} variants={dash}>
                  High-performance gear built for the relentless. Dominate every
                  workout with cutting-edge sportswear.
                </motion.p>

                <motion.div className={cx('hero-actions')} variants={dash}>
                  <Link to="/products" className={cx('btn-primary')}>
                    SHOP MEN'S
                  </Link>
                  <Link to="/products" className={cx('btn-secondary')}>
                    SHOP WOMEN'S
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                className={cx('hero-image-wrapper')}
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              >
                <motion.div
                  className={cx('hero-image-parallax')}
                  style={{ y: imageY }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800"
                    alt="Athlete in motion"
                    className={cx('hero-img')}
                  />
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Marquee 2 chiều */}
          <Marquee />

          {/* Categories */}
          <section className={cx('light-section')}>
            <div className={cx('container')}>
              <SectionTitle>EXPLORE CATEGORIES</SectionTitle>
              <Groups />
            </div>
          </section>

          {/* Best Seller Showcase */}
          <section className={cx('showcase-section')} ref={showcaseRef}>
            <motion.div
              className={cx('showcase-watermark')}
              style={{ x: watermarkX }}
              aria-hidden="true"
            >
              PERFORMANCE
            </motion.div>

            <div className={cx('container')}>
              <div className={cx('showcase-grid')}>
                <motion.div
                  className={cx('showcase-image-container')}
                  initial={{ opacity: 0, x: -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: EASE_BURST }}
                >
                  <img
                    src="https://res.cloudinary.com/dputjypns/image/upload/v1760374135/products/bbjbfzmwscfaumgnqosn.jpg"
                    alt="Best Seller"
                    className={cx('showcase-img')}
                    loading="lazy"
                  />
                  <div className={cx('floating-badge')}>#1 BEST SELLER</div>
                </motion.div>

                <motion.div
                  className={cx('showcase-content')}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger(0.12)}
                >
                  <motion.h2 className={cx('showcase-title')} variants={dash}>
                    AERO <br />
                    DYNAMIC <span className={cx('text-neon')}>PRO</span>
                  </motion.h2>
                  <motion.p className={cx('showcase-text')} variants={dash}>
                    Engineered with breathable mesh and sweat-wicking fabric to
                    keep you cool under extreme pressure. The choice of
                    champions.
                  </motion.p>
                  <motion.div variants={dash}>
                    <Link to="/products" className={cx('btn-primary')}>
                      VIEW PRODUCT <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* New Products */}
          <section className={cx('grey-section')}>
            <div className={cx('container')}>
              <SectionTitle>LATEST DROPS</SectionTitle>
              <NewProducts />
            </div>
          </section>

          {/* Scoreboard */}
          <section className={cx('scoreboard-section')}>
            <div className={cx('container')}>
              <div className={cx('scoreboard')}>
                {stats.map((stat) => (
                  <div className={cx('score-cell')} key={stat.label}>
                    <div className={cx('score-value')}>
                      <CountUp to={stat.value} decimals={stat.decimals} />
                      {stat.suffix && (
                        <span className={cx('score-suffix')}>
                          {stat.suffix}
                        </span>
                      )}
                    </div>
                    <div className={cx('score-label')}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className={cx('features-section')}>
            <div className={cx('container')}>
              <div className={cx('features-grid')}>
                {features.map((item, idx) => (
                  <motion.div
                    key={item.title}
                    className={cx('feature-slot')}
                    initial={{ opacity: 0, x: -80 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{
                      duration: 0.6,
                      delay: idx * 0.12,
                      ease: EASE_BURST,
                    }}
                  >
                    <div className={cx('feature-block')}>
                      <div className={cx('feature-inner')}>
                        <div className={cx('feature-icon-wrapper')}>
                          <FontAwesomeIcon icon={item.icon} />
                        </div>
                        <h3 className={cx('feature-title')}>{item.title}</h3>
                        <p className={cx('feature-desc')}>{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Trending */}
          <section className={cx('light-section')}>
            <div className={cx('container')}>
              <SectionTitle>TRENDING NOW</SectionTitle>
              <Trending />
            </div>
          </section>

          {/* CTA - vạch đích */}
          <section className={cx('cta-section')}>
            <div className={cx('container')}>
              <motion.div
                className={cx('cta-slot')}
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE_BURST }}
              >
                <div className={cx('cta-box')}>
                  <div className={cx('cta-inner')}>
                    <h2 className={cx('cta-title')}>READY TO BREAK RECORDS?</h2>
                    <p className={cx('cta-subtitle')}>
                      Gear up with the best. Don't settle for less.
                    </p>
                    <Link
                      to="/products"
                      className={cx('btn-primary', 'btn-large')}
                    >
                      SHOP ALL GEAR
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* FAQ */}
          <section className={cx('grey-section', 'section-flush')}>
            <div className={cx('container')}>
              <Question />
            </div>
          </section>

          {/* Latest News */}
          <section className={cx('light-section')}>
            <div className={cx('container')}>
              <SectionTitle>LATEST NEWS</SectionTitle>
              <Blogs />
            </div>
          </section>
        </main>
      </div>
    </MotionConfig>
  );
}

export default Home;
