import { useState } from 'react';
import rajaampatBg from '../assets/rajaampat.jpg';

const Dashboard = ({ onRegister, onLogin }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const latestEvents = [
    {
      id: 1,
      title: "Nama Event/Kegiatan",
      location: "Tangerang",
      date: "10 July 2025",
      rating: 8.3,
      bookings: 700,
      price: "Rp. 110,000"
    },
    {
      id: 2,
      title: "Event Wisata Bahari",
      location: "Jakarta",
      date: "15 July 2025",
      rating: 9.1,
      bookings: 450,
      price: "Rp. 150,000"
    },
    {
      id: 3,
      title: "Festival Budaya",
      location: "Bandung",
      date: "20 July 2025",
      rating: 8.7,
      bookings: 320,
      price: "Rp. 95,000"
    },
    {
      id: 4,
      title: "Workshop Photography",
      location: "Surabaya",
      date: "25 July 2025",
      rating: 9.5,
      bookings: 180,
      price: "Rp. 200,000"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % latestEvents.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + latestEvents.length) % latestEvents.length);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${rajaampatBg})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-purple-900 bg-opacity-95 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <h1 className="text-white text-xl font-bold">LOGO</h1>
              </div>

              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-white hover:text-gray-300 transition-colors">Event</a>
                <a href="#" className="text-white hover:text-gray-300 transition-colors">Atraksi</a>
              </nav>

              <div className="flex-1 max-w-lg mx-8">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari disini"
                    className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:bg-white focus:bg-opacity-30 focus:text-gray-900 focus:placeholder-gray-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={onRegister}
                  className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-md transition-colors shadow-md"
                >
                  Daftar
                </button>
                <button 
                  onClick={onLogin}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors shadow-md"
                >
                  Masuk
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative">
          {/* Central Carousel Area */}
          <div className="relative max-w-6xl mx-auto mt-8 px-4">
            <div className="bg-gray-200 bg-opacity-95 backdrop-blur-sm rounded-lg p-8 min-h-96 flex items-center justify-center shadow-2xl border border-gray-300">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Selamat Datang di Dashboard</h2>
                <p className="text-gray-600 text-lg">Pilih event favorit Anda</p>
              </div>
              
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Latest Events Section */}
          <div className="max-w-7xl mx-auto mt-12 px-4 pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">Event Terbaru</h2>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors shadow-md">
                Lihat selengkapnya
              </button>
            </div>

            {/* Events Carousel */}
            <div className="relative">
              <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                {latestEvents.map((event) => (
                  <div key={event.id} className="flex-shrink-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
                    <div className="h-48 bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">Flyer</span>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{event.date}</span>
                          </div>
                        </div>
                        
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Tiket Tersedia
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {event.rating} ({event.bookings}+ dipesan)
                        </span>
                      </div>
                      
                      <button className="w-full border-2 border-red-500 text-red-500 py-2 px-4 rounded-md hover:bg-red-500 hover:text-white transition-colors">
                        Mulai {event.price}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors -ml-6"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors -mr-6"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
