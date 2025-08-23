"use client";
import {
  Building,
  Building2,
  Calendar,
  CheckCircle,
  CreditCard,
  Home,
  MapPin,
  Menu,
  MessageSquare,
  Shield,
  Star,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SocietyProLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    units: 0,
    residents: 0,
    collection: 0,
  });

  useEffect(() => {
    setIsVisible(true);

    // Animate counters
    const timer = setTimeout(() => {
      const unitTarget = 248;
      const residentTarget = 892;
      const collectionTarget = 94;

      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;

      let step = 0;
      const counter = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setCounters({
          units: Math.floor(unitTarget * easeOut),
          residents: Math.floor(residentTarget * easeOut),
          collection: Math.floor(collectionTarget * easeOut),
        });

        if (step >= steps) {
          clearInterval(counter);
          setCounters({
            units: unitTarget,
            residents: residentTarget,
            collection: collectionTarget,
          });
        }
      }, stepTime);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 animate-in slide-in-from-top duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 animate-in fade-in duration-700">
              <Building2 className="h-8 w-8 text-blue-600 animate-pulse" />
              <span className="text-2xl font-bold text-gray-900">
                SocietyPro
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {["Home", "Features", "Pricing", "Reviews", "Contact"].map(
                (item, index) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-gray-600 hover:text-gray-900 transition-all duration-300 relative group animate-in fade-in"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                )
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.open("tel:+919601034367")}
                className="hidden sm:block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in fade-in duration-1000"
              >
                Call Us +91 96010 34367
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 animate-in slide-in-from-top duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {["Home", "Features", "Pricing", "Reviews", "Contact"].map(
                (item, index) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-200 animate-in fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-28 pb-20 bg-gradient-to-br from-blue-50 to-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`space-y-8 ${
                isVisible
                  ? "animate-in slide-in-from-left duration-1000"
                  : "opacity-0"
              }`}
            >
              <div className="space-y-4">
                <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  The Complete Society Management Solution
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight animate-in fade-in duration-1200 delay-200">
                  Simplifying Community Management
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed animate-in fade-in duration-1200 delay-300">
                  Empower your housing society, commercial complex, or
                  residential community with SocietyPro. Streamline operations,
                  enhance communication, and build stronger communities.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in duration-1200 delay-500">
                <button
                  onClick={() => window.open("tel:+919601034367")}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium transform hover:scale-105 hover:shadow-lg"
                >
                  Call Us +91 96010 34367
                </button>
                <a
                  target="_blank"
                  href="https://smartmanager.co.in/auth/login"
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium transform hover:scale-105"
                >
                  Already Purchased?
                </a>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500 animate-in fade-in duration-1200 delay-700">
                {[
                  { icon: CheckCircle, text: "No setup fees" },
                  { icon: CheckCircle, text: "30-day free trial" },
                  { icon: CheckCircle, text: "24/7 support" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 animate-in fade-in duration-500"
                    style={{ animationDelay: `${700 + index * 100}ms` }}
                  >
                    <item.icon className="h-4 w-4 text-green-600" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`${
                isVisible
                  ? "animate-in slide-in-from-right duration-1000 delay-300"
                  : "opacity-0"
              }`}
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 transform hover:scale-105 transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Community Dashboard
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center transform hover:scale-105 transition-all duration-300">
                      <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">
                        {counters.units}
                      </div>
                      <div className="text-sm text-gray-500">Total Units</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center transform hover:scale-105 transition-all duration-300">
                      <Users
                        className="h-8 w-8 text-green-600 mx-auto mb-2"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div className="text-2xl font-bold text-gray-900">
                        {counters.residents}
                      </div>
                      <div className="text-sm text-gray-500">Residents</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Maintenance Collection
                      </span>
                      <span className="font-semibold text-gray-900">
                        {counters.collection}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-2000 ease-out"
                        style={{ width: `${counters.collection}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-in fade-in duration-1000">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Everything You Need to Manage Your Community
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From maintenance tracking to resident communication, SocietyPro
              provides all the tools you need to run your society efficiently
              and transparently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: CreditCard,
                title: "Maintenance Tracking",
                desc: "Automated billing, payment tracking, and transparent financial reporting for all maintenance fees.",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: MessageSquare,
                title: "Resident Communication",
                desc: "Instant notifications, community announcements, and direct messaging between residents and management.",
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                icon: Calendar,
                title: "Facility Booking",
                desc: "Easy online booking system for community halls, gyms, and other shared facilities.",
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                icon: Building,
                title: "Commercial Management",
                desc: "Manage commercial spaces, track rent, and handle vendor relationships efficiently.",
                color: "text-orange-600",
                bg: "bg-orange-50",
              },
              {
                icon: Shield,
                title: "Security & Access",
                desc: "Visitor management, security logs, and digital access control for enhanced safety.",
                color: "text-red-600",
                bg: "bg-red-50",
              },
              {
                icon: Users,
                title: "Community Portal",
                desc: "Centralized platform for residents to access all services, documents, and community updates.",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-in fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`${feature.bg} rounded-lg w-16 h-16 flex items-center justify-center mb-4 transform transition-all duration-300 hover:scale-110`}
                >
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your community size. No hidden fees, no
              long-term contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-center mb-8">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                <p className="text-gray-600 mt-2">
                  Perfect for small societies
                </p>
                <div className="text-4xl font-bold text-gray-900 mt-4">
                  ₹2,999
                  <span className="text-lg font-normal text-gray-500">
                    /month
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Up to 50 units</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Basic maintenance tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Resident communication</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Email support</span>
                </div>
              </div>

              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Get Started
              </button>
            </div>

            {/* Professional Plan - Popular */}
            <div className="bg-white border-2 border-blue-600 rounded-xl p-8 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Professional
                </h3>
                <p className="text-gray-600 mt-2">
                  Ideal for medium communities
                </p>
                <div className="text-4xl font-bold text-gray-900 mt-4">
                  ₹5,999
                  <span className="text-lg font-normal text-gray-500">
                    /month
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Up to 200 units</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    Advanced maintenance & billing
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Facility booking system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Visitor management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-center mb-8">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                <p className="text-gray-600 mt-2">For large communities</p>
                <div className="text-4xl font-bold text-gray-900 mt-4">
                  ₹12,999
                  <span className="text-lg font-normal text-gray-500">
                    /month
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Unlimited units</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">All features included</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Commercial space management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Custom integrations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">24/7 dedicated support</span>
                </div>
              </div>

              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Loved by Communities Everywhere
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what society managers and residents are saying about
              SocietyPro.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "SocietyPro has transformed how we manage our 150-unit society.
                The maintenance collection improved from 60% to 95% within just
                3 months!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Rajesh Kumar
                  </div>
                  <div className="text-sm text-gray-500">
                    Society Secretary, Mumbai
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Finally, a platform that residents actually use! The mobile app
                is so intuitive, even my elderly neighbors love using it for
                facility bookings."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Priya Sharma
                  </div>
                  <div className="text-sm text-gray-500">
                    Resident, Bangalore
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The transparency in financial reporting has eliminated all
                disputes. Residents can see exactly where their money is being
                spent."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Amit Patel</div>
                  <div className="text-sm text-gray-500">Treasurer, Delhi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Transform Your Community?
            </h2>
            <p className="text-xl opacity-90">
              Join hundreds of societies already using SocietyPro to build
              stronger, more connected communities. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.open("tel:+919601034367")}
                className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
              >
                Call Us +91 96010 34367
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm opacity-80">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Setup in under 30 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">SocietyPro</span>
              </div>
              <p className="text-gray-400">
                Empowering communities with smart management solutions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Security
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Integrations
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Help Center
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Training
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Status
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Surat, India</span>
                </div>
                <div>
                  <a
                    href="mailto:info@tomatogames.in"
                    className="text-sm hover:underline"
                  >
                    info@tomatogames.in
                  </a>
                </div>
                <div>
                  <span
                    onClick={() => window.open("tel:+919601034367")}
                    className="text-sm cursor-pointer hover:underline"
                  >
                    +91 96010 34367
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 SocietyPro. All rights reserved. Built with ❤️ for
              communities.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Built By{" "}
              <a
                href="https://tomatogames.in/"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tomato Games
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
