<?php

namespace PHPMailer\PHPMailer;

/**
 * Lightweight, high-performance, socket-based SMTP client compatible with PHPMailer standards.
 */
class PHPMailer
{
    const ENCRYPTION_STARTTLS = 'tls';
    const ENCRYPTION_SMTPS = 'ssl';
    
    public string $Host;
    public bool $SMTPAuth = false;
    public string $Username;
    public string $Password;
    public ?string $SMTPSecure;
    public int $Port;
    public string $Subject = '';
    public string $Body = '';
    public string $ErrorInfo = '';
    public array $SMTPOptions = [];

    protected bool $isSMTP = false;
    protected bool $isHTML = false;
    protected string $fromEmail = '';
    protected string $fromName = '';
    protected array $toAddresses = [];
    protected array $replyToAddresses = [];

    /**
     * Constructor logic to maintain compatibility.
     */
    public function __construct($exceptions = false)
    {
    }

    /**
     * Instruct PHPMailer to send via SMTP sockets rather than standard PHP mail().
     */
    public function isSMTP()
    {
        $this->isSMTP = true;
    }

    /**
     * Configure the sender details.
     */
    public function setFrom(string $email, string $name = ''): bool
    {
        $this->fromEmail = $email;
        $this->fromName = $name;
        return true;
    }
    /**
     * Append a destination recipient to the mail target stack.
     */
    public function addAddress(string $email, string $name = ''): bool
    {
        $this->toAddresses[] = ['email' => $email, 'name' => $name];
        return true;
    }
    /**
     * Add reply-to metadata for support inbox usability.
     */
    public function addReplyTo(string $email, string $name = ''): bool
    {
        $this->replyToAddresses[] = ['email' => $email, 'name' => $name];
        return true;
    }
    /**
     * Toggle standard text body vs standard visual content markup.
     */
    public function isHTML($isHtml = true)
    {
        $this->isHTML = $isHtml;
    }

    /**
     * Execute the main compilation and dispatch routines.
     */
    public function send()
    {
        try {
            if ($this->isSMTP) {
                return $this->sendSMTP();
            } else {
                $to = isset($this->toAddresses[0]['email']) ? $this->toAddresses[0]['email'] : '';
                $status = @mail($to, $this->Subject, $this->Body);
                if (!$status) {
                    throw new Exception("PHP local mail() framework failed to dispatch.");
                }
                return true;
            }
        } catch (Exception $e) {
            $this->ErrorInfo = $e->getMessage();
            throw $e;
        } catch (\Exception $e) {
            $this->ErrorInfo = $e->getMessage();
            throw new Exception($e->getMessage(), $e->getCode(), $e);
        }
    }

