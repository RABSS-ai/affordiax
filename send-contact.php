<?php

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit;
}

// --------------------------------------------------
// Load protected Resend configuration
// --------------------------------------------------

$configFile = '/etc/affordiax-mail.conf';

if (!is_readable($configFile)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Mail configuration unavailable.'
    ]);
    exit;
}

$config = parse_ini_file($configFile);

$resendApiKey = $config['RESEND_API_KEY'] ?? '';
$toEmail      = $config['TO_EMAIL'] ?? '';

if (!$resendApiKey || !$toEmail) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Mail configuration incomplete.'
    ]);
    exit;
}

// --------------------------------------------------
// Read JSON form data
// --------------------------------------------------

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid form data.'
    ]);
    exit;
}

// Honeypot
if (!empty($data['hp'])) {
    echo json_encode(['success' => true]);
    exit;
}

$name = trim((string)($data['name'] ?? ''));
$emailRaw = trim((string)($data['email'] ?? ''));
$subjectKey = trim((string)($data['subject'] ?? ''));
$message = trim((string)($data['message'] ?? ''));

$email = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);

if ($name === '' || !$email || $message === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Please fill in all required fields with valid values.'
    ]);
    exit;
}

// Prevent excessively large submissions
if (
    strlen($name) > 150 ||
    strlen($emailRaw) > 254 ||
    strlen($message) > 10000
) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Submitted content is too long.'
    ]);
    exit;
}

$subjects = [
    'calculator'  => 'Calculator Feedback or Issue',
    'data'        => 'Database Correction / City Update',
    'partnership' => 'Business Partnership',
    'general'     => 'General Inquiry'
];

$subjectTitle = $subjects[$subjectKey] ?? 'General Inquiry';

// --------------------------------------------------
// Helper function for Resend
// --------------------------------------------------

function sendResendEmail(
    string $apiKey,
    array $payload
): array {

    $ch = curl_init('https://api.resend.com/emails');

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode($payload)
    ]);

    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    return [
        'status' => $status,
        'response' => $response,
        'error' => $curlError
    ];
}

// --------------------------------------------------
// Send contact message to Affordiax
// --------------------------------------------------

$body =
    "You have received a new contact message from Affordiax.\n\n" .
    "Name: {$name}\n" .
    "Email: {$email}\n" .
    "Subject: {$subjectTitle}\n\n" .
    "Message:\n{$message}\n";

$result = sendResendEmail($resendApiKey, [
    'from' => 'Affordiax <support@affordiax.com>',
    'to' => [$toEmail],
    'reply_to' => $email,
    'subject' => "Affordiax: {$subjectTitle} - From {$name}",
    'text' => $body
]);

if ($result['error'] !== '') {
    error_log('Affordiax Resend cURL error: ' . $result['error']);

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Unable to connect to the email service.'
    ]);
    exit;
}

if ($result['status'] < 200 || $result['status'] >= 300) {

    error_log(
        'Affordiax Resend API error. HTTP ' .
        $result['status'] . ': ' .
        $result['response']
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Unable to send your message. Please try again.'
    ]);
    exit;
}

// --------------------------------------------------
// Send acknowledgement to visitor
// --------------------------------------------------

$autoReply =
    "Hi {$name},\n\n" .
    "Thank you for contacting Affordiax.\n\n" .
    "We have successfully received your message regarding " .
    "\"{$subjectTitle}\".\n\n" .
    "Our team will review your message and respond as soon as possible.\n\n" .
    "--- Copy of your message ---\n\n" .
    "{$message}\n\n" .
    "----------------------------\n\n" .
    "Best regards,\n" .
    "Affordiax Support Team\n" .
    "affordiax.com";

$replyResult = sendResendEmail($resendApiKey, [
    'from' => 'Affordiax <support@affordiax.com>',
    'to' => [$email],
    'reply_to' => $toEmail,
    'subject' => 'We received your inquiry - Affordiax',
    'text' => $autoReply
]);

// Don't fail the original form if only auto-reply fails
if ($replyResult['status'] < 200 || $replyResult['status'] >= 300) {
    error_log(
        'Affordiax auto-reply failed. HTTP ' .
        $replyResult['status'] . ': ' .
        $replyResult['response']
    );
}

echo json_encode([
    'success' => true,
    'message' => 'Your message has been sent successfully.'
]);