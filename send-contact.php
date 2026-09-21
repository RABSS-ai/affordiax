<?php
header('Content-Type: application/json');
ob_start(); // Start output buffering

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received.']);
    exit;
}

// Simple helper to load environment variables from a local .env file
function loadEnv(string $path): void {
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            // Strip surrounding quotes
            if (preg_match('/^["\'](.*)["\']$/', $value, $matches)) {
                $value = $matches[1];
            }
            putenv("{$name}={$value}");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}
loadEnv(__DIR__ . '/.env');

// Honeypot spam prevention
if (!empty($data['hp'])) {
    // Silently return success to keep the bot satisfied
    echo json_encode(['success' => true]);
    exit;
}

// Sanitize inputs
$name = filter_var(trim($data['name'] ?? ''), FILTER_UNSAFE_RAW);
$email = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$subjectKey = filter_var(trim($data['subject'] ?? ''), FILTER_UNSAFE_RAW);
$message = filter_var(trim($data['message'] ?? ''), FILTER_UNSAFE_RAW);

if (empty($name) || !$email || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields with valid values.']);
    exit;
}

// Map subject keys to reader-friendly text
$subjects = [
    'calculator' => 'Calculator Feedback or Issue',
    'data' => 'Database correction / City Update',
    'partnership' => 'Business Partnership',
    'general' => 'General Inquiry'
];
$subjectTitle = $subjects[$subjectKey] ?? 'General Inquiry';

// ==========================================================================
// SMTP CONFIGURATION - CONFIGURE YOUR GMAIL SETTINGS HERE
// ==========================================================================
$smtp_host     = getenv('SMTP_HOST') ?: 'smtp.gmail.com';                      // Outgoing SMTP server
$smtp_port     = getenv('SMTP_PORT') ? (int)getenv('SMTP_PORT') : 587;          // 587 (TLS/STARTTLS) or 465 (SSL)
$smtp_user     = getenv('SMTP_USER') ?: 'rabsstechnologies@gmail.com';         // Your Gmail account ID
$smtp_password = getenv('SMTP_PASSWORD') ?: 'bbmu vrle mkfr arsb';             // Your 16-character Google App Password
$to_email      = getenv('TO_EMAIL') ?: 'rabsstechnologies@gmail.com';         // Where you want to receive the support emails
// ==========================================================================

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Autoload PHPMailer classes (Composer setup is highly recommended)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} else {
    // Manual loading fallback - loading directly from the current directory
    require __DIR__ . '/Exception.php';
    require __DIR__ . '/PHPMailer.php';
    require __DIR__ . '/SMTP.php';
}

$mail = new PHPMailer(true);

try {
    // Server settings
    ob_clean(); // Clear any previous output before sending headers and content
    $mail->isSMTP();
    $mail->Host       = $smtp_host;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtp_user;
    $mail->Password   = $smtp_password;
    
    // It's good practice to set a timeout for SMTP connections
    // $mail->Timeout = 10; // seconds
    // Choose connection security type
    if ($smtp_port === 465) {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Implicit SSL/TLS on port 465
    } else {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Explicit TLS on port 587
    }
    $mail->Port       = $smtp_port;

    // IMPORTANT: Disabling SSL certificate verification can be a security risk.
    // Only use this in development or if you fully understand the implications
    // and have no other way to resolve certificate issues (e.g., outdated CA certificates).
    // For production, ensure your PHP environment has up-to-date CA certificates.
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ];
    // Recipients
    $mail->setFrom($smtp_user, 'LivingCost USA Support Form');
    $mail->addAddress($to_email);
    $mail->addReplyTo($email, $name); // So clicking reply in your email replies directly to the client

    // Content
    $mail->isHTML(false); // Plain text formats are cleaner and safer for support forms
    $mail->Subject = "LivingCost USA Support: $subjectTitle - From $name";
    
    $mail->Body    = "You have received a new support message from LivingCost USA.\n\n" .
                     "Name: $name\n" .
                     "Email: $email\n" .
                     "Subject: $subjectTitle\n\n" .
                     "Message:\n$message\n";

    $mail->send();

    // Send auto-acknowledgement email to the visitor
    try {
        $autoReply = new PHPMailer(true);
        $autoReply->isSMTP();
        $autoReply->Host       = $smtp_host;
        $autoReply->SMTPAuth   = true;
        $autoReply->Username   = $smtp_user;
        $autoReply->Password   = $smtp_password;
        if ($smtp_port === 465) {
            $autoReply->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
            $autoReply->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }
        $autoReply->Port       = $smtp_port;
        $autoReply->SMTPOptions = $mail->SMTPOptions;

        $autoReply->setFrom($smtp_user, 'LivingCost USA Support');
        $autoReply->addAddress($email, $name);
        $autoReply->isHTML(false);
        $autoReply->Subject = "We received your inquiry - LivingCost USA";
        $autoReply->Body    = "Hi $name,\n\n" .
                             "Thank you for contacting LivingCost USA!\n\n" .
                             "We have successfully received your message regarding \"$subjectTitle\". One of our support engineers will review your details and follow up with you within one business day.\n\n" .
                             "--- Copy of your message ---\n" .
                             "Subject: $subjectTitle\n\n" .
                             "$message\n" .
                             "----------------------------\n\n" .
                             "Best regards,\n" .
                             "LivingCost USA Support Team";
        $autoReply->send();
    } catch (\Throwable $e) {
        // Silently log or ignore auto-reply failures so the primary form submission is not blocked
    }

    ob_end_clean(); // Discard any buffered output
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    ob_end_clean(); // Discard any buffered output
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to dispatch email. Mailer Error: ' . $mail->ErrorInfo
    ]);
    } catch (\Throwable $e) {
        ob_end_clean(); // Discard any buffered output
        echo json_encode([
            'success' => false,
            'message' => 'An unexpected system error occurred: ' . $e->getMessage()
        ]);
}