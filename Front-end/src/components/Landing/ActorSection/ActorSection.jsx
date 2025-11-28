import React, { useRef, useEffect, useState } from 'react';
import styles from './ActorSection.module.css';

const ActorSection = ({ role, image, description, imagePosition }) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className={`${styles['actor-section']} ${styles[imagePosition] || imagePosition} ${isVisible ? styles.visible : ''}`}
    >
      <div className={styles['actor-container']}>
        {imagePosition === 'left' && (
          <div className={styles['actor-image']}>
            <img src={image} alt={role}/>
          </div>
        )}
        <div className={styles['actor-content']}>
          <h3 className={styles['actor-role']}>{role}</h3>
          <ul className={styles['actor-features']}>
            {description.map((item, index) => (
              <li key={index} className={styles['feature-item']}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {imagePosition === 'right' && (
          <div className={styles['actor-image']}>
            <img src={image} alt={role} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActorSection;