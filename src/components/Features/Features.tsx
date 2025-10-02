import { useEffect, useRef } from 'react';

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
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-24 scroll-reveal">
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight tracking-tight mb-6">
            Everything You Need to <span className="gradient-text">Stay Informed</span>
          </h2>
          <p className="text-[clamp(1.125rem,1.5vw,1.25rem)] text-slate-300">
            Powerful features designed to keep you ahead of the curve
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/40 backdrop-blur-xl border border-violet-600/20 rounded-2xl p-12 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-violet-600 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] scroll-reveal lg:first:col-span-2 lg:[&:nth-child(4)]:col-span-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                style={{ background: `${feature.color}20` }}
              >
                <span className="text-4xl" style={{ color: feature.color }}>
                  {feature.icon}
                </span>
              </div>
              <h3 className="font-heading text-[clamp(1.25rem,2vw,1.75rem)] font-semibold mb-4">{feature.title}</h3>
              <p className="text-base text-slate-300 leading-relaxed">{feature.description}</p>
              <div
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-0 transition-opacity duration-500 pointer-events-none hover:opacity-30"
                style={{ background: `radial-gradient(circle, ${feature.color}40 0%, transparent 70%)` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
