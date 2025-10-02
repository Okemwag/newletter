import { Button } from '../Button/Button';

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden py-24">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-60 animate-float bg-[radial-gradient(circle,#8B5CF6_0%,transparent_70%)] -top-[10%] -left-[10%]"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-60 animate-float bg-[radial-gradient(circle,#3B82F6_0%,transparent_70%)] top-[20%] -right-[5%] [animation-delay:2s]"></div>
        <div className="absolute w-[450px] h-[450px] rounded-full blur-[100px] opacity-60 animate-float bg-[radial-gradient(circle,#EC4899_0%,transparent_70%)] -bottom-[10%] left-[30%] [animation-delay:4s]"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="max-w-[600px] opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_forwards]">
          <h1 className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.1] tracking-tight mb-8">
            Stay Ahead with <span className="gradient-text">Curated Insights</span>
          </h1>
          <p className="text-[clamp(1.125rem,1.5vw,1.25rem)] text-slate-300 leading-relaxed opacity-90 mb-12">
            Join 50,000+ professionals receiving weekly newsletters packed with industry trends, 
            expert analysis, and actionable strategies delivered straight to your inbox.
          </p>
          <div className="flex gap-6 flex-wrap mb-12">
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
          <div className="flex gap-12 pt-12 border-t border-violet-600/20">
            <div className="text-left">
              <div className="font-heading text-4xl font-bold gradient-text">50K+</div>
              <div className="text-sm text-slate-300 mt-2">Subscribers</div>
            </div>
            <div className="text-left">
              <div className="font-heading text-4xl font-bold gradient-text">98%</div>
              <div className="text-sm text-slate-300 mt-2">Open Rate</div>
            </div>
            <div className="text-left">
              <div className="font-heading text-4xl font-bold gradient-text">4.9/5</div>
              <div className="text-sm text-slate-300 mt-2">Rating</div>
            </div>
          </div>
        </div>
        
        <div className="relative h-[500px] animate-float">
          <div className="absolute top-[10%] left-[10%] bg-slate-800/60 backdrop-blur-xl border border-violet-600/20 rounded-2xl p-8 flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-2.5 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] animate-float">
            <div className="text-4xl">📧</div>
            <div className="font-heading font-semibold text-lg">Weekly Digest</div>
          </div>
          <div className="absolute top-[40%] right-[10%] bg-slate-800/60 backdrop-blur-xl border border-violet-600/20 rounded-2xl p-8 flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-2.5 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] [animation:float_7s_ease-in-out_infinite] [animation-delay:1s]">
            <div className="text-4xl">⚡</div>
            <div className="font-heading font-semibold text-lg">Breaking News</div>
          </div>
          <div className="absolute bottom-[15%] left-[20%] bg-slate-800/60 backdrop-blur-xl border border-violet-600/20 rounded-2xl p-8 flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-2.5 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] [animation:float_8s_ease-in-out_infinite] [animation-delay:2s]">
            <div className="text-4xl">✨</div>
            <div className="font-heading font-semibold text-lg">Expert Tips</div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-slate-300 text-sm z-10 hidden md:flex">
        <div className="w-0.5 h-10 bg-gradient-to-b from-violet-600 to-transparent animate-pulse"></div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}
