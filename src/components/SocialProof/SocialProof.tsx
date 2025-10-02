import { useEffect, useRef, useState } from 'react';

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
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-24 scroll-reveal">
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight tracking-tight mb-6">
            Trusted by <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-[clamp(1.125rem,1.5vw,1.25rem)] text-slate-300">
            Join a community of professionals who rely on our insights
          </p>
        </div>
        
        <div className="flex justify-center mb-24 counter-section scroll-reveal">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-violet-600/20 rounded-3xl px-24 py-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600 opacity-10 animate-gradient-shift"></div>
            <div className="font-heading text-[clamp(3rem,6vw,5rem)] font-bold gradient-text leading-none mb-4">{count.toLocaleString()}+</div>
            <div className="font-heading text-xl font-semibold mb-2">Active Subscribers</div>
            <div className="text-slate-300 text-sm">Growing every day</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-slate-800/40 backdrop-blur-xl border border-violet-600/20 rounded-2xl p-12 transition-all duration-300 hover:-translate-y-2 hover:border-violet-600 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] flex flex-col gap-6 scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-amber-500 text-xl">★</span>
                ))}
              </div>
              <p className="text-base leading-relaxed italic flex-1">"{testimonial.text}"</p>
              <div className="flex gap-6 items-center pt-6 border-t border-violet-600/20">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full border-2 border-violet-600"
                />
                <div>
                  <div className="font-heading font-semibold text-base">{testimonial.name}</div>
                  <div className="text-slate-300 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
