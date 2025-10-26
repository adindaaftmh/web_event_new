      {/* Event Menarik di SMKN 4 BOGOR Section - Dynamic */}
      <div className="relative py-20 overflow-hidden min-h-screen">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Event Card Container */}
          <div className="relative bg-[#F6FAFD]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header Section - Dynamic Banner */}
            <div className="relative h-80 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bannerConfig.backgroundImage})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A1931]/85 via-[#1A3D63]/80 to-[#0A1931]/90"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-indigo-900/30"></div>
              
              <div className="relative h-full flex items-center justify-center text-center px-8">
                <div>
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                    {bannerConfig.title}
                  </h2>
                  <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
                    {bannerConfig.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Information Cards Section - Dynamic */}
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold text-[#0A1931] mb-3">
                  {sectionText.heading}
                </h3>
                <div className="w-32 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mx-auto mb-4"></div>
                <p className="text-[#4A7FA7] text-lg">{sectionText.subheading}</p>
              </div>

              {/* Event Cards Grid - Dynamic */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getActiveEvents().map((event) => {
                  const iconMap = {
                    book: BookOpen, smile: Smile, palette: Palette,
                    lightbulb: Lightbulb, heart: Heart, edit: Edit
                  };
                  const IconComponent = iconMap[event.icon] || BookOpen;
                  
                  return (
                  <div key={event.id} className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#4A7FA7]/50 max-w-sm mx-auto">
                    <div className={`relative h-56 bg-gradient-to-br ${event.gradient} overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <IconComponent className="w-12 h-12" />
                          </div>
                          <h4 className="text-2xl font-bold mb-1 line-clamp-1 px-4">{event.title.toUpperCase()}</h4>
                          <p className="text-sm opacity-90 font-medium">SMKN 4 BOGOR</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{event.category}</span>
                        {event.tags && event.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                        ))}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#4A7FA7] transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-600 text-xs mb-3 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="space-y-1 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{event.date}, {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      </div>
                      
                      <button className={`w-full py-2 bg-gradient-to-r ${event.buttonGradient} text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5`}>
                        {event.buttonText}
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fakta Menarik Section */}
      <div className="relative py-16 overflow-hidden">
        {/* Background - Color Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/20 to-purple-100/30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A1931] mb-3">
              Fakta Menarik 
            </h2>
            {/* Animated Underline */}
            <div className="w-72 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mx-auto mb-3 animate-slide-line"></div>
            <p className="text-[#4A7FA7]">Temukan hal-hal menarik tentang event-event kami</p>
          </div>

          {/* Facts List with Icon + Description */}
          <div className="space-y-6">
            {[
              { 
                title: 'Workshop IT Intensif', 
                subtitle: 'Teknologi Terdepan',
                icon: '💻',
                gradient: 'from-blue-500 to-indigo-600',
                fact: 'Lebih dari 500 siswa telah mengikuti workshop IT kami dan 85% berhasil mendapat sertifikasi internasional dari Microsoft dan Google.'
              },
              { 
                title: 'Turnamen Futsal Antar Kelas', 
                subtitle: 'Olahraga Favorit',
                icon: '⚽',
                gradient: 'from-green-500 to-emerald-600',
                fact: 'Turnamen futsal SMKN 4 Bogor adalah yang terbesar se-Bogor dengan 32 tim peserta dan total hadiah senilai 25 juta rupiah.'
              },
              { 
                title: 'Festival Budaya Nusantara', 
                subtitle: 'Warisan Budaya',
                icon: '🎭',
                gradient: 'from-purple-500 to-pink-600',
                fact: 'Festival budaya kami menampilkan 15 tarian tradisional dari berbagai daerah dan dikunjungi lebih dari 2000 pengunjung setiap tahunnya.'
              },
              { 
                title: 'Seminar Kewirausahaan', 
                subtitle: 'Inspirasi Bisnis',
                icon: '💡',
                gradient: 'from-amber-500 to-orange-600',
                fact: 'Alumni SMKN 4 Bogor yang mengikuti seminar kewirausahaan, 60% berhasil memulai bisnis sendiri dalam 2 tahun setelah lulus.'
              },
              { 
                title: 'Pameran Karya Siswa', 
                subtitle: 'Kreativitas Tanpa Batas',
                icon: '🎨',
                gradient: 'from-teal-500 to-cyan-600',
                fact: 'Pameran karya siswa menampilkan lebih dari 200 karya inovatif dan 15 karya terbaik dipamerkan di Jakarta Design Week.'
              },
              { 
                title: 'Lomba Desain Grafis', 
                subtitle: 'Kompetisi Bergengsi',
                icon: '🏆',
                gradient: 'from-rose-500 to-pink-600',
                fact: 'Lomba desain grafis SMKN 4 Bogor diikuti 150 peserta dari 50 sekolah se-Jabodetabek dengan total hadiah 50 juta rupiah.'
              }
            ].map((fact, index) => (
              <div
                key={fact.title}
                className="group flex flex-col md:flex-row gap-6 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in-up border border-white/20 hover:border-[#4A7FA7]/50"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                {/* Icon Section */}
                <div className={`md:w-64 h-48 md:h-auto bg-gradient-to-br ${fact.gradient} flex-shrink-0 relative overflow-hidden flex items-center justify-center`}>
                  <div className="text-center transition-transform duration-500 group-hover:scale-110">
                    <div className="text-6xl mb-3">{fact.icon}</div>
                    <p className="text-white font-bold text-lg drop-shadow-lg">{fact.subtitle}</p>
                    <div className="mt-2 px-3 py-1 bg-white/20 rounded-full">
                      <p className="text-white text-sm font-medium">Fakta Menarik</p>
                    </div>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="flex-1 p-6">
                  <h3 className="text-2xl font-bold text-[#0A1931] mb-4 group-hover:text-[#4A7FA7] transition-colors">
                    {fact.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#4A7FA7]/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-[#4A7FA7] font-semibold text-sm">Tahukah Anda?</span>
                  </div>
                  <p className="text-[#0A1931] leading-relaxed text-justify font-medium">
                    {fact.fact}
                  </p>
                  
                  {/* Stats Badge */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#4A7FA7]/10 text-[#4A7FA7] text-xs font-semibold rounded-full border border-[#4A7FA7]/20">
                      Statistik Terbaru
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#4A7FA7]/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile App Section */}
      <div id="mobile-app-section" className="relative py-20 overflow-hidden">
        {/* Background - Color Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1931] via-[#1A3D63] to-[#4A7FA7]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A7FA7]/20 via-transparent to-[#0A1931]/30"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#4A7FA7]/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/3 rounded-full blur-xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content Section */}
            <div className="text-white order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <div className="w-2 h-2 bg-[#4A7FA7] rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">#Choose Better</span>
              </div>
              
              {/* Main Heading */}
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="block">Aplikasi Mobile</span>
                <span className="block text-[#4A7FA7]">SMKN 4 BOGOR</span>
              </h2>
              
              {/* Subheading */}
              <div className="mb-8">
                <p className="text-xl text-white/90 mb-2">
                  Empowering Innovation, Driving Success:
                </p>
                <h3 className="text-2xl font-bold text-[#4A7FA7] mb-2">
                  Event App SMKN 4
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Partner Anda dalam Mengakses Event dan Informasi Sekolah dengan Mudah
                </p>
              </div>
              
              {/* Features List */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: '📅', text: 'Lihat jadwal event terbaru' },
                  { icon: '🎫', text: 'Daftar event secara online' },
                  { icon: '🔔', text: 'Notifikasi event penting' },
                  { icon: '📊', text: 'Statistik dan prestasi sekolah' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="text-lg">{feature.icon}</span>
                    </div>
                    <span className="text-white/90">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group flex items-center justify-center gap-3 px-6 py-4 bg-white text-[#0A1931] rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                  <div className="w-8 h-8 bg-[#0A1931] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-[#0A1931]/70">Download di</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </button>
                
                <button className="group flex items-center justify-center gap-3 px-6 py-4 bg-[#4A7FA7] text-white rounded-xl font-semibold hover:bg-[#4A7FA7]/90 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-white/20">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-white/70">Download di</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Image/Phone Mockup Section */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-64 h-[500px] bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-[3rem] shadow-2xl p-4 transform hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  <div className="bg-gradient-to-br from-[#0A1931] to-[#4A7FA7] h-full flex items-center justify-center text-white text-6xl">
                    📱
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
