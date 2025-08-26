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
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 24px;
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
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }
        .info {
            background-color: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Kode OTP Registrasi</h1>
            <p>Sistem Manajemen Kegiatan</p>
        </div>

        <p>Halo!</p>
        
        <p>Anda telah meminta kode OTP untuk registrasi akun di <strong>Sistem Manajemen Kegiatan</strong>.</p>

        <div class="otp-container">
            <p><strong>Kode OTP Anda:</strong></p>
            <div class="otp-code">{{ $otpCode }}</div>
            <p><small>Masukkan kode ini di halaman registrasi</small></p>
        </div>

        <div class="info">
            <strong>📧 Email:</strong> {{ $email }}<br>
            <strong>⏰ Berlaku hingga:</strong> {{ \Carbon\Carbon::parse($expiresAt)->format('d/m/Y H:i') }} WIB
        </div>

        <div class="warning">
            <strong>⚠️ Penting:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Jangan bagikan kode OTP ini kepada siapapun</li>
                <li>Kode OTP berlaku selama 10 menit</li>
                <li>Jika Anda tidak meminta kode ini, abaikan email ini</li>
            </ul>
        </div>

        <p>Jika Anda mengalami masalah atau tidak meminta kode ini, silakan hubungi tim support kami.</p>

        <div class="footer">
            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
            <p>&copy; {{ date('Y') }} Sistem Manajemen Kegiatan. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
