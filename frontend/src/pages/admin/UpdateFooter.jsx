import React, { useEffect, useState } from "react";
import { useSidebar } from "../../contexts/SidebarContext";
import AdminLayout from "../../components/AdminLayout";
import { LayoutPanelTop, Save, AlertCircle, CheckCircle } from "lucide-react";
import apiClient from "../../config/api";
import { useFooter } from "../../contexts/FooterContext";

export default function UpdateFooter() {
  const { isExpanded } = useSidebar();
  const { footer, loading: footerLoading, refreshFooter } = useFooter();
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    brand_title: "",
    brand_subtitle: "",
    brand_description: "",
    contact_title: "",
    contact_address: "",
    contact_email: "",
    contact_phone: "",
    social_title: "",
    social_description: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    linkedin_url: "",
    copyright_text: "",
  });

  useEffect(() => {
    if (footer) {
      setFormData({
        brand_title: footer.brand_title || "",
        brand_subtitle: footer.brand_subtitle || "",
        brand_description: footer.brand_description || "",
        contact_title: footer.contact_title || "",
        contact_address: footer.contact_address || "",
        contact_email: footer.contact_email || "",
        contact_phone: footer.contact_phone || "",
        social_title: footer.social_title || "",
        social_description: footer.social_description || "",
        facebook_url: footer.facebook_url || "",
        instagram_url: footer.instagram_url || "",
        twitter_url: footer.twitter_url || "",
        linkedin_url: footer.linkedin_url || "",
        copyright_text: footer.copyright_text || "",
      });
    }
  }, [footer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsSaving(true);

    try {
      await apiClient.put("/footer", formData);
      setMessage({ type: "success", text: "Footer berhasil diperbarui." });
      await refreshFooter();
    } catch (error) {
      console.error("Error updating footer:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Gagal menyimpan footer. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1">
        <div className="relative z-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                <LayoutPanelTop className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0A1931]">Edit Footer Website</h1>
                <p className="text-[#4A7FA7]">Atur teks dan link media sosial yang tampil di bagian bawah halaman.</p>
              </div>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full animate-pulse" />
          </div>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-50 border-2 border-green-200 text-green-800"
                  : "bg-red-50 border-2 border-red-200 text-red-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium whitespace-pre-line">{message.text}</span>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-[#4A7FA7]/20 p-6 lg:p-8">
            {footerLoading && !footer ? (
              <p className="text-sm text-[#4A7FA7]">Memuat data footer...</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-sm font-bold text-[#0A1931] mb-3">Brand</h2>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Nama Brand
                        </label>
                        <input
                          type="text"
                          name="brand_title"
                          value={formData.brand_title}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm"
                          placeholder="DYNOTIX"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Subjudul Brand
                        </label>
                        <input
                          type="text"
                          name="brand_subtitle"
                          value={formData.brand_subtitle}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm"
                          placeholder="EVENT PLATFORM"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Deskripsi Brand
                        </label>
                        <textarea
                          name="brand_description"
                          value={formData.brand_description}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm resize-none"
                          placeholder="Deskripsi singkat platform di bagian kiri footer"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-[#0A1931] mb-3">Kontak</h2>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Judul Kolom Kontak
                        </label>
                        <input
                          type="text"
                          name="contact_title"
                          value={formData.contact_title}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm"
                          placeholder="Kontak"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Alamat
                        </label>
                        <textarea
                          name="contact_address"
                          value={formData.contact_address}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm resize-none"
                          placeholder="Alamat lengkap yang tampil di footer"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="contact_email"
                            value={formData.contact_email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm"
                            placeholder="dynotix@gmail.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                            No. Telepon / WhatsApp
                          </label>
                          <input
                            type="text"
                            name="contact_phone"
                            value={formData.contact_phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm"
                            placeholder="+62 ..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                  <div>
                    <h2 className="text-sm font-bold text-[#0A1931] mb-3">Ikuti Kami</h2>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Judul Kolom Sosial
                        </label>
                        <input
                          type="text"
                          name="social_title"
                          value={formData.social_title}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm"
                          placeholder="Ikuti Kami"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Deskripsi Singkat
                        </label>
                        <textarea
                          name="social_description"
                          value={formData.social_description}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm resize-none"
                          placeholder="Teks kecil di bawah judul Ikuti Kami"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-[#0A1931] mb-3">Link Media Sosial</h2>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Facebook URL
                        </label>
                        <input
                          type="url"
                          name="facebook_url"
                          value={formData.facebook_url}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm"
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          name="instagram_url"
                          value={formData.instagram_url}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Twitter URL
                        </label>
                        <input
                          type="url"
                          name="twitter_url"
                          value={formData.twitter_url}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm"
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          name="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-sm"
                          placeholder="https://linkedin.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                      Teks Copyright (baris paling bawah)
                    </label>
                    <input
                      type="text"
                      name="copyright_text"
                      value={formData.copyright_text}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent text-xs"
                      placeholder="© 2025 DYNOTIX Event Platform. All rights reserved."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (footer) {
                          setFormData({
                            brand_title: footer.brand_title || "",
                            brand_subtitle: footer.brand_subtitle || "",
                            brand_description: footer.brand_description || "",
                            contact_title: footer.contact_title || "",
                            contact_address: footer.contact_address || "",
                            contact_email: footer.contact_email || "",
                            contact_phone: footer.contact_phone || "",
                            social_title: footer.social_title || "",
                            social_description: footer.social_description || "",
                            facebook_url: footer.facebook_url || "",
                            instagram_url: footer.instagram_url || "",
                            twitter_url: footer.twitter_url || "",
                            linkedin_url: footer.linkedin_url || "",
                            copyright_text: footer.copyright_text || "",
                          });
                        }
                        setMessage({ type: "", text: "" });
                      }}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all border border-gray-300"
                    >
                      Reset ke Data Terakhir
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-sm">
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
