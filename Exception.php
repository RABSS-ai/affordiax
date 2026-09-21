<?php

namespace PHPMailer\PHPMailer;

/**
 * Custom Exception class for PHPMailer errors.
 */
class Exception extends \Exception
{
    /**
     * Prettify error message output.
     */
    public function errorMessage() {
        return '<strong>' . htmlspecialchars($this->getMessage(), ENT_COMPAT | ENT_HTML401) . "</strong><br />\n";
    }
}