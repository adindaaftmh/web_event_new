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
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 30px;
                    background: linear-gradient(135deg, #4A7FA7 0%, #1A3D63 100%);
                    border-radius: 10px;
                    color: white;
                }
                .header h1 {
                    color: white;
                    margin: 0;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 2px;
                }
                .header p {
                    color: white;
                    opacity: 0.9;
                    margin: 10px 0 0 0;
                    font-size: 14px;
                }
                .otp-container {
                    text-align: center;
                    margin: 30px 0;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    border: 2px dashed #dee2e6;
                }
                .otp-code {
                    font-size: 36px;
                    font-weight: bold;
                    color: #4A7FA7;
                    letter-spacing: 8px;
                    font-family: \'Courier New\', monospace;
                    margin: 10px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                    color: #6c757d;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>DYNOTIX</h1>
                    <p>Platform Manajemen Acara Digital</p>
                    <h2 style="margin: 20px 0 0 0; font-size: 20px; font-weight: normal;">🔑 Kode OTP Registrasi</h2>
                </div>

                <p>Halo!</p>
                
                <p>Anda telah meminta kode OTP untuk registrasi akun di <strong>Dynotix - Platform Manajemen Acara Digital</strong>.</p>

                <div class="otp-container">
                    <p><strong>Kode OTP Anda:</strong></p>
                    <div class="otp-code">' . $otpCode . '</div>
                    <p><small>Masukkan kode ini di halaman registrasi</small></p>
                </div>

                <p style="color: #666; font-size: 14px;">Jika Anda tidak meminta kode ini, abaikan email ini.</p>

                <div class="footer">
                    <p><strong>Dynotix</strong> - Platform Manajemen Acara Digital</p>
                    <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
                    <p>&copy; 2025 Dynotix. All rights reserved.</p>
                </div>
            </div>
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
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 30px;
                    background: linear-gradient(135deg, #4A7FA7 0%, #1A3D63 100%);
                    border-radius: 10px;
                    color: white;
                }
                .header h1 {
                    color: white;
                    margin: 0;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 2px;
                }
                .header p {
                    color: white;
                    opacity: 0.9;
                    margin: 10px 0 0 0;
                    font-size: 14px;
                }
                .otp-container {
                    text-align: center;
                    margin: 30px 0;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    border: 2px dashed #dee2e6;
                }
                .otp-code {
                    font-size: 36px;
                    font-weight: bold;
                    color: #4A7FA7;
                    letter-spacing: 8px;
                    font-family: \'Courier New\', monospace;
                    margin: 10px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                    color: #6c757d;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>DYNOTIX</h1>
                    <p>Platform Manajemen Acara Digital</p>
                    <h2 style="margin: 20px 0 0 0; font-size: 20px; font-weight: normal;">🔒 Reset Password</h2>
                </div>

                <p>Halo!</p>
                
                <p>Anda telah meminta untuk mereset password akun Anda di <strong>Dynotix - Platform Manajemen Acara Digital</strong>.</p>

                <div class="otp-container">
                    <p><strong>Kode OTP Anda:</strong></p>
                    <div class="otp-code">' . $otpCode . '</div>
                    <p><small>Masukkan kode ini di halaman reset password</small></p>
                </div>

                <p style="color: #666; font-size: 14px;">Jika Anda tidak meminta reset password, segera abaikan email ini dan pastikan akun Anda aman.</p>

                <div class="footer">
                    <p><strong>Dynotix</strong> - Platform Manajemen Acara Digital</p>
                    <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
                    <p>&copy; 2025 Dynotix. All rights reserved.</p>
                </div>
            </div>
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
