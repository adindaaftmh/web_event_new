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
            font-size: 32px;
            font-weight: bold;
            color: #4A7FA7;
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
            background-color: #4A7FA7;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .button:hover {
            background-color: #1A3D63;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DYNOTIX</h1>
            <p>Platform Manajemen Acara Digital</p>
            @if($type === 'forgot_password')
                <h2 style="margin: 20px 0 0 0; font-size: 20px; font-weight: normal;">🔒 Reset Password</h2>
            @else
                <h2 style="margin: 20px 0 0 0; font-size: 20px; font-weight: normal;">🔐 Kode OTP Registrasi</h2>
            @endif
        </div>

        <p>Halo!</p>
        
        @if($type === 'forgot_password')
            <p>Anda telah meminta untuk mereset password akun Anda di <strong>Dynotix - Platform Manajemen Acara Digital</strong>.</p>
        @else
            <p>Anda telah meminta kode OTP untuk registrasi akun di <strong>Dynotix - Platform Manajemen Acara Digital</strong>.</p>
        @endif

        <div class="otp-container">
            <p><strong>Kode OTP Anda:</strong></p>
            <div class="otp-code">{{ $otpCode }}</div>
            @if($type === 'forgot_password')
                <p><small>Masukkan kode ini di halaman reset password</small></p>
            @else
                <p><small>Masukkan kode ini di halaman registrasi</small></p>
            @endif
        </div>

        <div class="info">
            <strong>📧 Email:</strong> {{ $email }}<br>
            <strong>⏰ Berlaku hingga:</strong> {{ \Carbon\Carbon::parse($expiresAt)->format('d/m/Y H:i') }} WIB
        </div>

        <div class="warning">
            <strong>⚠️ Penting:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Jangan bagikan kode OTP ini kepada siapapun</li>
                <li>Kode OTP berlaku selama 5 menit</li>
                @if($type === 'forgot_password')
                    <li>Jika Anda tidak meminta reset password, segera ubah password akun Anda</li>
                @else
                    <li>Jika Anda tidak meminta kode ini, abaikan email ini</li>
                @endif
            </ul>
        </div>

        <p>Jika Anda mengalami masalah atau tidak meminta kode ini, silakan hubungi tim support kami.</p>

        <div class="footer">
            <p><strong>Dynotix</strong> - Platform Manajemen Acara Digital</p>
            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
            <p>&copy; {{ date('Y') }} Dynotix. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