    /**
     * Connect and transport standard MIME payloads over stream sockets.
     */
    private function sendSMTP()
    {
        $ssl_options = [];
        if (!empty($this->SMTPOptions['ssl'])) {
            $ssl_options = $this->SMTPOptions['ssl'];
        }
        $context = stream_context_create(['ssl' => $ssl_options]);
        $protocol = ($this->SMTPSecure === self::ENCRYPTION_SMTPS) ? 'ssl' : 'tcp';

        // Establish socket connection
        /** @var resource|false|null $socket */
        $socket = null; // Initialize to null
        try {
        $socket = @stream_socket_client("{$protocol}://{$this->Host}:{$this->Port}", $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);
        if (!$socket) {
            throw new Exception("Failed to open connection stream: $errstr ($errno)");
        }

        $this->readResponse($socket, '220');

        // EHLO Handshake
        $this->writeCommand($socket, "EHLO localhost", '250');

        // Upgrade stream layer to secure transport if STARTTLS explicit port
        if ($this->SMTPSecure === self::ENCRYPTION_STARTTLS) {
            $this->writeCommand($socket, "STARTTLS", '220');

            // Re-check if the socket is still a valid resource after STARTTLS command and before crypto negotiation
            if (!is_resource($socket)) {
                throw new Exception("SMTP connection lost before STARTTLS crypto negotiation.");
            }
            
            // Apply SSL options to the socket context
            if (!empty($ssl_options)) {
                if (function_exists('stream_context_set_options')) {
                    @stream_context_set_options($socket, ['ssl' => $ssl_options]);
                } else {
                    foreach ($ssl_options as $key => $value) {
                        @stream_context_set_option($socket, 'ssl', $key, $value);
                    }
                }
            }

            // Attempt to enable crypto, suppressing potential PHP warnings if the resource becomes invalid
            $crypto_enabled = @stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

            if (!$crypto_enabled) {
                // Differentiate between a lost connection and a negotiation failure
                throw new Exception("STARTTLS negotiation failed on connection stream. " . (!is_resource($socket) ? "Connection lost." : ""));
            }
            $this->writeCommand($socket, "EHLO localhost", '250');
        }

        // Authentication handshake
        if ($this->SMTPAuth) {
            $this->writeCommand($socket, "AUTH LOGIN", '334');
            $this->writeCommand($socket, base64_encode($this->Username), '334');
            $this->writeCommand($socket, base64_encode($this->Password), '235');
        }

        // Setup transmission parameters
        $this->writeCommand($socket, "MAIL FROM:<" . $this->fromEmail . ">", '250');

        foreach ($this->toAddresses as $to) {
            $this->writeCommand($socket, "RCPT TO:<" . $to['email'] . ">", '250');
        }

        // Send content payload initialization
        $this->writeCommand($socket, "DATA", '354');

        // Format RFC-compliant MIME headers
        $headers = [];
        $headers[] = "MIME-Version: 1.0";
        if ($this->isHTML) {
            $headers[] = "Content-Type: text/html; charset=UTF-8";
        } else {
            $headers[] = "Content-Type: text/plain; charset=UTF-8";
        }

        $fromNameFormatted = $this->fromName ? "=?UTF-8?B?" . base64_encode($this->fromName) . "?=" : "";
        $headers[] = "From: " . ($fromNameFormatted ? "$fromNameFormatted <" . $this->fromEmail . ">" : $this->fromEmail);

        $toEmails = [];
        foreach ($this->toAddresses as $to) {
            $toEmails[] = $to['name'] ? "{$to['name']} <{$to['email']}>" : $to['email'];
        }
        $headers[] = "To: " . implode(', ', $toEmails);

        if (!empty($this->replyToAddresses)) {
            $replyToEmails = [];
            foreach ($this->replyToAddresses as $rt) {
                $replyToEmails[] = $rt['name'] ? "{$rt['name']} <{$rt['email']}>" : $rt['email'];
            }
            $headers[] = "Reply-To: " . implode(', ', $replyToEmails);
        }

        $headers[] = "Subject: =?UTF-8?B?" . base64_encode($this->Subject) . "?=";
        $headers[] = "Date: " . date('r');
        $headers[] = "Message-ID: <" . md5(uniqid(microtime(), true)) . "@" . gethostname() . ">";

        $messagePayload = implode("\r\n", $headers) . "\r\n\r\n" . $this->Body . "\r\n.\r\n";

        // Write message body payload
        fwrite($socket, $messagePayload);
        $this->readResponse($socket, '250');

        // Closing Connection
        $this->writeCommand($socket, "QUIT", '221');
        fclose($socket);
        return true;
        } finally {
            if (is_resource($socket)) {
                fclose($socket);
            }
        }
    }

    /**
     * Write a command to the socket stream and verify the response.
     *
     * @param resource $socket
     * @param string $command
     * @param string $expectedResponse
     * @return string
     */
    private function writeCommand($socket, string $command, string $expectedResponse): string
    {
        fwrite($socket, $command . "\r\n");
        return $this->readResponse($socket, $expectedResponse);
    }

    /**
     * Read the response from the socket stream.
     *
     * @param resource $socket
     * @param string $expectedResponse
     * @return string
     */
    private function readResponse($socket, string $expectedResponse): string
    {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) == ' ') {
                break;
            }
        }
        if (substr($response, 0, 3) !== $expectedResponse) {
            throw new Exception("Unexpected response from SMTP target host: " . trim($response) . " (Expected response: $expectedResponse)");
        }
        return $response;
    }
}