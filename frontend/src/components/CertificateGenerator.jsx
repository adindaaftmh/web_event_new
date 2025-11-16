import jsPDF from 'jspdf';
import certificateTemplate from '../assets/sertifikat_template.png';


export const generateModernCertificate = async (certificateData) => {
  try {
    const {
      participantName = 'Peserta',
      eventName = '-',
      eventDate = '-',
      certificateNumber = '-',
      issueDate = '-',
      organizer = 'Dynotix',
      category = 'Peserta'
    } = certificateData;

    // Create PDF in landscape A4
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 297;
    const pageHeight = 210;

    // Draw full-page certificate template background
    pdf.addImage(certificateTemplate, 'PNG', 0, 0, pageWidth, pageHeight);

    // ===== DYNAMIC TEXT ON TEMPLATE =====
    // Participant name – centered on the blank area above the line
    pdf.setTextColor(19, 48, 80); // dark blue
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.text(participantName, pageWidth / 2, 120, { align: 'center' });

    // Optional: category / role
    if (category) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      const categoryText = `Sebagai ${category}`;
      pdf.text(categoryText, pageWidth / 2, 132, { align: 'center' });
    }

    // Event information
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    const eventLine = `Dalam kegiatan: ${eventName}`;
    pdf.text(eventLine, pageWidth / 2, 142, { align: 'center' });

    const dateLine = `Tanggal kegiatan: ${eventDate}`;
    pdf.text(dateLine, pageWidth / 2, 150, { align: 'center' });

    // Issue date near "Tanggal Terbit" area (bottom-right)
    pdf.setFontSize(10);
    pdf.text(issueDate, pageWidth - 60, pageHeight - 27, { align: 'center' });

    // Certificate number at bottom center
    pdf.setFontSize(8);
    const certNumText = `Nomor Sertifikat: ${certificateNumber}`;
    pdf.text(certNumText, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Return the PDF
    return pdf;
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

/**
 * Download certificate as PDF
 */
export const downloadCertificate = async (certificateData) => {
  try {
    const pdf = await generateModernCertificate(certificateData);
    const fileName = `Sertifikat-${certificateData.eventName.replace(/\s+/g, '-')}-${certificateData.participantName.replace(/\s+/g, '-')}.pdf`;
    pdf.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return { success: false, error: error.message };
  }
};
