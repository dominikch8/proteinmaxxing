<?php
require_once dirname(__DIR__) . '/bootstrap.php';

pmx_require_method('POST');

$body = pmx_read_json_body();
$email = pmx_normalize_email((string) ($body['email'] ?? ''));
$password = (string) ($body['password'] ?? '');

if ($email === '' || $password === '') {
    pmx_json(['ok' => false, 'error' => 'Podaj e-mail i hasło.'], 422);
}

$pdo = pmx_db($config);
$stmt = $pdo->prepare('SELECT id, email, name, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row || !password_verify($password, (string) $row['password_hash'])) {
    // Stały czas odpowiedzi — mniej informacji o istnieniu konta.
    usleep(200000);
    pmx_json(['ok' => false, 'error' => 'Nieprawidłowy e-mail lub hasło.'], 401);
}

if (pmx_is_admin_email((string) $row['email'], $config) && ($row['role'] ?? '') !== 'admin') {
    $now = gmdate('c');
    $upd = $pdo->prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?');
    $upd->execute(['admin', $now, (int) $row['id']]);
    $row['role'] = 'admin';
}

pmx_login_user($row);
pmx_json(['ok' => true, 'user' => pmx_public_user($row)]);
