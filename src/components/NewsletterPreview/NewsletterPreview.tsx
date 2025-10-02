import { useEffect, useRef } from 'react';

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
    <section className="py-24 bg-slate-900 relative overflow-hidden" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="scroll-reveal">
            <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight tracking-tight mb-6">
              Experience the <span className="gradient-text">Quality</span>
            </h2>
            <p className="text-[clamp(1.125rem,1.5vw,1.25rem)] text-slate-300 mb-12">
              See what makes our newsletter stand out. Each edition is carefully crafted 
              with engaging content, beautiful design, and valuable insights.
            </p>
            
            <div className="flex flex-col gap-8">
              <div className="flex gap-6 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-heading text-[clamp(1.25rem,2vw,1.75rem)] font-semibold mb-2">Expert Analysis</h4>
                  <p className="text-sm text-slate-300">In-depth breakdowns from industry leaders</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-heading text-[clamp(1.25rem,2vw,1.75rem)] font-semibold mb-2">Trending Topics</h4>
                  <p className="text-sm text-slate-300">Stay updated with what matters most</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-heading text-[clamp(1.25rem,2vw,1.75rem)] font-semibold mb-2">Actionable Takeaways</h4>
                  <p className="text-sm text-slate-300">Practical tips you can use immediately</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative scroll-reveal">
            <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] transform perspective-1000 -rotate-y-5 transition-transform duration-500 hover:rotate-y-0">
              <div className="relative bg-slate-800 rounded-2xl overflow-hidden aspect-[16/10]">
                <img 
                  src="https://images.unsplash.com/photo-1550622824-c11e494a4b65?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBuZXdzbGV0dGVyJTIwd29ya3NwYWNlJTIwdGVjaG5vbG9neXxlbnwwfDB8fHwxNzU5MjcwODM5fDA&ixlib=rb-4.1.0&q=85"
                  alt="Newsletter preview on laptop"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-600/90 to-blue-600/90 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100">
                  <div className="p-12 text-white max-w-[80%]">
                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/20">
                      <h3 className="font-heading text-2xl font-bold">Weekly Insights</h3>
                      <span className="text-sm opacity-80">Jan 15, 2025</span>
                    </div>
                    <div className="mb-6">
                      <h4 className="font-heading text-lg font-semibold mb-2">The Future of Digital Marketing</h4>
                      <p className="text-sm opacity-90">Discover the latest trends shaping the industry...</p>
                    </div>
                    <div>
                      <h4 className="font-heading text-lg font-semibold mb-2">AI Tools That Save Time</h4>
                      <p className="text-sm opacity-90">Boost your productivity with these cutting-edge solutions...</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(139,92,246,0.3)_0%,transparent_70%)] pointer-events-none animate-rotate"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
