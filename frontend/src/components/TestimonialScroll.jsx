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

const TestimonialScroll = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await testimonialService.getAll({
          per_page: 20,
          approved: true
        });

        if (response.data.success) {
          setTestimonials(response.data.data);
        } else {
          setError("Gagal memuat testimonial");
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setError("Terjadi kesalahan saat memuat testimonial");
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Duplicate testimonials for seamless infinite loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#4A7FA7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

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

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#0A1931] mb-3">Apa Kata Mereka?</h2>
        <p className="text-[#4A7FA7] text-lg">Testimoni dari peserta event kami</p>
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
        <button className="px-8 py-3 bg-[#4A7FA7] text-white rounded-full font-semibold hover:bg-[#4A7FA7]/80 transition-all shadow-lg">
          Tambah Ulasan
        </button>
        <button className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-[#0A1931] rounded-full font-semibold hover:bg-white/20 transition-all">
          Lihat Event Populer
        </button>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
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
