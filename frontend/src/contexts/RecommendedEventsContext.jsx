import React, { createContext, useContext, useState, useEffect } from 'react';

const RecommendedEventsContext = createContext();

export const useRecommendedEvents = () => {
  const context = useContext(RecommendedEventsContext);
  if (!context) {
    throw new Error('useRecommendedEvents must be used within RecommendedEventsProvider');
  }
  return context;
};

export const RecommendedEventsProvider = ({ children }) => {
  // Banner configuration
  const [bannerConfig, setBannerConfig] = useState(() => {
    const saved = localStorage.getItem('eventMenarikBanner');
    return saved ? JSON.parse(saved) : {
      backgroundImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
      title: 'Event Menarik di SMKN 4 BOGOR',
      subtitle: 'Bergabunglah dengan berbagai kegiatan seru dan edukatif di sekolah terbaik Bogor. Kembangkan potensi diri melalui program-program unggulan kami.'
    };
  });

  // Section text configuration
  const [sectionText, setSectionText] = useState(() => {
    const saved = localStorage.getItem('eventMenarikSectionText');
    return saved ? JSON.parse(saved) : {
      heading: 'Event menarik di SMKN 4 BOGOR',
      subheading: 'Jangan lewatkan kesempatan emas ini!'
    };
  });

  // Recommended events data
  const [recommendedEvents, setRecommendedEvents] = useState(() => {
    const saved = localStorage.getItem('eventMenarikCards');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: 'Pelatihan IT Intensif',
        description: 'Pelatihan programming dan teknologi terbaru untuk masa depan digital',
        category: 'Workshop',
        tags: ['Teknologi'],
        date: '15 Nov 2024',
        time: '08:00 WIB',
        location: 'Lab Komputer',
        gradient: 'from-blue-500 to-indigo-600',
        icon: 'book',
        buttonText: 'Daftar Sekarang',
        buttonGradient: 'from-blue-500 to-indigo-600',
        active: true,
        order: 1
      },
      {
        id: 2,
        title: 'Turnamen Futsal Antar Kelas',
        description: 'Kompetisi futsal antar kelas untuk mempererat persaudaraan dan sportivitas',
        category: 'Olahraga',
        tags: ['Kompetisi'],
        date: '20 Nov 2024',
        time: '14:00 WIB',
        location: 'Lapangan Futsal',
        gradient: 'from-green-500 to-emerald-600',
        icon: 'smile',
        buttonText: 'Daftar Tim',
        buttonGradient: 'from-green-500 to-emerald-600',
        active: true,
        order: 2
      },
      {
        id: 3,
        title: 'Festival Budaya Nusantara',
        description: 'Pameran seni dan budaya nusantara untuk melestarikan warisan bangsa',
        category: 'Seni',
        tags: ['Budaya'],
        date: '25 Nov 2024',
        time: '09:00 WIB',
        location: 'Aula & Halaman',
        gradient: 'from-purple-500 to-pink-600',
        icon: 'palette',
        buttonText: 'Info Lebih Lanjut',
        buttonGradient: 'from-purple-500 to-pink-600',
        active: true,
        order: 3
      },
      {
        id: 4,
        title: 'Seminar Kewirausahaan',
        description: 'Belajar membangun bisnis dari nol bersama entrepreneur sukses Indonesia',
        category: 'Bisnis',
        tags: ['Seminar'],
        date: '30 Nov 2024',
        time: '13:00 WIB',
        location: 'Aula Utama',
        gradient: 'from-amber-500 to-orange-600',
        icon: 'lightbulb',
        buttonText: 'Daftar Gratis',
        buttonGradient: 'from-amber-500 to-orange-600',
        active: true,
        order: 4
      },
      {
        id: 5,
        title: 'Pameran Karya Siswa',
        description: 'Showcase karya terbaik siswa dari berbagai jurusan dan program keahlian',
        category: 'Pameran',
        tags: ['Kreativitas'],
        date: '05 Des 2024',
        time: '08:00 WIB',
        location: 'Gallery Sekolah',
        gradient: 'from-teal-500 to-cyan-600',
        icon: 'heart',
        buttonText: 'Lihat Karya',
        buttonGradient: 'from-teal-500 to-cyan-600',
        active: true,
        order: 5
      },
      {
        id: 6,
        title: 'Lomba Desain Grafis',
        description: 'Kompetisi desain poster dan logo dengan hadiah jutaan rupiah',
        category: 'Lomba',
        tags: ['Desain'],
        date: '10 Des 2024',
        time: '09:00 WIB',
        location: 'Lab Multimedia',
        gradient: 'from-rose-500 to-pink-600',
        icon: 'edit',
        buttonText: 'Ikut Lomba',
        buttonGradient: 'from-rose-500 to-pink-600',
        active: true,
        order: 6
      }
    ];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('eventMenarikBanner', JSON.stringify(bannerConfig));
  }, [bannerConfig]);

  useEffect(() => {
    localStorage.setItem('eventMenarikSectionText', JSON.stringify(sectionText));
  }, [sectionText]);

  useEffect(() => {
    try {
      // Remove large image data before saving to localStorage
      const eventsToSave = recommendedEvents.map(event => {
        const { flyerImage, ...eventWithoutImage } = event;
        // Only save image URL, not base64 data
        if (flyerImage && !flyerImage.startsWith('http')) {
          // Skip base64 images to save space
          return eventWithoutImage;
        }
        return { ...eventWithoutImage, flyerImage };
      });
      
      localStorage.setItem('eventMenarikCards', JSON.stringify(eventsToSave));
      console.log('Events saved to localStorage (without large images)');
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Clearing old data...');
        // Clear old data and try again with minimal data
        localStorage.removeItem('eventMenarikCards');
        const minimalEvents = recommendedEvents.map(({ flyerImage, ...event }) => event);
        try {
          localStorage.setItem('eventMenarikCards', JSON.stringify(minimalEvents));
          console.log('Events saved with minimal data');
        } catch (e) {
          console.error('Still failed after clearing. Data too large.');
        }
      } else {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [recommendedEvents]);

  // Banner actions
  const updateBanner = (newConfig) => {
    setBannerConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Section text actions
  const updateSectionText = (newText) => {
    setSectionText(prev => ({ ...prev, ...newText }));
  };

  // Event actions
  const addEvent = (event) => {
    console.log('Adding event to context:', event);
    const newEvent = {
      ...event,
      id: event.id || Date.now(),
      order: event.order || recommendedEvents.length + 1,
      // Ensure flyerImage URL is preserved
      flyerImage: event.flyerImage || event.flyer_image_url || ""
    };
    console.log('New event processed:', newEvent);
    setRecommendedEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id, updates) => {
    console.log('Updating event:', id, updates);
    const processedUpdates = {
      ...updates,
      // Ensure flyerImage URL is preserved
      flyerImage: updates.flyerImage || updates.flyer_image_url || ""
    };
    setRecommendedEvents(prev =>
      prev.map(event => event.id === id ? { ...event, ...processedUpdates } : event)
    );
  };

  const deleteEvent = (id) => {
    setRecommendedEvents(prev => prev.filter(event => event.id !== id));
  };

  const toggleEventActive = (id) => {
    setRecommendedEvents(prev =>
      prev.map(event =>
        event.id === id ? { ...event, active: !event.active } : event
      )
    );
  };

  const reorderEvents = (newOrder) => {
    setRecommendedEvents(newOrder);
  };

  // Get active events only (for homepage display)
  const getActiveEvents = () => {
    return recommendedEvents
      .filter(event => event.active)
      .sort((a, b) => a.order - b.order);
  };

  const value = {
    // Banner
    bannerConfig,
    updateBanner,
    
    // Section text
    sectionText,
    updateSectionText,
    
    // Events
    recommendedEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventActive,
    reorderEvents,
    getActiveEvents
  };

  return (
    <RecommendedEventsContext.Provider value={value}>
      {children}
    </RecommendedEventsContext.Provider>
  );
};
