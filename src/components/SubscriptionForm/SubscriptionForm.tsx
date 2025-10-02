import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Button } from '../Button/Button';

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
    <section className="py-24 bg-slate-900 relative overflow-hidden" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-violet-600/20 rounded-3xl p-24 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative overflow-hidden scroll-reveal">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600 opacity-5 pointer-events-none"></div>
          
          <div>
            <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight tracking-tight mb-6">
              Ready to <span className="gradient-text">Get Started?</span>
            </h2>
            <p className="text-[clamp(1.125rem,1.5vw,1.25rem)] text-slate-300 mb-12">
              Join thousands of professionals receiving weekly insights. 
              No spam, unsubscribe anytime.
            </p>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="mb-12">
                <div className="flex gap-6 mb-6">
                  <input
                    type="email"
                    className={`flex-1 px-6 py-4 bg-slate-900/60 border-2 ${
                      email ? (isValid ? 'border-green-500' : 'border-red-500') : 'border-violet-600/20'
                    } rounded-xl text-slate-50 font-base transition-all focus:outline-none focus:border-violet-600 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                  <Button type="submit" variant="primary" size="lg">
                    Subscribe Now
                  </Button>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Your privacy is protected</span>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 animate-[fadeIn_0.5s_ease]">✓</div>
                <h3 className="font-heading text-[clamp(1.25rem,2vw,1.75rem)] font-semibold mb-4">Welcome aboard!</h3>
                <p className="text-base text-slate-300">
                  Check your inbox for a confirmation email.
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-4 pt-8 border-t border-violet-600/20">
              <div className="flex items-center gap-4 text-slate-300 text-sm">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                <span>Weekly insights delivered</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300 text-sm">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                <span>Exclusive content access</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300 text-sm">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <div className="relative h-[400px] hidden lg:block">
            <div className="absolute w-[280px] top-[10%] left-[10%] bg-slate-800/80 backdrop-blur-xl border border-violet-600/20 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-float">
              <div className="flex gap-1.5 mb-6">
                <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                <div className="w-2 h-2 rounded-full bg-violet-600"></div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="h-2 bg-violet-600/20 rounded"></div>
                <div className="h-2 bg-violet-600/20 rounded w-3/5"></div>
                <div className="h-2 bg-violet-600/20 rounded"></div>
              </div>
            </div>
            <div className="absolute w-[180px] bottom-[15%] right-[10%] bg-slate-800/80 backdrop-blur-xl border border-violet-600/20 rounded-2xl p-8 flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] [animation:float_7s_ease-in-out_infinite] [animation-delay:1s]">
              <div className="text-4xl">📧</div>
              <div className="font-heading font-semibold text-lg">New Edition</div>
            </div>
            <div className="absolute text-2xl opacity-60 top-[20%] right-[20%] animate-float">✨</div>
            <div className="absolute text-2xl opacity-60 bottom-[30%] left-[15%] [animation:float_4s_ease-in-out_infinite] [animation-delay:1.5s]">✨</div>
            <div className="absolute text-2xl opacity-60 top-1/2 right-[5%] [animation:float_4s_ease-in-out_infinite] [animation-delay:3s]">✨</div>
          </div>
        </div>
      </div>
    </section>
  );
}
