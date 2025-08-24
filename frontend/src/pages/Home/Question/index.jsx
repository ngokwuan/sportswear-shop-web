import { useState } from 'react';

import classNames from 'classnames/bind';
import styles from './Question.module.scss';

const cx = classNames.bind(styles);
const faqs = [
  {
    number: '01',
    question: 'How do I determine the right size for my sportswear?',
    answer:
      'We provide a detailed size guide on each product page to help you find the perfect fit. You can refer to the measurements and follow our ideal sizing recommendations. If you have any specific questions about sizing, feel free to reach out to our customer support team for assistance.',
  },
  {
    number: '02',
    question: 'How long does shipping for my order take?',
    answer:
      'Standard shipping usually takes 5–7 business days, while express options are available at checkout.',
  },
  {
    number: '03',
    question: 'Do you offer international shipping to my country?',
    answer:
      'Yes, we ship worldwide! Shipping times may vary depending on your region.',
  },
];

export default function Question() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className={cx('faq-section')}>
      <div className={cx('container')}>
        <div className={cx('faq-content')}>
          <h2 className={cx('section-title')}>Questions</h2>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cx('faq-item', { active: activeIndex === index })}
              onClick={() => toggleFAQ(index)}
            >
              <div className={cx('faq-number')}>{faq.number}</div>
              <div className={cx('faq-text')}>
                <h3 className={cx('faq-question')}>{faq.question}</h3>
                {activeIndex === index && (
                  <p className={cx('faq-answer')}>{faq.answer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
