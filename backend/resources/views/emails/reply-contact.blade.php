<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #4A7FA7 0%, #1A3D63 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-left: 4px solid #4A7FA7;
            border-right: 4px solid #4A7FA7;
        }
        .footer {
            background: #f1f1f1;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 12px;
            color: #666;
        }
        .message-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .original-message {
            background: #e9ecef;
            padding: 15px;
            border-left: 3px solid #6c757d;
            margin-top: 20px;
            font-size: 14px;
        }
        .greeting {
            font-size: 18px;
            font-weight: bold;
            color: #1A3D63;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">{{ config('app.name') }}</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Event Management System</p>
    </div>
    
    <div class="content">
        <div class="greeting">Halo {{ $recipientName }},</div>
        
        <div class="message-box">
            {!! nl2br(e($replyMessage)) !!}
        </div>
        
        @if($originalMessage)
        <div class="original-message">
            <strong>Pesan asli Anda:</strong><br>
            {{ $originalMessage['subject'] }}<br>
            <em>{{ $originalMessage['date'] }}</em><br><br>
            {{ $originalMessage['message'] }}
        </div>
        @endif
    </div>
    
    <div class="footer">
        <p>Email ini dikirim otomatis dari sistem {{ config('app.name') }}</p>
        <p>Jika Anda memiliki pertanyaan, silakan hubungi kami.</p>
    </div>
</body>
</html>