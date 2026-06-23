import React from 'react';
import { Send, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card text-white border-t border-white/5 relative z-10 select-none">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-2xl font-bold tracking-wider font-heading">
              <span className="text-accent drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">⚡</span>
              <span className="gradient-text">EKART</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 font-light">
              Powering your universe with the finest premium electronics, spatial audio gear, and cyberdecks.
            </p>
            <div className="space-y-2.5 text-xs text-gray-400 font-mono">
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 text-accent" />
                123 Cyberpunk Ave, Neo-Tokyo, JP 10001
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-3.5 text-secondary" />
                support@ekart.tech
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-3.5 text-accent" />
                +1 (800) 555-0199
              </p>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold mb-5 uppercase tracking-widest text-xs font-heading">Customer Service</h3>
            <ul className="space-y-3.5 text-sm text-gray-400 font-light">
              <li className="hover:text-accent cursor-pointer transition-colors duration-200">Contact Suite</li>
              <li className="hover:text-accent cursor-pointer transition-colors duration-200">Global Shipping</li>
              <li className="hover:text-accent cursor-pointer transition-colors duration-200">Hassle-Free Returns</li>
              <li className="hover:text-accent cursor-pointer transition-colors duration-200">Order Tracker</li>
              <li className="hover:text-accent cursor-pointer transition-colors duration-200">User FAQs</li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-white font-bold mb-5 uppercase tracking-widest text-xs font-heading">Follow Us</h3>
            <div className="flex items-center gap-3">
              <a 
                href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background border border-white/10 text-white hover:border-accent hover:text-accent hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300 cursor-pointer"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background border border-white/10 text-white hover:border-accent hover:text-accent hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300 cursor-pointer"
              >
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a 
                href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background border border-white/10 text-white hover:border-accent hover:text-accent hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300 cursor-pointer"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background border border-white/10 text-white hover:border-accent hover:text-accent hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300 cursor-pointer"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-5 font-light">
              Join our server community to receive real-time build updates.
            </p>
          </div>

          {/* Subscription */}
          <div>
            <h3 className="text-white font-bold mb-5 uppercase tracking-widest text-xs font-heading">Stay in the Loop</h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed font-light">
              Subscribe to obtain limited edition product drop alerts and coupon codes.
            </p>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your cyber-email address"
                  className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <button className="rounded-xl px-5 py-3 text-sm font-extrabold bg-accent hover:bg-accent-hover text-background flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 glow-accent hover:scale-[1.02]">
                <Send className="size-4" /> Subscribe Suite
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/5 pt-6 text-center text-xs text-gray-500 font-mono">
          © 2026 EKART Suite. All rights reserved. Custom-made for Next-Gen Tech.
        </div>
      </div>
    </footer>
  );
};

export default Footer;