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
                .message-box {
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    border-left: 4px solid #4A7FA7;
                }
                .original-message {
                    background: #e9ecef;
                    padding: 15px;
                    border-left: 3px solid #6c757d;
                    margin-top: 20px;
                    font-size: 14px;
                    border-radius: 6px;
                }
                .greeting {
                    font-size: 18px;
                    font-weight: bold;
                    color: #1A3D63;
                    margin-bottom: 10px;
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
                    <h2 style="margin: 20px 0 0 0; font-size: 20px; font-weight: normal;">Balasan Pesan Anda</h2>
                </div>

                <div class="greeting">Halo ' . htmlspecialchars($recipientName) . ',</div>

                <div class="message-box">
                    <p style="margin: 0;">' . nl2br(htmlspecialchars($replyMessage)) . '</p>
                </div>

                ' . (!empty($originalMessage) ? '
                <div class="original-message">
                    <p style="margin: 0 0 8px 0;"><strong>PESAN ASLI ANDA:</strong></p>
                    <p style="margin: 0 0 4px 0; font-weight: 600;">' . htmlspecialchars($originalMessage['subject']) . '</p>
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #6c757d;"><em>' . htmlspecialchars($originalMessage['date']) . '</em></p>
                    <p style="margin: 0;">' . nl2br(htmlspecialchars($originalMessage['message'])) . '</p>
                </div>
                ' : '') . '

                <div class="footer">
                    <p><strong>Dynotix</strong> - Platform Manajemen Acara Digital</p>
                    <p>Email ini dikirim otomatis dari sistem Dynotix</p>
                    <p>&copy; 2025 Dynotix. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ';
    }
}
