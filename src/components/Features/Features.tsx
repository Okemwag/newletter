import { useEffect, useRef } from 'react';
import './Features.css';

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast Delivery',
    description: 'Get the latest insights delivered to your inbox every week, right on schedule.',
    color: '#3B82F6'
  },
  {
    icon: '🎯',
    title: 'Curated Content',
    description: 'Hand-picked articles and resources from industry experts and thought leaders.',
    color: '#8B5CF6'
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    description: 'Your data is secure. We never share your information with third parties.',
    color: '#EC4899'
  },
  {
    icon: '📊',
    title: 'Data-Driven Insights',
    description: 'Make informed decisions with our comprehensive market analysis and trends.',
    color: '#10B981'
  },
  {
    icon: '🌐',
    title: 'Global Perspective',
    description: 'Stay connected with worldwide trends and international business developments.',
    color: '#F59E0B'
  },
  {
    icon: '💡',
    title: 'Actionable Tips',
    description: 'Practical strategies you can implement immediately to grow your business.',
    color: '#06B6D4'
  }
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="features section" ref={sectionRef}>
      <div className="container">
        <div className="features-header scroll-reveal">
          <h2 className="heading-lg">
            Everything You Need to <span className="gradient-text">Stay Informed</span>
          </h2>
          <p className="body-lg text-secondary">
            Powerful features designed to keep you ahead of the curve
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon-wrapper" style={{ background: `${feature.color}20` }}>
                <span className="feature-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </span>
              </div>
              <h3 className="heading-sm">{feature.title}</h3>
              <p className="body-md text-secondary">{feature.description}</p>
              <div className="feature-glow" style={{ background: `radial-gradient(circle, ${feature.color}40 0%, transparent 70%)` }}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}