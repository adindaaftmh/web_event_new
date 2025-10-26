import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Services() {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      title: "Event Management",
      description: "Kelola event Anda dari awal hingga akhir dengan tools yang lengkap dan mudah digunakan.",
      features: ["Pendaftaran Online", "Manajemen Peserta", "Sistem Pembayaran", "Analytics & Reporting"],
      icon: "🎯",
      color: "from-[#4A7FA7] to-[#1A3D63]"
    },
    {
      id: 2,
      title: "Ticketing System",
      description: "Sistem tiket digital yang aman dan terintegrasi dengan berbagai metode pembayaran.",
      features: ["E-Ticket Digital", "QR Code Scanner", "Multi Payment Gateway", "Real-time Validation"],
      icon: "🎫",
      color: "from-[#1A3D63] to-[#0A1931]"
    },
    {
      id: 3,
      title: "Marketing Tools",
      description: "Promosikan event Anda dengan tools marketing yang powerful dan efektif.",
      features: ["Social Media Integration", "Email Marketing", "Landing Page Builder", "SEO Optimization"],
      icon: "📢",
      color: "from-[#4A7FA7] to-[#2E5984]"
    },
    {
      id: 4,
      title: "Analytics & Insights",
      description: "Dapatkan insight mendalam tentang performa event dan behavior peserta.",
      features: ["Real-time Dashboard", "Attendance Tracking", "Revenue Analytics", "Custom Reports"],
      icon: "📊",
      color: "from-[#2E5984] to-[#1A3D63]"
    },
    {
      id: 5,
      title: "Mobile App",
      description: "Aplikasi mobile untuk peserta dengan fitur lengkap dan user-friendly.",
      features: ["Event Schedule", "Networking Features", "Push Notifications", "Offline Access"],
      icon: "📱",
      color: "from-[#0A1931] to-[#1A3D63]"
    },
    {
      id: 6,
      title: "24/7 Support",
      description: "Tim support yang siap membantu Anda kapan saja dengan respon yang cepat.",
      features: ["Live Chat Support", "Phone Support", "Email Support", "Knowledge Base"],
      icon: "🛟",
      color: "from-[#1A3D63] to-[#4A7FA7]"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Gratis",
      description: "Untuk event kecil dan personal",
      features: ["Hingga 50 peserta", "Basic ticketing", "Email support", "Analytics dasar"],
      recommended: false
    },
    {
      name: "Professional",
      price: "Rp 299.000/bulan",
      description: "Untuk event bisnis dan komersial",
      features: ["Hingga 1000 peserta", "Advanced ticketing", "Priority support", "Full analytics", "Custom branding"],
      recommended: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Untuk event skala besar dan korporat",
      features: ["Unlimited peserta", "White-label solution", "Dedicated support", "API access", "Custom integrations"],
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="relative bg-gradient-to-br from-[#F6FAFD]/95 via-white/90 to-[#E8F4FD]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#4A7FA7]/10 to-transparent rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#0A1931] to-[#4A7FA7] bg-clip-text text-transparent mb-6">
                  Layanan Kami
                </h1>
                <p className="text-xl md:text-2xl text-[#4A7FA7] max-w-4xl mx-auto leading-relaxed">
                  Solusi lengkap untuk semua kebutuhan event management Anda
                </p>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {services.map((service) => (
              <div key={service.id} className="relative bg-gradient-to-br from-[#F6FAFD]/95 via-white/90 to-[#E8F4FD]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#4A7FA7]/10 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-6">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-[#0A1931] mb-4">{service.title}</h3>
                  <p className="text-[#4A7FA7] mb-6 leading-relaxed">{service.description}</p>
                  
                  <div className="space-y-3">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full"></div>
                        <span className="text-[#4A7FA7] font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Section */}
          <div className="relative bg-gradient-to-br from-[#F6FAFD]/95 via-white/90 to-[#E8F4FD]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#1A3D63]/10 to-transparent rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-[#0A1931] to-[#4A7FA7] bg-clip-text text-transparent mb-4">
                  Paket Harga
                </h2>
                <p className="text-xl text-[#4A7FA7] max-w-2xl mx-auto">
                  Pilih paket yang sesuai dengan kebutuhan event Anda
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPlans.map((plan, index) => (
                  <div key={index} className={`relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                    plan.recommended 
                      ? 'border-[#4A7FA7] shadow-xl ring-2 ring-[#4A7FA7]/20' 
                      : 'border-white/40 hover:bg-white/80'
                  }`}>
                    {plan.recommended && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white px-4 py-2 rounded-full text-sm font-bold">
                          Recommended
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-[#0A1931] mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-[#4A7FA7] mb-2">{plan.price}</div>
                      <p className="text-[#4A7FA7]">{plan.description}</p>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-[#4A7FA7]">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className={`w-full py-3 rounded-2xl font-bold transition-all duration-300 ${
                      plan.recommended
                        ? 'bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white hover:from-[#4A7FA7]/90 hover:to-[#1A3D63]/90 shadow-xl hover:shadow-2xl'
                        : 'bg-white/80 text-[#4A7FA7] border-2 border-[#4A7FA7]/20 hover:bg-[#4A7FA7] hover:text-white'
                    }`}>
                      {plan.price === "Custom" ? "Hubungi Kami" : "Pilih Paket"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-2xl font-bold hover:from-[#4A7FA7]/90 hover:to-[#1A3D63]/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105 duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
