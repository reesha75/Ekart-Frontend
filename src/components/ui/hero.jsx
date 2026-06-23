import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

const slides = [
  {
    badge: "Next-Gen Gaming",
    title: "Quantum Pro Laptop",
    subtitle: "Absolute Power. Infinite Display.",
    description: "Equipped with the latest RTX 50-Series graphics and AMD Ryzen 9 processor. Unleash the ultimate performance in a sleek cybernetic chassis.",
    cta: "Shop Now",
    link: "/products",
    bgGradient: "from-[#7C3AED]/20 via-[#050816] to-[#050816]",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000&auto=format&fit=crop",
    accentColor: "#7C3AED",
  },
  {
    badge: "Mobile Innovation",
    title: "Nexus 15 Pro",
    subtitle: "Capture the Cosmos.",
    description: "Featuring a 200MP holographic camera, under-display sensor array, and a stunning 144Hz OLED screen. Experience the smartphone of the future.",
    cta: "Pre-Order",
    link: "/products",
    bgGradient: "from-[#00E5FF]/20 via-[#050816] to-[#050816]",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000&auto=format&fit=crop",
    accentColor: "#00E5FF",
  },
  {
    badge: "Futuristic Wearables",
    title: "Nova Watch Ultra",
    subtitle: "Biometrics in Real-Time.",
    description: "Holographic interface, 15-day quantum battery life, and complete health telemetry monitoring. The ultimate companion for your digital lifestyle.",
    cta: "Explore Tech",
    link: "/products",
    bgGradient: "from-[#7C3AED]/15 via-[#050816] to-[#050816]",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1000&auto=format&fit=crop",
    accentColor: "#7C3AED",
  },
  {
    badge: "Immersive Audio",
    title: "Cyber Audio Pulse",
    subtitle: "Active Holographic Noise Cancelling.",
    description: "Pure sonic precision. High-resolution spatial sound with custom-tuned dynamic drivers and customizable RGB pulse glow sync.",
    cta: "Shop Audio",
    link: "/products",
    bgGradient: "from-[#00E5FF]/25 via-[#050816] to-[#050816]",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop",
    accentColor: "#00E5FF",
  },
  {
    badge: "Cyber Deck Setup",
    title: "Vortex Key Mech",
    subtitle: "Tactile Speed. Infinite Control.",
    description: "Ultra-responsive optical-magnetic switches with modular design and vibrant underglow. Optimize your typing and gaming response times.",
    cta: "Gear Up",
    link: "/products",
    bgGradient: "from-[#7C3AED]/20 via-[#050816] to-[#050816]",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop",
    accentColor: "#7C3AED",
  }
];

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <section className="relative pt-24 min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#050816]">
      {/* Background Glows */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].bgGradient} transition-all duration-1000 ease-out`} />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      {/* Main Content Area */}
      <div className="relative w-full max-w-7xl mx-auto px-6 py-12 z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[60vh]">
          
          {/* Text Content */}
          <div className="flex-1 text-left select-none animate-slide-up">
            <span className="inline-flex items-center gap-2 bg-[#111827]/80 text-accent px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-accent/20 shadow-md">
              <Sparkles className="size-3.5" />
              {slides[current].badge}
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white leading-tight">
              {slides[current].title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="gradient-text">
                {slides[current].title.split(" ").pop()}
              </span>
            </h1>

            <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-white/90">
              {slides[current].subtitle}
            </h2>

            <p className="mt-4 text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed">
              {slides[current].description}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link to={slides[current].link}>
                <button className="relative inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-background font-bold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 glow-accent cursor-pointer group">
                  {slides[current].cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <Link to="/products">
                <button className="border-2 border-white/10 hover:border-accent text-white hover:text-accent bg-transparent px-8 py-3 rounded-full font-bold transition-all duration-300 cursor-pointer">
                  Explore Store
                </button>
              </Link>
            </div>

            {/* Quick Stats Panel */}
            <div className="flex gap-10 mt-12 border-t border-white/5 pt-8 max-w-lg">
              <div>
                <h3 className="text-3xl font-extrabold text-white font-heading">
                  15K+
                </h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Direct Orders</p>
              </div>

              <div>
                <h3 className="text-3xl font-extrabold text-white font-heading">
                  100%
                </h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Authentic Tech</p>
              </div>

              <div>
                <h3 className="text-3xl font-extrabold text-white font-heading">
                  24h
                </h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Global Delivery</p>
              </div>
            </div>
          </div>

          {/* Slider Image Box */}
          <div className="flex-1 flex justify-center items-center relative w-full">
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full blur-3xl opacity-30 transition-all duration-1000"
                style={{ backgroundColor: slides[current].accentColor }}
              />
              
              <div className="relative w-[85%] h-[85%] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#111827]/40 backdrop-blur-md group hover:border-accent/40 transition-all duration-300">
                <img
                  src={slides[current].image}
                  alt={slides[current].title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                
                {/* Visual Accent Ring overlay */}
                <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-accent/20 rounded-3xl transition-all duration-300" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Controls */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-[#111827]/60 hover:bg-accent hover:text-background text-white rounded-full border border-white/10 hover:border-accent shadow-md transition-all duration-200 z-20 cursor-pointer hidden md:flex items-center justify-center"
      >
        <ChevronLeft className="size-6" />
      </button>

      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-[#111827]/60 hover:bg-accent hover:text-background text-white rounded-full border border-white/10 hover:border-accent shadow-md transition-all duration-200 z-20 cursor-pointer hidden md:flex items-center justify-center"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 flex gap-2.5 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              current === index ? "w-8 bg-accent glow-accent" : "w-2.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;