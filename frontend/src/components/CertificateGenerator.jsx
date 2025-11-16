import jsPDF from 'jspdf';
import logo from '../assets/logo.png';
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

    // ===== BACKGROUND =====
    // Base ocean gradient background
    pdf.setFillColor(240, 250, 253); // Light blue #F0FAFD
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Gradient overlays (simulated with transparent rectangles)
    // Top gradient - blue to cyan
    pdf.setFillColor(74, 127, 167); // #4A7FA7
    pdf.setGState(new pdf.GState({ opacity: 0.15 }));
    pdf.rect(0, 0, pageWidth, 80, 'F');

    // Bottom gradient - indigo
    pdf.setFillColor(10, 25, 49); // #0A1931
    pdf.setGState(new pdf.GState({ opacity: 0.1 }));
    pdf.rect(0, pageHeight - 80, pageWidth, 80, 'F');

    // Reset opacity
    pdf.setGState(new pdf.GState({ opacity: 1 }));

    // ===== DECORATIVE OCEAN WAVES (TOP) =====
    // Large wave top-right
    pdf.setFillColor(179, 207, 229); // #B3CFE5
    pdf.setGState(new pdf.GState({ opacity: 0.6 }));
    pdf.ellipse(pageWidth - 40, 25, 60, 20, 'F');
    
    pdf.setFillColor(74, 127, 167); // #4A7FA7
    pdf.setGState(new pdf.GState({ opacity: 0.5 }));
    pdf.ellipse(pageWidth - 50, 30, 50, 18, 'F');
    
    pdf.setFillColor(10, 25, 49); // #0A1931
    pdf.setGState(new pdf.GState({ opacity: 0.4 }));
    pdf.ellipse(pageWidth - 60, 20, 40, 15, 'F');

    // Small wave top-left
    pdf.setFillColor(74, 127, 167);
    pdf.setGState(new pdf.GState({ opacity: 0.3 }));
    pdf.ellipse(50, 20, 35, 12, 'F');

    // ===== DECORATIVE OCEAN WAVES (BOTTOM) =====
    pdf.setFillColor(179, 207, 229);
    pdf.setGState(new pdf.GState({ opacity: 0.5 }));
    pdf.ellipse(60, pageHeight - 25, 55, 18, 'F');
    
    pdf.setFillColor(74, 127, 167);
    pdf.setGState(new pdf.GState({ opacity: 0.4 }));
    pdf.ellipse(40, pageHeight - 20, 45, 15, 'F');

    // Bottom-right accent
    pdf.setFillColor(10, 25, 49);
    pdf.setGState(new pdf.GState({ opacity: 0.3 }));
    pdf.ellipse(pageWidth - 45, pageHeight - 28, 40, 14, 'F');

    // Reset opacity for main content
    pdf.setGState(new pdf.GState({ opacity: 1 }));

    // Draw certificate template background image
    pdf.addImage(certificateTemplate, 'PNG', 0, 0, pageWidth, pageHeight);

    // ===== BORDER / FRAME =====
    // Outer border - gradient simulation
    pdf.setDrawColor(74, 127, 167); // #4A7FA7
    pdf.setLineWidth(1.5);
    pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Inner border
    pdf.setDrawColor(179, 207, 229); // #B3CFE5
    pdf.setLineWidth(0.5);
    pdf.rect(18, 18, pageWidth - 36, pageHeight - 36);

    // ===== LOGO DYNOTIX (TOP LEFT) =====
    // Background box untuk logo dengan efek glassmorphism
    const logoBoxX = 25;
    const logoBoxY = 28;
    const logoBoxWidth = 60;
    const logoBoxHeight = 28;
    
    pdf.setFillColor(255, 255, 255);
    pdf.setGState(new pdf.GState({ opacity: 0.95 }));
    pdf.roundedRect(logoBoxX, logoBoxY, logoBoxWidth, logoBoxHeight, 4, 4, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    
    // Border box
    pdf.setDrawColor(74, 127, 167);
    pdf.setLineWidth(0.8);
    pdf.roundedRect(logoBoxX, logoBoxY, logoBoxWidth, logoBoxHeight, 4, 4);
    
    // Add logo image from file
    try {
      // Add logo.png image
      const imgWidth = 40; // Width of logo in PDF
      const imgHeight = 12; // Height of logo in PDF
      const imgX = logoBoxX + (logoBoxWidth - imgWidth) / 2; // Center horizontally
      const imgY = logoBoxY + 4; // Top padding
      
      pdf.addImage(logo, 'PNG', imgX, imgY, imgWidth, imgHeight);
      
      // Tagline/subtitle below logo
      pdf.setTextColor(10, 25, 49);
      pdf.setFontSize(6.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Platform Manajemen Acara Digital', logoBoxX + logoBoxWidth / 2, logoBoxY + logoBoxHeight - 4, { align: 'center' });
      
      // Decorative corner circles
      pdf.setFillColor(74, 127, 167);
      const dotSize = 1.5;
      pdf.circle(logoBoxX + 3, logoBoxY + 3, dotSize, 'F');
      pdf.circle(logoBoxX + logoBoxWidth - 3, logoBoxY + 3, dotSize, 'F');
      pdf.circle(logoBoxX + 3, logoBoxY + logoBoxHeight - 3, dotSize, 'F');
      pdf.circle(logoBoxX + logoBoxWidth - 3, logoBoxY + logoBoxHeight - 3, dotSize, 'F');
    } catch (err) {
      console.log('Logo rendering error:', err);
      // Fallback to text if image fails
      pdf.setTextColor(74, 127, 167);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DYNOTIX', logoBoxX + logoBoxWidth / 2, logoBoxY + 14, { align: 'center' });
      
      pdf.setTextColor(10, 25, 49);
      pdf.setFontSize(6.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Platform Manajemen Acara Digital', logoBoxX + logoBoxWidth / 2, logoBoxY + logoBoxHeight - 4, { align: 'center' });
    }

    // ===== KONTEN UTAMA =====
    // Judul "SERTIFIKAT" dengan gaya modern
    pdf.setTextColor(74, 127, 167); // #4A7FA7
    pdf.setFontSize(46);
    pdf.setFont('helvetica', 'bold');
    const certText = 'SERTIFIKAT';
    const certTextWidth = pdf.getTextWidth(certText);
    pdf.text(certText, (pageWidth - certTextWidth) / 2, 70);

    // Subtitle formal
    pdf.setTextColor(10, 25, 49); // #0A1931
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const subtitleText = 'PARTISIPASI KEGIATAN';
    const subtitleWidth = pdf.getTextWidth(subtitleText);
    pdf.text(subtitleText, (pageWidth - subtitleWidth) / 2, 80);

    // Garis dekoratif di bawah subtitle
    pdf.setDrawColor(74, 127, 167);
    pdf.setLineWidth(0.5);
    const lineStart = (pageWidth - 90) / 2;
    pdf.line(lineStart, 83, lineStart + 90, 83);

    // Teks pembuka formal
    pdf.setTextColor(10, 25, 49);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const presentedText = 'Sertifikat ini diberikan dengan penuh penghargaan kepada';
    const presentedWidth = pdf.getTextWidth(presentedText);
    pdf.text(presentedText, (pageWidth - presentedWidth) / 2, 93);

    // Participant Name (LARGE AND PROMINENT)
    pdf.setTextColor(10, 25, 49);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    const nameWidth = pdf.getTextWidth(participantName);
    pdf.text(participantName, (pageWidth - nameWidth) / 2, 108);

    // Decorative underline for name
    pdf.setDrawColor(74, 127, 167);
    pdf.setLineWidth(0.8);
    const nameLineWidth = nameWidth + 20;
    pdf.line((pageWidth - nameLineWidth) / 2, 111, (pageWidth + nameLineWidth) / 2, 111);

    // Badge kategori dengan gaya modern
    const categoryText = `Sebagai ${category}`;
    const categoryTextWidth = pdf.getTextWidth(categoryText);
    const badgeWidth = categoryTextWidth + 12;
    const badgeHeight = 7;
    const badgeX = (pageWidth - badgeWidth) / 2;
    const badgeY = 116;
    
    pdf.setFillColor(179, 207, 229); // #B3CFE5
    pdf.setGState(new pdf.GState({ opacity: 0.8 }));
    pdf.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    
    pdf.setTextColor(10, 25, 49);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(categoryText, pageWidth / 2, badgeY + 5, { align: 'center' });

    // Deskripsi formal - line 1
    pdf.setTextColor(10, 25, 49);
    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'normal');
    const desc1 = 'atas partisipasi aktif dan kontribusi yang berharga dalam kegiatan';
    const desc1Width = pdf.getTextWidth(desc1);
    pdf.text(desc1, (pageWidth - desc1Width) / 2, 132);

    // Nama event (tebal dan menonjol)
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(74, 127, 167);
    const eventNameWidth = pdf.getTextWidth(`"${eventName}"`);
    pdf.text(`"${eventName}"`, (pageWidth - eventNameWidth) / 2, 142);

    // Tanggal event
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(10, 25, 49);
    const dateText = `yang diselenggarakan pada tanggal ${eventDate}`;
    const dateWidth = pdf.getTextWidth(dateText);
    pdf.text(dateText, (pageWidth - dateWidth) / 2, 151);

    // Teks apresiasi formal
    pdf.setFontSize(8.5);
    const recognitionText = 'Dedikasi dan komitmen Anda dalam pengembangan diri dan kontribusi kepada masyarakat sangat kami hargai.';
    const recognitionWidth = pdf.getTextWidth(recognitionText);
    pdf.text(recognitionText, (pageWidth - recognitionWidth) / 2, 160);

    // ===== AWARD SEAL (RIGHT SIDE) =====
    const sealX = pageWidth - 55;
    const sealY = 110;

    // Outer circle - gold/blue gradient effect
    pdf.setFillColor(74, 127, 167);
    pdf.circle(sealX, sealY, 22, 'F');

    // Inner circle
    pdf.setFillColor(246, 250, 253); // #F6FAFD
    pdf.circle(sealX, sealY, 18, 'F');

    // Star decoration
    pdf.setTextColor(74, 127, 167);
    pdf.setFontSize(28);
    pdf.text('★', sealX - 4.5, sealY + 6);

    // "ISTIMEWA" text
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(74, 127, 167);
    pdf.text('ISTIMEWA', sealX, sealY + 15, { align: 'center' });

    // Ribbon below seal
    pdf.setFillColor(74, 127, 167);
    pdf.setGState(new pdf.GState({ opacity: 0.7 }));
    pdf.rect(sealX - 8, sealY + 18, 6, 12, 'F');
    pdf.rect(sealX + 2, sealY + 18, 6, 12, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));

    // ===== BOTTOM SECTION =====
    // Kotak tanggal (kiri)
    pdf.setFillColor(246, 250, 253); // #F6FAFD
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(35, pageHeight - 45, 60, 20, 3, 3, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));

    pdf.setDrawColor(74, 127, 167);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(35, pageHeight - 45, 60, 20, 3, 3);

    pdf.setTextColor(10, 25, 49);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TANGGAL TERBIT', 65, pageHeight - 38, { align: 'center' });
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(issueDate, 65, pageHeight - 31, { align: 'center' });

    // Kotak tanda tangan (kanan)
    pdf.setFillColor(246, 250, 253);
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(pageWidth - 95, pageHeight - 45, 60, 20, 3, 3, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));

    pdf.setDrawColor(74, 127, 167);
    pdf.roundedRect(pageWidth - 95, pageHeight - 45, 60, 20, 3, 3);

    // Garis tanda tangan
    pdf.setDrawColor(10, 25, 49);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth - 85, pageHeight - 35, pageWidth - 45, pageHeight - 35);

    pdf.setTextColor(10, 25, 49);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TANDA TANGAN', pageWidth - 65, pageHeight - 29, { align: 'center' });
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Penyelenggara Resmi', pageWidth - 65, pageHeight - 25, { align: 'center' });

    // Nomor sertifikat (tengah bawah)
    pdf.setTextColor(74, 127, 167);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const certNumText = `Nomor Sertifikat: ${certificateNumber}`;
    const certNumWidth = pdf.getTextWidth(certNumText);
    pdf.text(certNumText, (pageWidth - certNumWidth) / 2, pageHeight - 10);

    // Teks verifikasi
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    const verifyText = 'Sertifikat ini dapat diverifikasi di situs resmi Dynotix';
    const verifyWidth = pdf.getTextWidth(verifyText);
    pdf.text(verifyText, (pageWidth - verifyWidth) / 2, pageHeight - 5);

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
