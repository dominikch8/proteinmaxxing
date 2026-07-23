<?php
/**
 * Wspólny bootstrap API (JSON + sesja).
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$config = require __DIR__ . '/config.php';

$sessionName = (string) ($config['session_name'] ?? 'proteiner_sess');
session_name($sessionName);

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require_once __DIR__ . '/db.php';

function pmx_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function pmx_read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function pmx_require_method(string $method): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== strtoupper($method)) {
        pmx_json(['ok' => false, 'error' => 'Niedozwolona metoda.'], 405);
    }
}

function pmx_normalize_email(string $email): string
{
    return strtolower(trim($email));
}

function pmx_is_admin_email(string $email, array $config): bool
{
    $admins = $config['admin_emails'] ?? [];
    if (!is_array($admins)) {
        return false;
    }
    $email = pmx_normalize_email($email);
    foreach ($admins as $adminEmail) {
        if (pmx_normalize_email((string) $adminEmail) === $email) {
            return true;
        }
    }
    return false;
}

function pmx_public_user(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'email' => (string) $row['email'],
        'name' => (string) $row['name'],
        'role' => (string) $row['role'],
        'createdAt' => (string) $row['created_at'],
    ];
}

function pmx_current_user(PDO $pdo): ?array
{
    $id = $_SESSION['user_id'] ?? null;
    if (!$id) {
        return null;
    }
    $stmt = $pdo->prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int) $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function pmx_login_user(array $row): void
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $row['id'];
    $_SESSION['user_role'] = (string) $row['role'];
}

function pmx_logout_user(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'] ?? '/', $params['domain'] ?? '', (bool) ($params['secure'] ?? false), (bool) ($params['httponly'] ?? true));
    }
    session_destroy();
}
