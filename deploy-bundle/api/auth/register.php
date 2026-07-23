<?php
require_once dirname(__DIR__) . '/bootstrap.php';

pmx_require_method('POST');

$body = pmx_read_json_body();
$email = pmx_normalize_email((string) ($body['email'] ?? ''));
$password = (string) ($body['password'] ?? '');
$name = trim((string) ($body['name'] ?? ''));

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    pmx_json(['ok' => false, 'error' => 'Podaj prawidłowy adres e-mail.'], 422);
}
if (strlen($password) < 8) {
    pmx_json(['ok' => false, 'error' => 'Hasło musi mieć co najmniej 8 znaków.'], 422);
}
if ($name === '' || mb_strlen($name) < 2) {
    pmx_json(['ok' => false, 'error' => 'Podaj imię lub nick (min. 2 znaki).'], 422);
}
if (mb_strlen($name) > 80) {
    pmx_json(['ok' => false, 'error' => 'Imię jest za długie.'], 422);
}

$pdo = pmx_db($config);

$check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$check->execute([$email]);
if ($check->fetch()) {
    pmx_json(['ok' => false, 'error' => 'Konto z tym e-mailem już istnieje.'], 409);
}

$role = pmx_is_admin_email($email, $config) ? 'admin' : 'user';
$now = gmdate('c');

$ins = $pdo->prepare(
    'INSERT INTO users (email, name, password_hash, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)'
);
$ins->execute([
    $email,
    $name,
    password_hash($password, PASSWORD_DEFAULT),
    $role,
    $now,
    $now,
]);

$id = (int) $pdo->lastInsertId();
$row = [
    'id' => $id,
    'email' => $email,
    'name' => $name,
    'role' => $role,
    'created_at' => $now,
];

pmx_login_user($row);
pmx_json(['ok' => true, 'user' => pmx_public_user($row)]);
