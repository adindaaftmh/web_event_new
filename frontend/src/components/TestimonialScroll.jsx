import React, { useState, useEffect, useRef } from "react";
import { testimonialService } from "../services/apiService";

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-[#F6FAFD]/90 backdrop-blur-lg border border-[#B3CFE5]/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 flex-shrink-0 w-80">
      {/* Badge Event Category */}
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#4A7FA7]/20 text-[#4A7FA7] border border-[#4A7FA7]/30">
          {testimonial.event_category || 'Event'}
        </span>
      </div>

      {/* Avatar */}
      <div className="flex items-center mb-4">
        <img
          src={testimonial.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.display_name || 'User')}&background=4A7FA7&color=ffffff&size=56`}
          alt={testimonial.display_name || 'User'}
          className="w-14 h-14 rounded-full object-cover mr-3"
          loading="lazy"
        />
        <div>
          <h4 className="font-semibold text-[#0A1931]">{testimonial.display_name || 'Anonymous'}</h4>
          <p className="text-sm text-[#4A7FA7]">{testimonial.display_role || 'Participant'}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center mb-3">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-[#4A7FA7]">({testimonial.rating}/5)</span>
      </div>

      {/* Testimonial Text */}
      <p className="text-[#0A1931] text-sm leading-relaxed">
        "{testimonial.testimonial}"
      </p>
    </div>
  );
};

const TestimonialScroll = ({ onAddTestimonial }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Add dummy testimonial data
      const dummyTestimonials = [
          {
            id: 1,
            display_name: "Andi Pratama",
            display_role: "Siswa Kelas XII RPL",
            avatar_url: "https://ui-avatars.com/api/?name=Andi+Pratama&background=4A7FA7&color=ffffff&size=56",
            rating: 5,
            testimonial: "Workshop IT Intensif sangat membantu saya memahami teknologi terbaru. Materinya sangat aplikatif dan instrukturnya berpengalaman. Highly recommended!",
            event_category: "Workshop IT"
          },
          {
            id: 2,
            display_name: "Sari Dewi",
            display_role: "Siswa Kelas XI TKJ",
            avatar_url: "https://ui-avatars.com/api/?name=Sari+Dewi&background=10B981&color=ffffff&size=56",
            rating: 5,
            testimonial: "Turnamen Futsal antar kelas sangat seru! Selain olahraga, juga mempererat tali persaudaraan antar siswa. Panitia juga sangat profesional.",
            event_category: "Olahraga"
          },
          {
            id: 3,
            display_name: "Budi Santoso",
            display_role: "Siswa Kelas XII MM",
            avatar_url: "https://ui-avatars.com/api/?name=Budi+Santoso&background=8B5CF6&color=ffffff&size=56",
            rating: 4,
            testimonial: "Festival Budaya Nusantara membuka wawasan saya tentang kekayaan budaya Indonesia. Pertunjukan tari tradisionalnya sangat memukau!",
            event_category: "Seni & Budaya"
          },
          {
            id: 4,
            display_name: "Maya Putri",
            display_role: "Siswa Kelas XI RPL",
            avatar_url: "https://ui-avatars.com/api/?name=Maya+Putri&background=F59E0B&color=ffffff&size=56",
            rating: 5,
            testimonial: "Seminar Kewirausahaan memberikan inspirasi besar untuk memulai bisnis. Speaker-nya adalah entrepreneur sukses yang sharing pengalaman nyata.",
            event_category: "Bisnis"
          },
          {
            id: 5,
            display_name: "Rizki Firmansyah",
            display_role: "Siswa Kelas XII TKJ",
            avatar_url: "https://ui-avatars.com/api/?name=Rizki+Firmansyah&background=EF4444&color=ffffff&size=56",
            rating: 5,
            testimonial: "Pameran Karya Siswa memotivasi saya untuk lebih kreatif. Melihat karya teman-teman yang luar biasa membuat saya ingin berkontribusi lebih.",
            event_category: "Pameran"
          },
          {
            id: 6,
            display_name: "Dina Maharani",
            display_role: "Siswa Kelas XI MM",
            avatar_url: "https://ui-avatars.com/api/?name=Dina+Maharani&background=EC4899&color=ffffff&size=56",
            rating: 4,
            testimonial: "Lomba Desain Grafis sangat menantang! Kompetisinya ketat tapi fair. Saya belajar banyak teknik baru dari peserta lain.",
            event_category: "Kompetisi"
          },
          {
            id: 7,
            display_name: "Fajar Nugroho",
            display_role: "Alumni 2023",
            avatar_url: "https://ui-avatars.com/api/?name=Fajar+Nugroho&background=06B6D4&color=ffffff&size=56",
            rating: 5,
            testimonial: "Event-event di SMKN 4 Bogor selalu berkualitas. Sebagai alumni, saya bangga melihat sekolah terus berinovasi dalam pendidikan.",
            event_category: "Alumni"
          },
          {
            id: 8,
            display_name: "Indira Sari",
            display_role: "Siswa Kelas XII RPL",
            avatar_url: "https://ui-avatars.com/api/?name=Indira+Sari&background=84CC16&color=ffffff&size=56",
            rating: 5,
            testimonial: "Fasilitas event sangat lengkap dan modern. Tim panitia juga sangat responsif dan membantu. Pengalaman yang tak terlupakan!",
            event_category: "Fasilitas"
          }
        ];

        try {
          const response = await testimonialService.getAll({
            per_page: 20,
            _t: new Date().getTime() // Prevent caching
          });

          console.log('Testimonial API Response:', response.data);

          if (response.data.success) {
            // Map API data to match expected format
            const mappedTestimonials = response.data.data.map(item => ({
              id: item.id,
              display_name: item.user?.nama_lengkap || item.user?.name || 'Anonymous',
              display_role: item.user?.pendidikan_terakhir || 'Participant',
              avatar_url: item.user?.profile_image 
                ? `http://localhost:8000/${item.user.profile_image}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.nama_lengkap || 'User')}&background=4A7FA7&color=ffffff&size=56`,
              rating: item.rating || 5,
              testimonial: item.testimonial,
              event_category: item.event_category || item.event?.judul_kegiatan || 'Event'
            }));
            
            setTestimonials([...dummyTestimonials, ...mappedTestimonials]);
          } else {
            // Use dummy data if API fails
            setTestimonials(dummyTestimonials);
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          // Use dummy data if API fails
          setTestimonials(dummyTestimonials);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        // Silently handle error, don't show error message to user
      } finally {
        setLoading(false);
      }
    };

  }, []);

  // Expose refresh function to window
  useEffect(() => {
    window.refreshTestimonials = fetchTestimonials;
    return () => {
      delete window.refreshTestimonials;
    };
  }, [fetchTestimonials]);

  // Initial fetch
  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Duplicate testimonials for seamless infinite loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#4A7FA7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Remove error display - silently handle errors

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A7FA7]">Belum ada testimonial</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-xl"></div>
      </div>


      {/* Desktop/Tablet: Dual Row Animation */}
      <div className="hidden lg:block space-y-8">
        {/* Row 1 - Scroll Left */}
        <div className="relative overflow-hidden">
          <div
            ref={scrollRef1}
            className="flex gap-6 animate-scroll-left will-change-transform"
            style={{
              width: `${duplicatedTestimonials.length * 400}px`
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard key={`row1-${testimonial.id}-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Row 2 - Scroll Right */}
        <div className="relative overflow-hidden">
          <div
            ref={scrollRef2}
            className="flex gap-6 animate-scroll-right will-change-transform"
            style={{
              width: `${duplicatedTestimonials.length * 400}px`
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard key={`row2-${testimonial.id}-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Vertical Stack */}
      <div className="lg:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.slice(0, 4).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>

      {/* Action Button - Centered */}
      {onAddTestimonial && (
        <div className="flex justify-center mt-12">
          <button 
            onClick={onAddTestimonial}
            className="px-8 py-3 bg-[#4A7FA7] text-white rounded-full font-semibold hover:bg-[#4A7FA7]/80 transition-all shadow-lg transform hover:-translate-y-1"
          >
            Tambah Testimoni Baru
          </button>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 30s linear infinite;
        }

        /* Pause animation on hover */
        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }

        /* Slower animation for tablet */
        @media (min-width: 768px) and (max-width: 1024px) {
          .animate-scroll-left,
          .animate-scroll-right {
            animation-duration: 40s;
          }
        }
      `}</style>
    </div>
  );
};

export default TestimonialScroll;
