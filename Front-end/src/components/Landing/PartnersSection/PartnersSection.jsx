import React, { useRef, useEffect, useState } from 'react';
import styles from './PartnersSection.module.css';

const PartnersSection = ({ partners }) => {
    // Duplicating partners for the infinite scroll effect
    const primaryPartners = partners.concat(partners);
    
    const trackRef = useRef(null);
    const logoRefs = useRef([]);
    // State to track the current scroll position
    const [scrollPosition, setScrollPosition] = useState(0); 

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !trackRef.current) return;

        let animationFrameId;
        const speed = 1.5; // Adjust scroll speed here (e.g., 0.5px per frame)

        // Calculate the total scrollable width (the width of the original, non-duplicated partners)
        // This is the distance the track must travel before resetting.
        const totalScrollWidth = trackRef.current.scrollWidth / 2;
        let currentScroll = 0;

        const updateLogoStyles = () => {
            const trackElement = trackRef.current;
            if (!trackElement) return;

            // --- 1. HANDLE INFINITE SCROLL MOVEMENT (NEW LOGIC) ---
            currentScroll += speed;
            if (currentScroll >= totalScrollWidth) {
                // Reset scroll position to create the seamless loop
                currentScroll = 0; 
            }
            trackElement.style.transform = `translateX(-${currentScroll}px)`;


            // --- 2. HANDLE DYNAMIC LOGO EFFECTS (EXISTING LOGIC) ---
            const viewportCenter = window.innerWidth / 2;
            const maxDistance = window.innerWidth / 2.5; 
            
            const opacityDelayThreshold = 0.9; 
            const blurDelayThreshold = 0.9;    
            
            logoRefs.current.forEach(logo => {
                if (!logo) return;

                const rect = logo.getBoundingClientRect();
                const logoCenter = rect.left + rect.width / 2;
                
                const distance = Math.abs(logoCenter - viewportCenter);
                const normalizedDistance = Math.min(1, distance / maxDistance);

                // SCALE CALCULATION
                const maxScale = 1.25;
                const minScale = 0.7;
                const scaleFactor = maxScale - (maxScale - minScale) * Math.pow(normalizedDistance, 1.2); 

                // OPACITY CALCULATION
                const maxOpacity = 1.0;
                const minOpacity = 0.4;
                const delayedOpacityDistance = Math.max(0, normalizedDistance - opacityDelayThreshold);
                const opacityFactor = maxOpacity - (maxOpacity - minOpacity) * (delayedOpacityDistance / (1 - opacityDelayThreshold));
                
                // BLUR CALCULATION
                const maxBlur = 3; 
                const delayedBlurDistance = Math.max(0, normalizedDistance - blurDelayThreshold);
                const blurValue = (maxBlur * (delayedBlurDistance / (1 - blurDelayThreshold))).toFixed(2);
                
                // Apply Styles
                // NOTE: We combine the scale effect with the ongoing transform for movement
                logo.style.transform = `scale(${scaleFactor})`;
                logo.style.opacity = opacityFactor.toFixed(2);
                logo.style.filter = `blur(${blurValue}px)`;
            });

            animationFrameId = requestAnimationFrame(updateLogoStyles);
        };

        // Start the loop
        updateLogoStyles();

        // Cleanup function
        return () => cancelAnimationFrame(animationFrameId);
    }, [isMounted]); 

    return (
        <section className={styles['partners-section']} id="partners">
            <div className={styles['partners-container']}>
                <div className={styles['partners-header']}>
                    <h2 className={styles['partners-title']}>Nos <span>Partenaires</span> de Confiance</h2>
                    <p className={styles['partners-subtitle']}>
                        Collaborons avec les meilleurs établissements de santé pour offrir 
                        des stages de qualité à nos étudiants. Ensemble, nous bâtissons l'avenir.
                    </p>
                </div>

                <div className={styles['partners-scroll-mask']}>
                    <div className={styles['partners-scroll-container']}>
                        <div className={styles['partners-scroll']}>
                            
                            <div className={styles['partners-track']} ref={trackRef}>
                                {primaryPartners.map((partner, index) => (
                                    <div 
                                        key={`primary-${index}`} 
                                        className={styles['partner-logo']}
                                        ref={el => logoRefs.current[index] = el}
                                    >
                                        <img src={partner} alt={`Partner ${index + 1}`} />
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>


    );
};

export default PartnersSection;