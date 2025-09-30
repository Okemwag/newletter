import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Button } from '../Button/Button';
import './SubscriptionForm.css';

export function SubscriptionForm() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValid(validateEmail(value));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValid) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section className="subscription-form section" ref={sectionRef}>
      <div className="container">
        <div className="form-wrapper scroll-reveal">
          <div className="form-content">
            <h2 className="heading-lg">
              Ready to <span className="gradient-text">Get Started?</span>
            </h2>
            <p className="body-lg text-secondary">
              Join thousands of professionals receiving weekly insights. 
              No spam, unsubscribe anytime.
            </p>
            
            {!isSubmitted ? (
              <form className="subscription-form-element" onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="email"
                    className={`form-input ${email ? (isValid ? 'valid' : 'invalid') : ''}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                  <Button type="submit" variant="primary" size="lg">
                    Subscribe Now
                  </Button>
                </div>
                <div className="form-footer">
                  <div className="privacy-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Your privacy is protected</span>
                  </div>
                </div>
              </form>
            ) : (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3 className="heading-sm">Welcome aboard!</h3>
                <p className="body-md text-secondary">
                  Check your inbox for a confirmation email.
                </p>
              </div>
            )}
            
            <div className="form-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Weekly insights delivered</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Exclusive content access</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <div className="form-visual">
            <div className="visual-card card-1">
              <div className="card-header">
                <div className="card-dot"></div>
                <div className="card-dot"></div>
                <div className="card-dot"></div>
              </div>
              <div className="card-body">
                <div className="card-line"></div>
                <div className="card-line short"></div>
                <div className="card-line"></div>
              </div>
            </div>
            <div className="visual-card card-2">
              <div className="card-icon">📧</div>
              <div className="card-title">New Edition</div>
            </div>
            <div className="visual-sparkle sparkle-1">✨</div>
            <div className="visual-sparkle sparkle-2">✨</div>
            <div className="visual-sparkle sparkle-3">✨</div>
          </div>
        </div>
      </div>
    </section>
  );
}