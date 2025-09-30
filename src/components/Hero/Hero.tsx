import { Button } from '../Button/Button';
import './Hero.css';

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <div className="hero-content container">
        <div className="hero-text animate-fade-in-up">
          <h1 className="heading-xl">
            Stay Ahead with <span className="gradient-text">Curated Insights</span>
          </h1>
          <p className="body-lg text-secondary hero-description">
            Join 50,000+ professionals receiving weekly newsletters packed with industry trends, 
            expert analysis, and actionable strategies delivered straight to your inbox.
          </p>
          <div className="hero-cta">
            <Button variant="primary" size="lg">
              Get Started Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Button>
            <Button variant="ghost" size="lg">
              View Sample
            </Button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Subscribers</div>
            </div>
            <div className="stat">
              <div className="stat-number">98%</div>
              <div className="stat-label">Open Rate</div>
            </div>
            <div className="stat">
              <div className="stat-number">4.9/5</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>
        </div>
        
        <div className="hero-visual animate-float">
          <div className="floating-card card-1">
            <div className="card-icon">📧</div>
            <div className="card-text">Weekly Digest</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">⚡</div>
            <div className="card-text">Breaking News</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">✨</div>
            <div className="card-text">Expert Tips</div>
          </div>
        </div>
      </div>
      
      <div className="hero-scroll-indicator">
        <div className="scroll-line"></div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}