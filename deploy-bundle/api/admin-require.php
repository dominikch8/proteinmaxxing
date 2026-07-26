<?php
/**
 * Wymaga zalogowanego administratora.
 */
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function pmx_require_admin(array $config): array
{
    $pdo = pmx_db($config);
    $user = pmx_current_user($pdo);
    if (!$user) {
        pmx_json(['ok' => false, 'error' => 'Musisz być zalogowany.'], 401);
    }
    if (pmx_is_admin_email((string) $user['email'], $config) && ($user['role'] ?? '') !== 'admin') {
        $now = gmdate('c');
        $upd = $pdo->prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?');
        $upd->execute(['admin', $now, (int) $user['id']]);
        $user['role'] = 'admin';
    }
    if (($user['role'] ?? '') !== 'admin') {
        pmx_json(['ok' => false, 'error' => 'Brak uprawnień administratora.'], 403);
    }
    return [$pdo, $user];
}
