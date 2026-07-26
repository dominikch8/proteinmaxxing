<?php
/**
 * Konfiguracja auth Proteiner.
 * Opcjonalnie nadpisz w api/config.local.php (nie commituj haseł produkcyjnych).
 */
$default = [
    'session_name' => 'proteiner_sess',
    'db_path' => __DIR__ . '/../data/users.sqlite',
    // Konta z tymi e-mailami zawsze dostają rolę admin (przy rejestracji i logowaniu).
    'admin_emails' => [
        'developeranios@gmail.com',
        'bambolejo8888@seznam.cz',
    ],
    // Tworzone przy pierwszym starcie API, jeśli konto jeszcze nie istnieje.
    'bootstrap_admin' => [
        'email' => 'developeranios@gmail.com',
        'name' => 'Admin Proteiner',
        // Zmień po pierwszym logowaniu (to samo hasło co dawny PIN panelu).
        'password' => 'Bencwal181',
    ],
];

$localFile = __DIR__ . '/config.local.php';
if (is_file($localFile)) {
    $local = require $localFile;
    if (is_array($local)) {
        $default = array_replace_recursive($default, $local);
    }
}

return $default;
