import { useEffect, useRef, useState } from 'react';
import './SocialProof.css';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    text: 'This newsletter has completely transformed how I stay updated with industry trends. The insights are invaluable!'
  },
  {
    name: 'Michael Chen',
    role: 'Startup Founder',
    avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
    text: 'Every edition is packed with actionable advice. It\'s become an essential part of my weekly routine.'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Product Manager',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    text: 'The quality of content is outstanding. I\'ve implemented several strategies that significantly improved our metrics.'
  },
  {
    name: 'David Park',
    role: 'Tech Lead',
    avatar: 'https://i.pravatar.cc/150?img=4',
    rating: 5,
    text: 'Concise, relevant, and always on point. This is the only newsletter I actually read cover to cover.'
  }
];

export function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const [count, setCount] = useState(0);
  const targetCount = 50000;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            
            // Animate counter
            if (entry.target.classList.contains('counter-section')) {
              let start = 0;
              const duration = 2000;
              const increment = targetCount / (duration / 16);
              
              const timer = setInterval(() => {
                start += increment;
                if (start >= targetCount) {
                  setCount(targetCount);
                  clearInterval(timer);
                } else {
                  setCount(Math.floor(start));
                }
              }, 16);
            }
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
    <section className="social-proof section" ref={sectionRef}>
      <div className="container">
        <div className="social-proof-header scroll-reveal">
          <h2 className="heading-lg">
            Trusted by <span className="gradient-text">Thousands</span>
          </h2>
          <p className="body-lg text-secondary">
            Join a community of professionals who rely on our insights
          </p>
        </div>
        
        <div className="counter-section scroll-reveal">
          <div className="counter-card">
            <div className="counter-number">{count.toLocaleString()}+</div>
            <div className="counter-label">Active Subscribers</div>
            <div className="counter-subtext">Growing every day</div>
          </div>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="testimonial-card scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="testimonial-rating">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
              <p className="testimonial-text body-md">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="author-avatar"
                  style={{ width: '48px', height: '48px' }}
                />
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role text-secondary">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}