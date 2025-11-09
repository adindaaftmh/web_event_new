import React, { createContext, useContext, useState, useEffect } from 'react';
import { kegiatanService, fileUploadClient } from '../services/apiService';

// Create Event Context
const EventContext = createContext();

// Event Provider Component
export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const transformEvent = (event) => {
    let tickets = [];

    if (Array.isArray(event.tickets)) {
      tickets = event.tickets;
    } else if (typeof event.tickets === 'string' && event.tickets.trim() !== '') {
      try {
        tickets = JSON.parse(event.tickets);
      } catch (parseError) {
        console.warn('Gagal mengonversi data tiket kegiatan:', parseError);
      }
    }

    const flyerUrl = event.flyer_url
      || (event.flyer_kegiatan && (event.flyer_kegiatan.startsWith('http://') || event.flyer_kegiatan.startsWith('https://')
        ? event.flyer_kegiatan
        : `http://localhost:8000/storage/${event.flyer_kegiatan}`));

    return {
      id: event.id,
      judul_kegiatan: event.judul_kegiatan,
      lokasi_kegiatan: event.lokasi_kegiatan,
      waktu_mulai: event.waktu_mulai,
      waktu_selesai: event.waktu_berakhir,
      flyer_kegiatan: flyerUrl || null,
      deskripsi_kegiatan: event.deskripsi_kegiatan,
      kategori: event.kategori ? { nama_kategori: event.kategori.nama_kategori } : { nama_kategori: '' },
      kapasitas_peserta: event.kapasitas_peserta,
      harga_tiket: event.harga_tiket,
      kontak_panitia: event.kontak_panitia,
      penyelenggara: event.penyelenggara || '',
      tipe_peserta: event.tipe_peserta || 'individu',
      tickets,
    };
  };

  // Load events from API on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await kegiatanService.getAll();

      if (response.data?.success) {
        // Transform API response to match frontend expectations
        const transformedEvents = response.data.data.map(transformEvent);
        setEvents(transformedEvents);
      } else {
        setError('Failed to load events');
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events from server');
      // Fallback to localStorage if API fails
      const savedEvents = localStorage.getItem('events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } finally {
      setLoading(false);
    }
  };

  // Save events to localStorage whenever events change (as backup)
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('events', JSON.stringify(events));
    }
  }, [events]);

  // CRUD Operations
  const addEvent = async (newEvent) => {
    try {
      const response = await kegiatanService.create(newEvent);

      if (response.data?.success) {
        // Transform the created event back to frontend format
        const createdEvent = transformEvent(response.data.data);

        setEvents(prev => [...prev, createdEvent]);
        return createdEvent;
      } else {
        throw new Error(response.data?.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const updateEvent = async (id, updatedEvent) => {
    try {
      const response = await kegiatanService.update(id, updatedEvent);

      if (response.data?.success) {
        // Transform the updated event back to frontend format
        const updatedEventData = transformEvent(response.data.data);

        setEvents(prev => prev.map(event =>
          event.id === id ? updatedEventData : event
        ));
        return updatedEventData;
      } else {
        throw new Error(response.data?.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (id) => {
    try {
      const response = await kegiatanService.delete(id);

      if (response.data?.success) {
        setEvents(prev => prev.filter(event => event.id !== id));
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const getEventById = (id) => {
    return events.find(event => event.id === id);
  };

  const getEventsByCategory = (category) => {
    return events.filter(event =>
      event.kategori?.nama_kategori?.toLowerCase() === category.toLowerCase()
    );
  };

  const searchEvents = async (keyword) => {
    try {
      setLoading(true);
      const response = await kegiatanService.search(keyword);

      if (response.data?.success) {
        // Transform the search results to frontend format
        const searchResults = response.data.data.map(transformEvent);

        return searchResults;
      } else {
        throw new Error(response.data?.message || 'Failed to search events');
      }
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsByCategory,
    searchEvents,
    refreshEvents: loadEvents, // Add refresh function
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

// Custom hook to use Event Context
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export default EventContext;
