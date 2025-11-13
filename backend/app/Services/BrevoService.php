<?php

namespace App\Services;

use SendinBlue\Client\Configuration;
use SendinBlue\Client\Api\TransactionalEmailsApi;
use SendinBlue\Client\Model\SendSmtpEmail;
use GuzzleHttp\Client;

class BrevoService
{
    public static function sendEmail($to, $subject, $htmlContent)
    {
        $config = Configuration::getDefaultConfiguration()
            ->setApiKey('api-key', env('BREVO_API_KEY'));

        $apiInstance = new TransactionalEmailsApi(new Client(), $config);

        $email = new SendSmtpEmail([
            'subject' => $subject,
            'sender' => ['name' => env('MAIL_FROM_NAME'), 'email' => env('MAIL_FROM_ADDRESS')],
            'to' => [['email' => $to]],
            'htmlContent' => $htmlContent,
        ]);

        try {
            $apiInstance->sendTransacEmail($email);
            return true;
        } catch (\Exception $e) {
            \Log::error('Brevo Email Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate attractive OTP email template
     */
    public static function generateOtpEmailTemplate($otpCode, $expiresAt)
    {
        return '
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kode OTP Registrasi</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                            <!-- Header with gradient -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                    <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Verifikasi Email Anda</h1>
                                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Event Management System</p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 50px 40px;">
                                    <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Halo! 👋</h2>
                                    <p style="color: #555555; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                                        Terima kasih telah mendaftar! Untuk melanjutkan proses registrasi, silakan gunakan kode OTP berikut:
                                    </p>
                                    
                                    <!-- OTP Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; padding: 3px;">
                                                    <div style="background-color: #ffffff; border-radius: 10px; padding: 25px 40px;">
                                                        <p style="color: #999999; margin: 0 0 8px 0; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Kode OTP Anda</p>
                                                        <p style="color: #667eea; margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: \'Courier New\', monospace;">' . $otpCode . '</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Expiry Info -->
                                    <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 16px 20px; margin: 30px 0; border-radius: 8px;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding-right: 12px; vertical-align: top;">
                                                    <span style="font-size: 20px;">⏰</span>
                                                </td>
                                                <td>
                                                    <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                                                        <strong>Penting:</strong> Kode OTP ini berlaku hingga <strong>' . $expiresAt . '</strong>. Jangan bagikan kode ini kepada siapa pun.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <p style="color: #777777; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6;">
                                        Jika Anda tidak merasa melakukan registrasi, abaikan email ini.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center">
                                                <p style="color: #999999; margin: 0 0 15px 0; font-size: 14px;">
                                                    Email ini dikirim secara otomatis oleh sistem.<br>
                                                    Mohon tidak membalas email ini.
                                                </p>
                                                <div style="margin: 20px 0;">
                                                    <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">Bantuan</a>
                                                    <span style="color: #dee2e6;">|</span>
                                                    <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">Kebijakan Privasi</a>
                                                    <span style="color: #dee2e6;">|</span>
                                                    <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">Hubungi Kami</a>
                                                </div>
                                                <p style="color: #adb5bd; margin: 15px 0 0 0; font-size: 12px;">
                                                    © 2025 Event Management System. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ';
    }

    /**
     * Generate OTP email template for password reset
     */
    public static function generateForgotPasswordEmailTemplate($otpCode, $expiresAt)
    {
        return '
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password - Kode OTP</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                            <!-- Header with gradient -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
                                    <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 15V12M12 9H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Reset Password</h1>
                                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Event Management System</p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 50px 40px;">
                                    <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Permintaan Reset Password 🔒</h2>
                                    <p style="color: #555555; margin: 0 0 15px 0; font-size: 16px; line-height: 1.6;">
                                        Kami menerima permintaan untuk mengatur ulang password akun Anda.
                                    </p>
                                    <p style="color: #555555; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                                        Gunakan kode OTP berikut untuk melanjutkan proses reset password:
                                    </p>
                                    
                                    <!-- OTP Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 3px;">
                                                    <div style="background-color: #ffffff; border-radius: 10px; padding: 25px 40px;">
                                                        <p style="color: #999999; margin: 0 0 8px 0; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Kode OTP Reset Password</p>
                                                        <p style="color: #f5576c; margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: \'Courier New\', monospace;">' . $otpCode . '</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Expiry Info -->
                                    <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 16px 20px; margin: 30px 0; border-radius: 8px;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding-right: 12px; vertical-align: top;">
                                                    <span style="font-size: 20px;">⏰</span>
                                                </td>
                                                <td>
                                                    <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                                                        <strong>Penting:</strong> Kode OTP ini berlaku hingga <strong>' . $expiresAt . '</strong>. Jangan bagikan kode ini kepada siapa pun.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <!-- Security Warning -->
                                    <div style="background-color: #fff3cd; border-left: 4px solid #ff6b6b; padding: 16px 20px; margin: 30px 0; border-radius: 8px;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding-right: 12px; vertical-align: top;">
                                                    <span style="font-size: 20px;">🔒</span>
                                                </td>
                                                <td>
                                                    <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                                                        <strong>Keamanan Akun:</strong> Jika Anda tidak meminta reset password, segera abaikan email ini dan pastikan akun Anda aman.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center">
                                                <p style="color: #999999; margin: 0 0 15px 0; font-size: 14px;">
                                                    Email ini dikirim secara otomatis oleh sistem.<br>
                                                    Mohon tidak membalas email ini.
                                                </p>
                                                <div style="margin: 20px 0;">
                                                    <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">Bantuan</a>
                                                    <span style="color: #dee2e6;">|</span>
                                                    <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">Kebijakan Privasi</a>
                                                    <span style="color: #dee2e6;">|</span>
                                                    <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">Hubungi Kami</a>
                                                </div>
                                                <p style="color: #adb5bd; margin: 15px 0 0 0; font-size: 12px;">
                                                    © 2025 Event Management System. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ';
    }

    /**
     * Generate email template for contact message reply
     */
    public static function generateReplyContactTemplate($recipientName, $replyMessage, $originalMessage)
    {
        return '
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Balasan Pesan Anda</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                            <!-- Header with gradient -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #4A7FA7 0%, #1A3D63 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 2px;">DYNOTIX</h1>
                                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; letter-spacing: 0.5px;">Platform Manajemen Acara Digital</p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 50px 40px; background-color: #f9f9f9;">
                                    <h2 style="color: #1A3D63; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Halo ' . htmlspecialchars($recipientName) . ',</h2>
                                    
                                    <!-- Reply Message Box -->
                                    <div style="background-color: #ffffff; padding: 25px; border-radius: 12px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #4A7FA7;">
                                        <p style="color: #555555; margin: 0; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">' . nl2br(htmlspecialchars($replyMessage)) . '</p>
                                    </div>
                                    
                                    <!-- Original Message -->
                                    ' . (!empty($originalMessage) ? '
                                    <div style="background-color: #e9ecef; padding: 20px; border-left: 4px solid #6c757d; border-radius: 8px; margin-top: 30px;">
                                        <p style="color: #495057; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Pesan Asli Anda:</p>
                                        <p style="color: #212529; margin: 5px 0; font-size: 15px; font-weight: 600;">' . htmlspecialchars($originalMessage['subject']) . '</p>
                                        <p style="color: #6c757d; margin: 5px 0 15px 0; font-size: 13px; font-style: italic;">' . htmlspecialchars($originalMessage['date']) . '</p>
                                        <p style="color: #495057; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">' . htmlspecialchars($originalMessage['message']) . '</p>
                                    </div>
                                    ' : '') . '
                                    
                                    <div style="background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 16px 20px; margin: 30px 0 0 0; border-radius: 8px;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding-right: 12px; vertical-align: top;">
                                                    <span style="font-size: 20px;">💬</span>
                                                </td>
                                                <td>
                                                    <p style="color: #0c5460; margin: 0; font-size: 14px; line-height: 1.5;">
                                                        Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami kembali.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f1f1f1; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center">
                                                <h3 style="color: #1A3D63; margin: 0 0 10px 0; font-size: 18px; font-weight: 700; letter-spacing: 1px;">DYNOTIX</h3>
                                                <p style="color: #666666; margin: 0 0 15px 0; font-size: 14px;">
                                                    Platform Manajemen Acara Digital<br>
                                                    Email ini dikirim secara otomatis dari sistem Dynotix
                                                </p>
                                                <div style="margin: 20px 0;">
                                                    <a href="#" style="color: #4A7FA7; text-decoration: none; margin: 0 10px; font-size: 13px;">Bantuan</a>
                                                    <span style="color: #dee2e6;">|</span>
                                                    <a href="#" style="color: #4A7FA7; text-decoration: none; margin: 0 10px; font-size: 13px;">Hubungi Kami</a>
                                                </div>
                                                <p style="color: #adb5bd; margin: 15px 0 0 0; font-size: 12px;">
                                                    © 2025 Dynotix. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ';
    }
}
