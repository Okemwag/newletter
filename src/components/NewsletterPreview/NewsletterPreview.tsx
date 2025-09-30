import { useEffect, useRef } from 'react';
import './NewsletterPreview.css';

export function NewsletterPreview() {
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
    <section className="newsletter-preview section" ref={sectionRef}>
      <div className="container">
        <div className="preview-content">
          <div className="preview-text scroll-reveal">
            <h2 className="heading-lg">
              Experience the <span className="gradient-text">Quality</span>
            </h2>
            <p className="body-lg text-secondary">
              See what makes our newsletter stand out. Each edition is carefully crafted 
              with engaging content, beautiful design, and valuable insights.
            </p>
            
            <div className="preview-features">
              <div className="preview-feature">
                <div className="check-icon">✓</div>
                <div>
                  <h4 className="heading-sm">Expert Analysis</h4>
                  <p className="body-sm text-secondary">In-depth breakdowns from industry leaders</p>
                </div>
              </div>
              <div className="preview-feature">
                <div className="check-icon">✓</div>
                <div>
                  <h4 className="heading-sm">Trending Topics</h4>
                  <p className="body-sm text-secondary">Stay updated with what matters most</p>
                </div>
              </div>
              <div className="preview-feature">
                <div className="check-icon">✓</div>
                <div>
                  <h4 className="heading-sm">Actionable Takeaways</h4>
                  <p className="body-sm text-secondary">Practical tips you can use immediately</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="preview-mockup scroll-reveal">
            <div className="mockup-device">
              <div className="mockup-screen">
                <img 
                  src="https://images.unsplash.com/photo-1550622824-c11e494a4b65?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBuZXdzbGV0dGVyJTIwd29ya3NwYWNlJTIwdGVjaG5vbG9neXxlbnwwfDB8fHwxNzU5MjcwODM5fDA&ixlib=rb-4.1.0&q=85"
                  alt="Newsletter preview on laptop - Mel Poole on Unsplash"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="mockup-overlay">
                  <div className="newsletter-content">
                    <div className="newsletter-header">
                      <h3>Weekly Insights</h3>
                      <span className="newsletter-date">Jan 15, 2025</span>
                    </div>
                    <div className="newsletter-article">
                      <h4>The Future of Digital Marketing</h4>
                      <p>Discover the latest trends shaping the industry...</p>
                    </div>
                    <div className="newsletter-article">
                      <h4>AI Tools That Save Time</h4>
                      <p>Boost your productivity with these cutting-edge solutions...</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mockup-glow"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}