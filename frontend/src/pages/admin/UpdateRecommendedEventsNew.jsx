import React, { useState, useEffect } from "react";
import { useSidebar } from "../../contexts/SidebarContext";
import { useRecommendedEvents } from "../../contexts/RecommendedEventsContext";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import { 
  Plus, Edit3, Trash2, X, Save, Calendar, MapPin, Tag, Eye, CheckCircle, 
  AlertCircle, Sparkles, Image as ImageIcon, Type, Layout, BookOpen, 
  Smile, Palette, Lightbulb, Heart, Edit, Clock, ChevronDown, Loader 
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

export default function UpdateRecommendedEvents() {
  const { isExpanded } = useSidebar();
  const { 
    bannerConfig, updateBanner, sectionText, updateSectionText,
    recommendedEvents, addEvent, updateEvent, deleteEvent, toggleEventActive 
  } = useRecommendedEvents();
  
  const [showModal, setShowModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: "", description: "", category: "", tags: [], date: "", time: "",
    location: "", gradient: "from-blue-500 to-indigo-600", icon: "book",
    buttonText: "Daftar Sekarang", buttonGradient: "from-blue-500 to-indigo-600",
    active: true, order: 1, schoolText: "SMKN 4 BOGOR", flyerImage: ""
  });
  const [bannerForm, setBannerForm] = useState(bannerConfig);
  const [textForm, setTextForm] = useState(sectionText);
  const [currentTag, setCurrentTag] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAdd = () => {
    setEditingEvent(null);
    setFormData({ 
      title: "", description: "", category: "", tags: [], date: "", time: "",
      location: "", gradient: "from-blue-500 to-indigo-600", icon: "book",
      buttonText: "Daftar Sekarang", buttonGradient: "from-blue-500 to-indigo-600",
      active: true, order: recommendedEvents.length + 1, schoolText: "SMKN 4 BOGOR", flyerImage: ""
    });
    setPreviewImage(null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData(event);
    setPreviewImage(event.flyerImage || null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus event rekomendasi ini?")) {
      deleteEvent(id);
      showMessage('success', 'Event berhasil dihapus');
    }
  };

  const handleSaveBanner = () => {
    if (!bannerForm.backgroundImage.trim() || !bannerForm.title.trim()) {
      showMessage('error', 'Semua field banner harus diisi');
      return;
    }
    updateBanner(bannerForm);
    setShowBannerModal(false);
    showMessage('success', 'Banner berhasil diperbarui');
  };

  const handleSaveText = () => {
    if (!textForm.heading.trim()) {
      showMessage('error', 'Judul section harus diisi');
      return;
    }
    updateSectionText(textForm);
    setShowTextModal(false);
    showMessage('success', 'Teks section berhasil diperbarui');
  };

  const handleSave = async () => {
    console.log('=== SAVING EVENT ===');
    console.log('Form Data:', formData);
    console.log('Selected File:', selectedFile);
    
    // Validasi detail
    const errors = [];
    if (!formData.title.trim()) errors.push('Judul');
    if (!formData.description.trim()) errors.push('Deskripsi');
    if (!formData.date) errors.push('Tanggal');
    if (!formData.time) errors.push('Waktu');
    if (!formData.location.trim()) errors.push('Lokasi');
    if (!formData.category.trim()) errors.push('Kategori');
    
    if (errors.length > 0) {
      showMessage('error', `Field wajib belum diisi: ${errors.join(', ')}`);
      console.log('Validation failed. Missing fields:', errors);
      return;
    }
    
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    if (!token) {
      showMessage('error', 'Token tidak ditemukan. Silakan login kembali');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }
    
    console.log('Validation passed. Uploading to backend...');
    setUploading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      
      // Append tags as array
      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach((tag, index) => {
          formDataToSend.append(`tags[${index}]`, tag);
        });
      }
      
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('gradient', formData.gradient);
      formDataToSend.append('icon', formData.icon);
      formDataToSend.append('buttonText', formData.buttonText);
      formDataToSend.append('buttonGradient', formData.buttonGradient);
      formDataToSend.append('schoolText', formData.schoolText);
      formDataToSend.append('active', formData.active ? '1' : '0');
      formDataToSend.append('order', formData.order);
      
      // Upload file if exists
      if (selectedFile) {
        formDataToSend.append('flyerImage', selectedFile);
        console.log('Image file attached:', selectedFile.name);
      }
      
      // Debug: Log all FormData contents
      console.log('FormData contents:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], '=', pair[1]);
      }
      
      if (editingEvent) {
        const response = await axios.post(
          `${API_URL}/recommended-events/${editingEvent.id}?_method=PUT`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        console.log('Update response:', response.data);
        
        // Update context dengan data dari backend
        updateEvent(editingEvent.id, response.data.data);
        showMessage('success', '✓ Event berhasil diperbarui');
      } else {
        const response = await axios.post(
          `${API_URL}/recommended-events`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        console.log('Create response:', response.data);
        
        // Tambah ke context dengan data dari backend
        addEvent(response.data.data);
        showMessage('success', '✓ Event baru berhasil ditambahkan');
      }
      
      setShowModal(false);
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('=== ERROR SAVING EVENT ===');
      console.error('Error object:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      if (error.code === 'ERR_NETWORK') {
        showMessage('error', '❌ Backend server tidak berjalan. Jalankan: php artisan serve');
      } else if (error.response?.status === 401) {
        showMessage('error', '❌ Sesi berakhir. Silakan login kembali');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else if (error.response?.status === 422) {
        // Detailed validation errors
        const errors = error.response?.data?.errors;
        if (errors) {
          console.error('Validation errors:', errors);
          const errorMessages = Object.entries(errors).map(([field, messages]) => {
            return `${field}: ${messages.join(', ')}`;
          });
          showMessage('error', `❌ Validasi gagal:\n${errorMessages.join('\n')}`);
        } else {
          showMessage('error', `❌ Validasi gagal: ${error.response?.data?.message || 'Unknown error'}`);
        }
      } else {
        showMessage('error', `❌ ${error.response?.data?.message || 'Gagal menyimpan event. Cek console untuk detail.'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = (id) => {
    const event = recommendedEvents.find(e => e.id === id);
    toggleEventActive(id);
    showMessage('success', `Event ${!event.active ? 'diaktifkan' : 'dinonaktifkan'}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Tanggal";
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "Waktu";
    return `${timeStr} WIB`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    } else {
      showMessage('error', 'File harus berupa gambar');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setBannerForm({ ...bannerForm, backgroundImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const gradientOptions = [
    { value: 'from-blue-500 to-indigo-600', label: 'Blue' },
    { value: 'from-green-500 to-emerald-600', label: 'Green' },
    { value: 'from-purple-500 to-pink-600', label: 'Purple' },
    { value: 'from-amber-500 to-orange-600', label: 'Orange' },
    { value: 'from-teal-500 to-cyan-600', label: 'Teal' },
    { value: 'from-rose-500 to-pink-600', label: 'Rose' },
  ];

  const iconOptions = [
    { value: 'book', label: 'Book', icon: BookOpen },
    { value: 'smile', label: 'Smile', icon: Smile },
    { value: 'palette', label: 'Palette', icon: Palette },
    { value: 'lightbulb', label: 'Lightbulb', icon: Lightbulb },
    { value: 'heart', label: 'Heart', icon: Heart },
    { value: 'edit', label: 'Edit', icon: Edit },
  ];

  const getIconComponent = (iconName) => {
    const iconMap = { book: BookOpen, smile: Smile, palette: Palette, lightbulb: Lightbulb, heart: Heart, edit: Edit };
    return iconMap[iconName] || BookOpen;
  };

  return (
    <AdminLayout>
      <div className="flex-1">
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0.6;
            }
            25% {
              transform: translateY(-30px) translateX(15px) scale(1.1);
              opacity: 0.8;
            }
            50% {
              transform: translateY(-50px) translateX(-15px) scale(0.9);
              opacity: 1;
            }
            75% {
              transform: translateY(-30px) translateX(8px) scale(1.05);
              opacity: 0.7;
            }
          }
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
        `}</style>

        {/* Animated Background Bubbles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-32 left-[15%] w-24 h-24 border-2 border-blue-400/50 rounded-full animate-float bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
          <div className="absolute top-64 right-[20%] w-32 h-32 border-2 border-purple-400/45 rounded-full animate-float bg-gradient-to-br from-purple-200/20 to-pink-300/15" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
        </div>
        <div className="relative z-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0A1931]">Update Event Menarik</h1>
                <p className="text-[#4A7FA7]">Kelola tampilan section "Event Menarik di SMKN 4 BOGOR" pada halaman utama</p>
              </div>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full animate-pulse"></div>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border-2 border-green-200 text-green-800' : 'bg-red-50 border-2 border-red-200 text-red-800'}`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Banner Configuration */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-[#4A7FA7]/20 p-6 lg:p-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#0A1931] flex items-center gap-2">
                  <Layout className="w-6 h-6 text-[#4A7FA7]" />
                  Banner Background Section
                </h2>
                <p className="text-sm text-[#4A7FA7] mt-1.5">Kustomisasi banner header "Event Menarik di SMKN 4 BOGOR"</p>
              </div>
              <button onClick={() => { 
                setBannerForm(bannerConfig); 
                setPreviewImage(null); 
                setSelectedFile(null); 
                setShowBannerModal(true); 
              }}
                className="px-6 py-3.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-xl font-semibold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />Edit Banner
              </button>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden border-2 border-[#4A7FA7]/20 shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bannerConfig.backgroundImage})` }}></div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A1931]/85 via-[#1A3D63]/80 to-[#0A1931]/90"></div>
              <div className="absolute inset-0 flex items-center justify-center text-center px-8">
                <div>
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-2xl">{bannerConfig.title}</h2>
                  <p className="text-base text-white/90 max-w-2xl mx-auto drop-shadow-lg leading-relaxed line-clamp-2">{bannerConfig.subtitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Text Configuration */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-[#4A7FA7]/20 p-6 lg:p-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#0A1931] flex items-center gap-2">
                  <Type className="w-6 h-6 text-[#4A7FA7]" />
                  Section Text Configuration
                </h2>
                <p className="text-sm text-[#4A7FA7] mt-1.5">Kustomisasi teks heading dan subheading sidebar</p>
              </div>
              <button onClick={() => { setTextForm(sectionText); setShowTextModal(true); }}
                className="px-6 py-3.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-xl font-semibold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />Edit Text
              </button>
            </div>
            <div className="bg-gradient-to-br from-[#F6FAFD] to-white rounded-2xl border-2 border-[#4A7FA7]/20 p-8 text-center shadow-inner">
              <h3 className="text-2xl md:text-3xl font-bold text-[#0A1931] mb-3">{sectionText.heading}</h3>
              <div className="w-32 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mx-auto mb-4"></div>
              <p className="text-[#4A7FA7] text-lg">{sectionText.subheading}</p>
            </div>
          </div>

          {/* Event Cards Management */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-[#4A7FA7]/20 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#0A1931] flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#4A7FA7]" />
                  Daftar Event Card
                </h2>
                <p className="text-sm text-[#4A7FA7] mt-1.5">Total: <span className="font-semibold">{recommendedEvents.length} event</span> | <span className="font-semibold">{recommendedEvents.filter(e => e.active).length} aktif</span></p>
              </div>
              <button onClick={handleAdd}
                className="px-6 py-3.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-xl font-semibold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                <Plus className="w-5 h-5" />Tambah Event Baru
              </button>
            </div>

            {recommendedEvents.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-[#4A7FA7]/40 rounded-2xl">
                <Sparkles className="w-12 h-12 text-[#4A7FA7] mx-auto mb-4" />
                <p className="text-[#0A1931] text-xl font-bold">Belum ada event card</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedEvents.sort((a, b) => a.order - b.order).map((event) => {
                  const IconComponent = getIconComponent(event.icon);
                  return (
                  <div key={event.id} className="relative bg-white border-2 border-[#4A7FA7]/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                    <div className={`relative h-56 bg-gradient-to-br ${event.gradient} overflow-hidden`}>
                      {/* Flyer Image Background if exists */}
                      {event.flyerImage && (
                        <img 
                          src={event.flyerImage} 
                          alt={event.title} 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className={`absolute inset-0 ${event.flyerImage ? 'bg-black/30' : 'bg-black/10'}`}></div>
                      <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                        <div>
                          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <IconComponent className="w-12 h-12" />
                          </div>
                          <h4 className="text-xl font-bold mb-1 px-4 line-clamp-1">{event.title.toUpperCase()}</h4>
                          <p className="text-sm opacity-90">SMKN 4 BOGOR</p>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${event.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                          {event.active ? '✓ Aktif' : '✕ Nonaktif'}
                        </div>
                      </div>
                      <div className="absolute top-3 left-3">
                        <div className="px-3 py-1.5 bg-white/95 text-gray-900 rounded-full text-xs font-bold shadow-lg">#{event.order}</div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-[#0A1931] text-lg mb-2 line-clamp-1 group-hover:text-[#4A7FA7] transition-colors">{event.title}</h3>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{event.category}</span>
                        {event.tags?.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                        ))}
                      </div>
                      <p className="text-sm text-[#4A7FA7]/80 mb-3 line-clamp-2">{event.description}</p>
                      <div className="space-y-1.5 mb-4 text-xs">
                        <div className="flex items-center gap-2 text-[#4A7FA7]">
                          <Calendar className="w-3.5 h-3.5" /><span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#4A7FA7]">
                          <Clock className="w-3.5 h-3.5" /><span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#4A7FA7]">
                          <MapPin className="w-3.5 h-3.5" /><span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(event)} className="flex-1 px-3 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-lg font-semibold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                          <Edit3 className="w-4 h-4" /><span className="hidden sm:inline text-sm">Edit</span>
                        </button>
                        <button onClick={() => toggleActive(event.id)} className={`flex-1 px-3 py-2.5 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${event.active ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                          <Eye className="w-4 h-4" /><span className="hidden sm:inline text-sm">{event.active ? 'Off' : 'On'}</span>
                        </button>
                        <button onClick={() => handleDelete(event.id)} className="px-3 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all shadow-md">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Banner Modal */}
          {showBannerModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white p-5 rounded-t-2xl z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Layout className="w-5 h-5" />
                      <div><h2 className="text-xl font-bold">Edit Banner Background</h2></div>
                    </div>
                    <button onClick={() => setShowBannerModal(false)} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {/* Image Upload with Drag & Drop */}
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">
                      Upload Gambar Background <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Drag & Drop Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        dragOver 
                          ? 'border-[#4A7FA7] bg-[#4A7FA7]/10' 
                          : 'border-gray-300 hover:border-[#4A7FA7]/50 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      {previewImage || bannerForm.backgroundImage ? (
                        <div className="relative">
                          <img 
                            src={previewImage || bannerForm.backgroundImage} 
                            alt="Preview" 
                            className="max-h-48 mx-auto rounded-lg shadow-lg object-cover"
                          />
                          <div className="mt-4 text-sm text-[#4A7FA7] font-medium">
                            ✓ Gambar berhasil dipilih. Klik atau drag gambar baru untuk mengubah
                          </div>
                        </div>
                      ) : (
                        <div className="py-6">
                          <div className="w-16 h-16 bg-[#4A7FA7]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-8 h-8 text-[#4A7FA7]" />
                          </div>
                          <p className="text-[#0A1931] font-semibold mb-2">
                            {dragOver ? 'Lepas gambar di sini' : 'Drag & Drop gambar di sini'}
                          </p>
                          <p className="text-sm text-[#4A7FA7] mb-3">atau</p>
                          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-lg font-semibold text-sm">
                            Pilih File
                          </div>
                          <p className="text-xs text-[#4A7FA7] mt-3">Format: JPG, PNG, WebP (Max 5MB)</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Optional: URL Input sebagai alternatif */}
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-xs text-[#4A7FA7] font-medium">atau gunakan URL</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>
                      <input 
                        type="url" 
                        value={bannerForm.backgroundImage.startsWith('data:') ? '' : bannerForm.backgroundImage}
                        onChange={(e) => {
                          setBannerForm({ ...bannerForm, backgroundImage: e.target.value });
                          setPreviewImage(null);
                          setSelectedFile(null);
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] text-sm" 
                        placeholder="https://images.unsplash.com/..." 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Judul Banner <span className="text-red-500">*</span></label>
                    <input type="text" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]" placeholder="Event Menarik di SMKN 4 BOGOR" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Subtitle Banner <span className="text-red-500">*</span></label>
                    <textarea value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] resize-none" placeholder="Deskripsi banner..." />
                  </div>
                  <div className="flex gap-3 pt-5 border-t">
                    <button onClick={() => setShowBannerModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 border border-gray-300">
                      Batal
                    </button>
                    <button onClick={handleSaveBanner} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931]">
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Text Modal */}
          {showTextModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                <div className="sticky top-0 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white p-5 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Type className="w-5 h-5" />
                      <h2 className="text-xl font-bold">Edit Section Text</h2>
                    </div>
                    <button onClick={() => setShowTextModal(false)} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Heading Section <span className="text-red-500">*</span></label>
                    <input type="text" value={textForm.heading} onChange={(e) => setTextForm({ ...textForm, heading: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]" placeholder="Event menarik di SMKN 4 BOGOR" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Subheading Section</label>
                    <input type="text" value={textForm.subheading} onChange={(e) => setTextForm({ ...textForm, subheading: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]" placeholder="Jangan lewatkan kesempatan emas ini!" />
                  </div>
                  <div className="flex gap-3 pt-5 border-t">
                    <button onClick={() => setShowTextModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 border border-gray-300">
                      Batal
                    </button>
                    <button onClick={handleSaveText} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931]">
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Event Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white p-5 rounded-t-2xl z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {editingEvent ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      <h2 className="text-xl font-bold">{editingEvent ? 'Edit' : 'Tambah'} Event Card</h2>
                    </div>
                    <button onClick={() => setShowModal(false)} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Judul Event <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]" placeholder="Pelatihan IT Intensif" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Deskripsi <span className="text-red-500">*</span></label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] resize-none" placeholder="Deskripsi event..." />
                  </div>

                  {/* Flyer Image Upload */}
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Upload Flyer Event (Opsional)</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                        dragOver 
                          ? 'border-[#4A7FA7] bg-[#4A7FA7]/10' 
                          : 'border-gray-300 hover:border-[#4A7FA7]/50 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPreviewImage(reader.result);
                              setFormData({ ...formData, flyerImage: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      {(previewImage || formData.flyerImage) ? (
                        <div className="relative">
                          <img 
                            src={previewImage || formData.flyerImage} 
                            alt="Flyer Preview" 
                            className="max-h-32 mx-auto rounded-lg shadow-md object-cover"
                          />
                          <div className="mt-2 text-sm text-[#4A7FA7] font-medium">
                            ✓ Flyer berhasil dipilih. Klik untuk mengubah
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, flyerImage: "" });
                              setPreviewImage(null);
                              setSelectedFile(null);
                            }}
                            className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                          >
                            Hapus Flyer
                          </button>
                        </div>
                      ) : (
                        <div className="py-4">
                          <div className="w-12 h-12 bg-[#4A7FA7]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <ImageIcon className="w-6 h-6 text-[#4A7FA7]" />
                          </div>
                          <p className="text-[#0A1931] font-semibold text-sm mb-1">
                            {dragOver ? 'Lepas gambar di sini' : 'Drag & Drop flyer di sini'}
                          </p>
                          <p className="text-xs text-[#4A7FA7] mb-2">atau klik untuk memilih file</p>
                          <p className="text-xs text-gray-500">Format: JPG, PNG (Opsional)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* School Text Field */}
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Teks Sekolah</label>
                    <input type="text" value={formData.schoolText} onChange={(e) => setFormData({ ...formData, schoolText: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]" 
                      placeholder="SMKN 4 BOGOR" />
                    <p className="text-xs text-[#4A7FA7] mt-1">Teks yang ditampilkan di bawah judul event</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2">Kategori <span className="text-red-500">*</span></label>
                      <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] cursor-pointer">
                        <option value="">Pilih Kategori</option>
                        <option value="Olahraga">Olahraga</option>
                        <option value="Edukasi">Edukasi</option>
                        <option value="Seni Budaya">Seni Budaya</option>
                        <option value="Hiburan">Hiburan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2">Lokasi <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]" placeholder="Lab Komputer" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2">Tanggal <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        value={formData.date} 
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]" 
                      />
                      <p className="text-xs text-[#4A7FA7] mt-1">Pilih tanggal event</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2">Waktu <span className="text-red-500">*</span></label>
                      <input 
                        type="time" 
                        value={formData.time} 
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]" 
                      />
                      <p className="text-xs text-[#4A7FA7] mt-1">Pilih waktu event</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]" placeholder="Ketik tag dan enter" />
                      <button onClick={handleAddTag} className="px-4 py-2 bg-[#4A7FA7] text-white rounded-lg hover:bg-[#1A3D63]">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {formData.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-2">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="text-red-500 hover:text-red-700">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Icon</label>
                    <div className="grid grid-cols-6 gap-3">
                      {iconOptions.map((option) => {
                        const IconComp = option.icon;
                        return (
                          <button key={option.value} onClick={() => setFormData({ ...formData, icon: option.value })}
                            className={`h-14 rounded-xl flex items-center justify-center border-3 ${formData.icon === option.value ? 'border-[#4A7FA7] bg-[#4A7FA7]/10' : 'border-gray-200 bg-gray-50'}`}>
                            <IconComp className="w-6 h-6 text-[#0A1931]" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Teks Tombol</label>
                    <input type="text" value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]" placeholder="Daftar Sekarang" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer">
                      <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-[#4A7FA7] rounded" />
                      <span className="text-sm font-semibold text-[#0A1931]">Aktif (tampilkan di homepage)</span>
                    </label>
                  </div>

                  {/* Preview Card */}
                  <div className="border-t pt-5">
                    <label className="block text-sm font-bold text-[#0A1931] mb-3">Preview Event Card</label>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="max-w-sm mx-auto bg-white border-2 border-[#4A7FA7]/20 rounded-2xl overflow-hidden shadow-lg">
                        <div className={`relative h-56 bg-gradient-to-br ${formData.gradient} overflow-hidden`}>
                          {/* Flyer Image Background if exists */}
                          {formData.flyerImage && (
                            <img 
                              src={formData.flyerImage} 
                              alt="Flyer" 
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                            <div>
                              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                {(() => {
                                  const IconComp = getIconComponent(formData.icon);
                                  return <IconComp className="w-12 h-12" />;
                                })()}
                              </div>
                              <h4 className="text-xl font-bold mb-1 px-4 line-clamp-1">
                                {formData.title || "Judul Event"}
                              </h4>
                              <p className="text-sm opacity-90 font-medium">
                                {formData.schoolText || "SMKN 4 BOGOR"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {formData.category && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                {formData.category}
                              </span>
                            )}
                            {formData.tags?.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                            ))}
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                            {formData.title || "Judul Event"}
                          </h3>
                          
                          <p className="text-gray-600 text-xs mb-3 leading-relaxed line-clamp-2">
                            {formData.description || "Deskripsi event akan ditampilkan di sini"}
                          </p>
                          
                          <div className="space-y-1 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(formData.date)}, {formatTime(formData.time)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span>{formData.location || "Lokasi"}</span>
                            </div>
                          </div>
                          
                          <button className={`w-full py-2 bg-gradient-to-r ${formData.buttonGradient} text-white text-sm font-semibold rounded-lg`}>
                            {formData.buttonText || "Button"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-5 border-t">
                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 border border-gray-300">
                      Batal
                    </button>
                    <button
                    onClick={handleSave}
                    disabled={uploading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingEvent ? 'Update' : 'Tambah'} Event
                      </>
                    )}
                  </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
