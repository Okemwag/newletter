export function Footer() {
  return (
    <footer className="bg-slate-800 py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600"></div>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-24 mb-24 pb-24 border-b border-violet-600/20">
          <div className="max-w-md">
            <h3 className="font-heading text-2xl font-bold gradient-text mb-4">Newsletter</h3>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Curated insights for modern professionals
            </p>
            <div className="flex gap-6">
              <a href="#" className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-600/20 flex items-center justify-center text-slate-300 transition-all duration-300 hover:bg-violet-600 hover:text-white hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(139,92,246,0.4)]" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-600/20 flex items-center justify-center text-slate-300 transition-all duration-300 hover:bg-violet-600 hover:text-white hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(139,92,246,0.4)]" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-600/20 flex items-center justify-center text-slate-300 transition-all duration-300 hover:bg-violet-600 hover:text-white hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(139,92,246,0.4)]" aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col">
              <h4 className="font-heading text-base font-semibold mb-6 text-slate-50">Product</h4>
              <ul className="flex flex-col gap-4 list-none">
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">Features</a></li>
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">Pricing</a></li>
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">Archive</a></li>
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">API</a></li>
              </ul>
            </div>
            
            <div className="flex flex-col">
              <h4 className="font-heading text-base font-semibold mb-6 text-slate-50">Company</h4>
              <ul className="flex flex-col gap-4 list-none">
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">About</a></li>
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">Blog</a></li>
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">Careers</a></li>
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">Contact</a></li>
              </ul>
            </div>
            
            <div className="flex flex-col">
              <h4 className="font-heading text-base font-semibold mb-6 text-slate-50">Legal</h4>
              <ul className="flex flex-col gap-4 list-none">
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">Privacy</a></li>
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">Terms</a></li>
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">Security</a></li>
                <li><a href="#" className="text-slate-300 text-sm transition-colors duration-200 hover:text-violet-600">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center flex-wrap gap-6">
          <p className="text-slate-300 text-sm">
            © 2025 Newsletter. All rights reserved.
          </p>
          <p className="text-slate-300 text-sm">
            Made with <span className="text-red-500 animate-pulse">♥</span> for professionals
          </p>
        </div>
      </div>
    </footer>
  );
}
