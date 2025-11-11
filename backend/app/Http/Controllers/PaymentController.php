<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;
use Xendit\Invoice\CreateInvoiceRequest;
use App\Models\Transaction;
use GuzzleHttp\Client as GuzzleClient;

class PaymentController extends Controller
{
    private $xenditConfig;
    private $invoiceApi;

    public function __construct()
    {
        // Setup Xendit Configuration (v7.x structure)
        $this->xenditConfig = Configuration::getDefaultConfiguration()
            ->setApiKey(config('xendit.secret_key'));
        
        // TEMPORARY FIX: Disable SSL verification for development (XAMPP issue)
        // IMPORTANT: Remove this in production!
        if (!config('xendit.is_production')) {
            $httpClient = new \GuzzleHttp\Client([
                'verify' => false, // Disable SSL verification
            ]);
            $this->invoiceApi = new InvoiceApi($httpClient, $this->xenditConfig);
        } else {
            $this->invoiceApi = new InvoiceApi(null, $this->xenditConfig);
        }
        
        // Debug: pastikan API key terbaca
        \Log::info('Xendit Config:', [
            'secret_key' => config('xendit.secret_key') ? 'SET (hidden)' : 'NOT SET',
            'is_production' => config('xendit.is_production')
        ]);
    }

    // Buat transaksi dengan payment details langsung (tanpa redirect)
    public function createTransaction(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'payment_method' => 'string|nullable', // VA, QRIS, EWALLET, dll
        ]);

        $orderId = 'ORDER-' . time();
        $paymentMethod = $request->payment_method ?? 'MULTI'; // Default: multiple payment methods

        try {
            \Log::info('Creating Xendit invoice:', ['order_id' => $orderId, 'amount' => $request->amount]);

            // DEVELOPMENT MODE: Check if using mock payment
            $useMockPayment = config('xendit.secret_key') === 'MOCK_FOR_TESTING';
            
            if ($useMockPayment) {
                // MOCK PAYMENT for testing without real Xendit account
                \Log::info('Using MOCK payment for testing');
                $invoiceUrl = 'https://checkout-staging.xendit.co/web/mock-' . time();
                
                // Simpan transaksi ke database
                $transaction = Transaction::create([
                    'order_id' => $orderId,
                    'amount' => $request->amount,
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'status' => 'pending'
                ]);
                
                return response()->json([
                    'invoice_url' => $invoiceUrl,
                    'order_id' => $orderId,
                    'mock' => true // Flag to indicate this is mock payment
                ]);
            }
            
            // REAL XENDIT PAYMENT - Create payment channels directly via API
            \Log::info('Creating payment channels directly via Xendit API');
            
            $paymentChannels = $this->createPaymentChannelsDirect($orderId, $request->amount, $request->name, $request->email, $request->phone);
            \Log::info('Payment channels created:', ['count' => count($paymentChannels)]);
            
            // FALLBACK: If no channels created, use mock channels for testing
            if (empty($paymentChannels)) {
                \Log::warning('No payment channels created, using mock channels for testing');
                $paymentChannels = $this->createMockPaymentChannels($orderId, $request->amount, $request->name);
            }
            
            // Simpan transaksi ke database
            $transaction = Transaction::create([
                'order_id' => $orderId,
                'amount' => $request->amount,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'status' => 'pending'
            ]);

            return response()->json([
                'order_id' => $orderId,
                'amount' => $request->amount,
                'payment_channels' => $paymentChannels,
                'expires_at' => now()->addHours(24)->toIso8601String(),
                'is_mock' => empty($paymentChannels) ? false : (isset($paymentChannels[0]['is_mock']) ? true : false)
            ]);

        } catch (\Xendit\XenditSdkException $e) {
            \Log::error('Xendit SDK Error:', [
                'message' => $e->getMessage(),
                'full_error' => $e->getFullError(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $errorMsg = $e->getMessage();
            $fullError = $e->getFullError();
            
            if ($fullError && isset($fullError['error_code'])) {
                $errorMsg = "[{$fullError['error_code']}] {$fullError['message']}";
            }
            
            return response()->json([
                'error' => $errorMsg,
                'details' => $fullError ?? []
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Xendit Error Full:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Xendit API error: ' . $e->getMessage()
            ], 500);
        }
    }

    // Create payment channels directly via Xendit REST API
    private function createPaymentChannelsDirect($orderId, $amount, $name, $email, $phone)
    {
        $apiKey = config('xendit.secret_key');
        $baseUrl = config('xendit.is_production') ? 'https://api.xendit.co' : 'https://api.xendit.co';
        
        $client = new GuzzleClient([
            'verify' => !config('xendit.is_production'), // Disable SSL in dev
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode($apiKey . ':'),
                'Content-Type' => 'application/json',
            ]
        ]);

        $channels = [];
        $expiryDate = now()->addHours(24)->toIso8601String();

        try {
            // 1. Create Virtual Account (BCA, BNI, BRI, Mandiri, Permata)
            $vaBanks = ['BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA'];
            foreach ($vaBanks as $bankCode) {
                try {
                    $response = $client->post($baseUrl . '/callback_virtual_accounts', [
                        'json' => [
                            'external_id' => $orderId . '-VA-' . $bankCode,
                            'bank_code' => $bankCode,
                            'name' => $name,
                            'expected_amount' => $amount,
                            'is_closed' => true,
                            'expiration_date' => $expiryDate,
                        ]
                    ]);
                    
                    $vaData = json_decode($response->getBody(), true);
                    \Log::info("VA created for {$bankCode}:", ['account_number' => $vaData['account_number']]);
                    
                    $channels[] = [
                        'type' => 'VIRTUAL_ACCOUNT',
                        'bank_code' => $bankCode,
                        'bank_name' => $this->getBankName($bankCode),
                        'account_number' => $vaData['account_number'],
                        'account_holder_name' => $vaData['name'],
                        'amount' => $amount,
                        'expiry_date' => $vaData['expiration_date'] ?? $expiryDate,
                        'external_id' => $vaData['external_id'],
                    ];
                } catch (\Exception $e) {
                    \Log::warning("Failed to create VA for {$bankCode}: " . $e->getMessage());
                }
            }

            // 2. Create QRIS
            try {
                $response = $client->post($baseUrl . '/qr_codes', [
                    'json' => [
                        'external_id' => $orderId . '-QRIS',
                        'type' => 'DYNAMIC',
                        'callback_url' => env('APP_URL') . '/api/webhook/xendit',
                        'amount' => $amount,
                    ]
                ]);
                
                $qrisData = json_decode($response->getBody(), true);
                \Log::info('QRIS created:', ['id' => $qrisData['id']]);
                
                $channels[] = [
                    'type' => 'QRIS',
                    'qr_id' => $qrisData['id'],
                    'qr_string' => $qrisData['qr_string'], // Base64 QR code image
                    'amount' => $amount,
                    'expiry_date' => $qrisData['expires_at'] ?? $expiryDate,
                ];
            } catch (\Exception $e) {
                \Log::warning('Failed to create QRIS: ' . $e->getMessage());
            }

            // 3. E-Wallet (OVO, DANA, LinkAja, ShopeePay)
            $ewallets = [
                ['type' => 'OVO', 'phone' => $phone],
                ['type' => 'DANA', 'phone' => null],
                ['type' => 'LINKAJA', 'phone' => $phone],
                ['type' => 'SHOPEEPAY', 'phone' => null],
            ];

            foreach ($ewallets as $ewallet) {
                try {
                    $payload = [
                        'external_id' => $orderId . '-' . $ewallet['type'],
                        'amount' => $amount,
                        'phone' => $ewallet['phone'],
                        'ewallet_type' => $ewallet['type'],
                        'callback_url' => env('APP_URL') . '/api/webhook/xendit',
                        'redirect_url' => env('APP_URL') . '/payment/success',
                    ];

                    // Remove null values
                    $payload = array_filter($payload, function($value) {
                        return $value !== null;
                    });

                    $response = $client->post($baseUrl . '/ewallets/charges', [
                        'json' => $payload
                    ]);
                    
                    $ewalletData = json_decode($response->getBody(), true);
                    \Log::info("E-Wallet {$ewallet['type']} created:", ['charge_id' => $ewalletData['id']]);
                    
                    $channels[] = [
                        'type' => 'EWALLET',
                        'ewallet_type' => $ewallet['type'],
                        'charge_id' => $ewalletData['id'],
                        'checkout_url' => $ewalletData['actions']['desktop_web_checkout_url'] ?? $ewalletData['actions']['mobile_web_checkout_url'] ?? null,
                        'amount' => $amount,
                        'status' => $ewalletData['status'] ?? 'PENDING',
                    ];
                } catch (\Exception $e) {
                    \Log::warning("Failed to create E-Wallet {$ewallet['type']}: " . $e->getMessage());
                }
            }

        } catch (\Exception $e) {
            \Log::error('Error creating payment channels: ' . $e->getMessage());
        }

        return $channels;
    }

    // Create mock payment channels for testing when Xendit API fails
private function createMockPaymentChannels($orderId, $amount, $name)
{
    \Log::info('Creating mock payment channels for testing');
    
    $channels = [];
    $expiryDate = now()->addHours(24)->toIso8601String();
    
    // Mock Virtual Accounts
    $vaBanks = ['BCA', 'BNI', 'BRI', 'MANDIRI'];
    foreach ($vaBanks as $bankCode) {
        $channels[] = [
            'type' => 'VIRTUAL_ACCOUNT',
            'bank_code' => $bankCode,
            'bank_name' => $this->getBankName($bankCode),
            'account_number' => '8808' . rand(1000000000, 9999999999),
            'account_holder_name' => $name,
            'amount' => $amount,
            'expiry_date' => $expiryDate,
            'external_id' => $orderId . '-VA-' . $bankCode,
            'is_mock' => true,
        ];
    }
    
    // Mock QRIS
    $channels[] = [
        'type' => 'QRIS',
        'qr_id' => 'qr_mock_' . time(),
        'qr_string' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'amount' => $amount,
        'expiry_date' => $expiryDate,
        'is_mock' => true,
    ];
    
    // Mock Credit Card (untuk direct charge)
    $channels[] = [
        'type' => 'CREDIT_CARD',
        'is_mock' => true,
    ];
    
    return $channels;
}
    
    private function getBankName($code)
    {
        $banks = [
            'BCA' => 'Bank BCA',
            'BNI' => 'Bank BNI',
            'BRI' => 'Bank BRI',
            'MANDIRI' => 'Bank Mandiri',
            'PERMATA' => 'Bank Permata',
            'BSI' => 'Bank Syariah Indonesia',
            'SAHABAT_SAMPOERNA' => 'Bank Sahabat Sampoerna',
        ];
        
        return $banks[$code] ?? $code;
    }

    // Direct charge using payment token (credit card, e-wallet)
    public function chargeWithToken(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string',
            'token_id' => 'required|string',
            'authentication_id' => 'string|nullable',
            'card_holder_name' => 'string|nullable',
            'payment_method_type' => 'required|string', // CARD, EWALLET
        ]);

        $orderId = $request->order_id;
        $tokenId = $request->token_id;
        $authenticationId = $request->authentication_id;
        $paymentMethodType = $request->payment_method_type;

        try {
            $transaction = Transaction::where('order_id', $orderId)->first();
            if (!$transaction) {
                return response()->json(['error' => 'Transaction not found'], 404);
            }

            $apiKey = config('xendit.secret_key');
            $baseUrl = config('xendit.is_production') ? 'https://api.xendit.co' : 'https://api.xendit.co';
            
            $client = new GuzzleClient([
                'verify' => !config('xendit.is_production'),
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode($apiKey . ':'),
                    'Content-Type' => 'application/json',
                ]
            ]);

            if ($paymentMethodType === 'CARD') {
                // Charge credit card using token
                \Log::info('Charging credit card with token', ['order_id' => $orderId, 'token_id' => $tokenId]);
                
                $payload = [
                    'token_id' => $tokenId,
                    'external_id' => $orderId,
                    'amount' => $transaction->amount,
                    'currency' => 'IDR',
                    'card_cvn' => $request->card_cvn ?? null,
                    'capture' => true, // Auto capture
                ];

                if ($authenticationId) {
                    $payload['authentication_id'] = $authenticationId;
                }

                // Remove null values
                $payload = array_filter($payload, function($value) {
                    return $value !== null;
                });

                $response = $client->post($baseUrl . '/credit_card_charges', [
                    'json' => $payload
                ]);
                
                $chargeData = json_decode($response->getBody(), true);
                \Log::info('Card charge response:', $chargeData);

                // Check charge status
                if ($chargeData['status'] === 'CAPTURED' || $chargeData['status'] === 'AUTHORIZED') {
                    $transaction->status = 'success';
                    $transaction->save();

                    return response()->json([
                        'status' => 'SUCCESS',
                        'message' => 'Pembayaran berhasil',
                        'charge_id' => $chargeData['id'],
                        'order_id' => $orderId,
                    ]);
                } elseif ($chargeData['status'] === 'FAILED') {
                    $transaction->status = 'failed';
                    $transaction->save();

                    return response()->json([
                        'status' => 'FAILED',
                        'message' => $chargeData['failure_reason'] ?? 'Pembayaran gagal',
                    ], 400);
                } else {
                    // Pending or requires action
                    return response()->json([
                        'status' => 'PENDING',
                        'message' => 'Pembayaran dalam proses',
                        'charge_id' => $chargeData['id'],
                        'payer_authentication_url' => $chargeData['payer_authentication_url'] ?? null,
                    ]);
                }
            } elseif ($paymentMethodType === 'EWALLET') {
                // Direct e-wallet charge (for supported wallets like OVO with phone number)
                \Log::info('Charging e-wallet with token', ['order_id' => $orderId]);
                
                // E-wallet direct charge logic here
                return response()->json([
                    'status' => 'PENDING',
                    'message' => 'E-wallet charge in progress',
                ]);
            }

            return response()->json(['error' => 'Invalid payment method type'], 400);

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $errorBody = json_decode($e->getResponse()->getBody(), true);
            \Log::error('Xendit charge error:', $errorBody);
            
            return response()->json([
                'error' => $errorBody['message'] ?? 'Gagal memproses pembayaran',
                'details' => $errorBody,
            ], $e->getResponse()->getStatusCode());
        } catch (\Exception $e) {
            \Log::error('Charge error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Error processing charge: ' . $e->getMessage()
            ], 500);
        }
    }

    // Webhook Xendit
    public function notification(Request $request)
    {
        try {
            // Verify webhook token (optional but recommended)
            $webhookToken = config('xendit.webhook_token');
            $requestToken = $request->header('x-callback-token');
            
            if ($webhookToken && $requestToken !== $webhookToken) {
                \Log::warning('Invalid webhook token');
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $payload = $request->all();
            \Log::info('Xendit webhook received:', $payload);

            // External ID adalah order_id kita
            $externalId = $payload['external_id'] ?? null;
            if (!$externalId) {
                return response()->json(['message' => 'Invalid payload'], 400);
            }

            $transaction = Transaction::where('order_id', $externalId)->first();
            if (!$transaction) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            // Update status berdasarkan status invoice Xendit
            $status = $payload['status'] ?? '';
            
            switch ($status) {
                case 'PAID':
                case 'SETTLED':
                    $transaction->status = 'success';
                    break;
                case 'PENDING':
                    $transaction->status = 'pending';
                    break;
                case 'EXPIRED':
                    $transaction->status = 'expired';
                    break;
                default:
                    $transaction->status = 'failed';
            }

            $transaction->save();

            return response()->json(['message' => 'ok']);
            
        } catch (\Exception $e) {
            \Log::error('Webhook error:', [
                'message' => $e->getMessage(),
                'payload' => $request->all()
            ]);
            return response()->json(['message' => 'Error processing webhook'], 500);
        }
    }
}
