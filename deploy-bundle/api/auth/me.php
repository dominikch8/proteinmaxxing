<?php
require_once dirname(__DIR__) . '/bootstrap.php';

pmx_require_method('GET');

$pdo = pmx_db($config);
$user = pmx_current_user($pdo);

if (!$user) {
    pmx_json(['ok' => true, 'user' => null]);
}

if (pmx_is_admin_email((string) $user['email'], $config) && ($user['role'] ?? '') !== 'admin') {
    $now = gmdate('c');
    $upd = $pdo->prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?');
    $upd->execute(['admin', $now, (int) $user['id']]);
    $user['role'] = 'admin';
}

pmx_json(['ok' => true, 'user' => pmx_public_user($user)]);
