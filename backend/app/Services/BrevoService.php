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
}
