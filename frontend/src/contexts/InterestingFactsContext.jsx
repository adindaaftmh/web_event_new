import React, { createContext, useContext, useState, useEffect } from 'react';

const InterestingFactsContext = createContext();

export const useInterestingFacts = () => {
  const context = useContext(InterestingFactsContext);
  if (!context) {
    throw new Error('useInterestingFacts must be used within InterestingFactsProvider');
  }
  return context;
};

// Default facts data
const defaultFacts = [
  { 
    id: 1, 
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500",
    title: "Event Selesai dengan Sukses", 
    description: "Lebih dari 10.000 event telah berhasil diselenggarakan di platform kami dengan tingkat keberhasilan yang tinggi",
    active: true 
  },
  { 
    id: 2, 
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500",
    title: "Peserta Aktif Bergabung", 
    description: "Setengah juta pengguna aktif yang mengikuti berbagai event menarik dan inspiratif di platform kami",
    active: true 
  },
  { 
    id: 3, 
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500",
    title: "Tingkat Kepuasan Tinggi", 
    description: "Tingkat kepuasan peserta yang sangat tinggi terhadap kualitas event yang diselenggarakan",
    active: true 
  },
  { 
    id: 4, 
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500",
    title: "Jangkauan Luas", 
    description: "Event kami telah menjangkau berbagai kota di seluruh Indonesia dengan partisipasi yang meningkat",
    active: true 
  }
];

export const InterestingFactsProvider = ({ children }) => {
  // Load from localStorage or use default
  const [facts, setFacts] = useState(() => {
    const savedFacts = localStorage.getItem('interestingFacts');
    if (savedFacts) {
      const parsed = JSON.parse(savedFacts);
      // Check if old format (has icon/number field), clear it
      if (parsed.length > 0 && (parsed[0].icon || parsed[0].number)) {
        localStorage.removeItem('interestingFacts');
        return defaultFacts;
      }
      return parsed;
    }
    return defaultFacts;
  });

  // Save to localStorage whenever facts change
  useEffect(() => {
    localStorage.setItem('interestingFacts', JSON.stringify(facts));
    console.log('Facts saved to localStorage:', facts);
  }, [facts]);

  const addFact = (fact) => {
    setFacts([...facts, { ...fact, id: Date.now() }]);
  };

  const updateFact = (id, updatedFact) => {
    setFacts(facts.map(f => f.id === id ? { ...updatedFact, id } : f));
  };

  const deleteFact = (id) => {
    setFacts(facts.filter(f => f.id !== id));
  };

  const toggleActive = (id) => {
    setFacts(facts.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  const getActiveFacts = () => {
    return facts.filter(f => f.active);
  };

  return (
    <InterestingFactsContext.Provider 
      value={{ 
        facts, 
        setFacts, 
        addFact, 
        updateFact, 
        deleteFact, 
        toggleActive,
        getActiveFacts 
      }}
    >
      {children}
    </InterestingFactsContext.Provider>
  );
};
