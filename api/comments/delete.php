<?php
/**
 * Usunięcie komentarza (admin lub autor).
 * POST /api/comments/delete.php
 * body: { id }
 */
require_once dirname(__DIR__) . '/bootstrap.php';

pmx_require_method('POST');

$pdo = pmx_db($config);
$user = pmx_current_user($pdo);
if (!$user) {
    pmx_json(['ok' => false, 'error' => 'Zaloguj się, aby usunąć komentarz.'], 401);
}

$body = pmx_read_json_body();
$id = (int) ($body['id'] ?? 0);
if ($id <= 0) {
    pmx_json(['ok' => false, 'error' => 'Brak identyfikatora komentarza.'], 422);
}

$isAdmin = (string) $user['role'] === 'admin' || pmx_is_admin_email((string) $user['email'], $config);

$stmt = $pdo->prepare('SELECT id, user_id, author_email FROM comments WHERE id = ? LIMIT 1');
$stmt->execute([$id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row) {
    pmx_json(['ok' => false, 'error' => 'Nie znaleziono komentarza.'], 404);
}

$isAuthor = false;
if ((int) $row['user_id'] === (int) $user['id']) {
    $isAuthor = true;
}
if (pmx_normalize_email((string) $row['author_email']) === pmx_normalize_email((string) $user['email'])) {
    $isAuthor = true;
}

if (!$isAdmin && !$isAuthor) {
    pmx_json(['ok' => false, 'error' => 'Brak uprawnień do usunięcia tego komentarza.'], 403);
}

$del = $pdo->prepare('DELETE FROM comments WHERE id = ?');
$del->execute([$id]);

pmx_json(['ok' => true]);
