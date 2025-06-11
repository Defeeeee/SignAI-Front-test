import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Play, 
  Pause, 
  Upload, 
  Camera, 
  Zap, 
  Globe, 
  Shield, 
  Users, 
  ArrowRight,
  CheckCircle,
  Star,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import Analytics from './components/Analytics';
import AccessibilityControls from './components/AccessibilityControls';

// Lazy load modal components for better performance
const VideoUpload = lazy(() => import('./components/VideoUpload'));
const CameraCapture = lazy(() => import('./components/CameraCapture'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white rounded-full p-4 shadow-xl">
      <Loader2 className="w-8 h-8 text-[#FF7A00] animate-spin" />
    </div>
  </div>
);

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.fade-in');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('opacity-100');
          element.classList.remove('opacity-0');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Translation",
      description: "Instant sign language to text conversion with AI-powered accuracy"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Universal Access",
      description: "Breaking down communication barriers for the deaf and hard of hearing community"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy First",
      description: "Your data stays secure with end-to-end encryption and local processing"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Driven",
      description: "Built with input from the deaf community to ensure authentic representation"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "ASL Interpreter",
      content: "SignAI has revolutionized how I work with clients. The accuracy is incredible and it's completely free!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Deaf Community Advocate",
      content: "Finally, a tool that understands the nuances of sign language. This is a game-changer for accessibility.",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "Linguistics Professor",
      content: "The AI technology behind SignAI is impressive. It's setting new standards for sign language recognition.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Analytics - Uncomment and add your analytics IDs to enable tracking */}
      {/* 
      <Analytics 
        measurementId="G-XXXXXXXXXX"  // Google Analytics
        // plausibleDomain="signai.app"  // Plausible Analytics
        // matomoUrl="https://analytics.example.com"  // Matomo Analytics
        // matomoSiteId="1"  // Matomo Analytics
      />
      */}

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/LOGO NUEVO.png" alt="SignAI" className="h-8 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-[#FF7A00] transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-[#FF7A00] transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-[#FF7A00] transition-colors">Testimonials</a>
              <a href="#about" className="text-gray-700 hover:text-[#FF7A00] transition-colors">About</a>
              <button 
                onClick={() => setShowCameraCapture(true)}
                className="bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Try Now
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-[#FF7A00] transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-[#FF7A00] transition-colors">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-700 hover:text-[#FF7A00] transition-colors">How it Works</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:text-[#FF7A00] transition-colors">Testimonials</a>
              <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-[#FF7A00] transition-colors">About</a>
              <button 
                onClick={() => {
                  setShowCameraCapture(true);
                  setIsMenuOpen(false);
                }}
                className="w-full mt-2 bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white px-6 py-2 rounded-full"
              >
                Try Now
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Sign Language
                  <span className="block bg-gradient-to-r from-[#FF7A00] to-[#A100FF] bg-clip-text text-transparent">
                    Translate at Will
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Your free to use sign language translator. Powered by AI.
                </p>
                <p className="text-lg text-gray-500">
                  Break down communication barriers with real-time sign language to text translation. 
                  Accessible, accurate, and completely free.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowCameraCapture(true)}
                  className="bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Translating</span>
                </button>
                <button 
                  onClick={() => setShowVideoUpload(true)}
                  className="border-2 border-[#FF7A00] text-[#FF7A00] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#FF7A00] hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Video</span>
                </button>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-y-4 gap-x-10 justify-center sm:justify-start">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 text-sm">100% Free</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 text-sm">No Sign-up Required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 text-sm">Privacy Protected</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-[#FF7A00]/10 to-[#A100FF]/10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/20 to-[#A100FF]/20"></div>
                  <button
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    className="relative z-10 bg-white/90 backdrop-blur-sm rounded-full p-6 hover:bg-white transition-all duration-200 transform hover:scale-110"
                  >
                    {isVideoPlaying ? (
                      <Pause className="w-8 h-8 text-[#FF7A00]" />
                    ) : (
                      <Play className="w-8 h-8 text-[#FF7A00] ml-1" />
                    )}
                  </button>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">
                        "Hello, how are you today?"
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Translated from ASL in real-time
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white p-3 rounded-full shadow-lg">
                <Zap className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white shadow-lg rounded-full p-3">
                <Globe className="w-6 h-6 text-[#A100FF]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in opacity-0 transition-opacity duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our cutting-edge technology makes sign language translation accessible to everyone, 
              breaking down communication barriers with unprecedented accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="fade-in opacity-0 transition-all duration-1000 group hover:transform hover:scale-105"
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 hover:border-[#FF7A00]/30 hover:shadow-xl transition-all duration-300">
                  <div className="bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white p-3 rounded-xl w-fit mb-6 group-hover:shadow-lg transition-shadow duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in opacity-0 transition-opacity duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple. Fast. Accurate.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with SignAI in three easy steps. No downloads, no sign-ups, no hassle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Capture or Upload",
                description: "Use your camera for real-time translation or upload a video file",
                icon: <Camera className="w-8 h-8" />
              },
              {
                step: "02",
                title: "AI Processing",
                description: "Our advanced AI analyzes the sign language with 99% accuracy",
                icon: <Zap className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Instant Translation",
                description: "Receive real-time text translation in your preferred language",
                icon: <Globe className="w-8 h-8" />
              }
            ].map((item, index) => (
              <div
                key={index}
                className="fade-in opacity-0 transition-all duration-1000 text-center group relative"
                style={{ transitionDelay: `${index * 300}ms` }}
              >
                <div className="relative mb-8">
                  <div className="bg-gradient-to-r from-[#FF7A00] to-[#A100FF] text-white p-6 rounded-2xl w-fit mx-auto group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white text-[#FF7A00] font-bold text-sm px-3 py-1 rounded-full border-2 border-[#FF7A00]">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-[#FF7A00]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in opacity-0 transition-opacity duration-1000">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by the Community
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what users are saying about SignAI and how it's making a difference in their daily lives.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="fade-in opacity-0 transition-all duration-1000 group"
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 hover:border-[#FF7A00]/30 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#FF7A00] to-[#A100FF]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Break Down Barriers?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join thousands of users who are already using SignAI to communicate more effectively. 
            Start translating sign language today – it's completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowCameraCapture(true)}
              className="bg-white text-[#FF7A00] px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Start Translating Now</span>
            </button>
            <button 
              onClick={() => setShowVideoUpload(true)}
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-[#FF7A00] transition-all duration-200"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/LOGO NUEVO.png" alt="SignAI" className="h-8 w-auto" />
                <span className="text-2xl font-bold">SignAI</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Your free to use sign language translator. Powered by AI. 
                Breaking down communication barriers for a more inclusive world.
              </p>
              <p className="text-sm text-gray-500">
                © 2025 SignAI. All rights reserved. Made with ❤️ for the deaf and hard of hearing community.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showVideoUpload && (
        <Suspense fallback={<LoadingSpinner />}>
          <VideoUpload onClose={() => setShowVideoUpload(false)} />
        </Suspense>
      )}

      {showCameraCapture && (
        <Suspense fallback={<LoadingSpinner />}>
          <CameraCapture onClose={() => setShowCameraCapture(false)} />
        </Suspense>
      )}

      {/* Accessibility Controls */}
      <AccessibilityControls />
    </div>
  );
}

export default App;
