import React, { createContext, useContext, useState, useEffect } from 'react';
import { kegiatanService } from '../services/apiService';

// Create Event Context
const EventContext = createContext();

// Event Provider Component
export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const transformedEvents = response.data.data.map(event => ({
          id: event.id,
          judul_kegiatan: event.judul_kegiatan,
          lokasi_kegiatan: event.lokasi_kegiatan,
          waktu_mulai: event.waktu_mulai,
          waktu_selesai: event.waktu_berakhir,
          flyer_kegiatan: event.flyer_kegiatan ? `http://localhost:8000/storage/${event.flyer_kegiatan}` : null,
          deskripsi_kegiatan: event.deskripsi_kegiatan,
          kategori: event.kategori ? { nama_kategori: event.kategori.nama_kategori } : { nama_kategori: '' },
          kapasitas_peserta: event.kapasitas_peserta,
          harga_tiket: event.harga_tiket,
          kontak_panitia: event.kontak_panitia,
        }));
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
        const createdEvent = {
          id: response.data.data.id,
          judul_kegiatan: response.data.data.judul_kegiatan,
          lokasi_kegiatan: response.data.data.lokasi_kegiatan,
          waktu_mulai: response.data.data.waktu_mulai,
          waktu_selesai: response.data.data.waktu_berakhir,
          flyer_kegiatan: response.data.data.flyer_kegiatan ? `http://localhost:8000/storage/${response.data.data.flyer_kegiatan}` : null,
          deskripsi_kegiatan: response.data.data.deskripsi_kegiatan,
          kategori: response.data.data.kategori ? { nama_kategori: response.data.data.kategori.nama_kategori } : { nama_kategori: '' },
          kapasitas_peserta: response.data.data.kapasitas_peserta,
          harga_tiket: response.data.data.harga_tiket,
          kontak_panitia: response.data.data.kontak_panitia,
        };

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
        const updatedEventData = {
          id: response.data.data.id,
          judul_kegiatan: response.data.data.judul_kegiatan,
          lokasi_kegiatan: response.data.data.lokasi_kegiatan,
          waktu_mulai: response.data.data.waktu_mulai,
          waktu_selesai: response.data.data.waktu_berakhir,
          flyer_kegiatan: response.data.data.flyer_kegiatan ? `http://localhost:8000/storage/${response.data.data.flyer_kegiatan}` : null,
          deskripsi_kegiatan: response.data.data.deskripsi_kegiatan,
          kategori: response.data.data.kategori ? { nama_kategori: response.data.data.kategori.nama_kategori } : { nama_kategori: '' },
          kapasitas_peserta: response.data.data.kapasitas_peserta,
          harga_tiket: response.data.data.harga_tiket,
          kontak_panitia: response.data.data.kontak_panitia,
        };

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

  const value = {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsByCategory,
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
