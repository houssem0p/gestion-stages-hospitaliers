import React from 'react';
import './ActorSection.css';

const ActorSection = ({ role, image, description, imagePosition }) => {
  return (
    <div className={`actor-section ${imagePosition}`}>
      <div className="actor-container">
        {imagePosition === 'left' && (
          <div className="actor-image">
            <img src={image} alt={role} />
          </div>
        )}
        
        <div className="actor-content">
          <h3 className="actor-role">{role}</h3>
          <ul className="actor-features">
            {description.map((item, index) => (
              <li key={index} className="feature-item">
                <span className="feature-icon">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {imagePosition === 'right' && (
          <div className="actor-image">
            <img src={image} alt={role} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActorSection;