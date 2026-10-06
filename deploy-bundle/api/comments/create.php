<?php
/**
 * Dodanie komentarza (wymaga zalogowania). Publikowany od razu.
 * POST /api/comments/create.php
 * body: { entity_type, entity_slug, body }
 */
require_once dirname(__DIR__) . '/bootstrap.php';

pmx_require_method('POST');

$pdo = pmx_db($config);
$user = pmx_current_user($pdo);
if (!$user) {
    pmx_json(['ok' => false, 'error' => 'Zaloguj się, aby dodać komentarz.'], 401);
}

$body = pmx_read_json_body();
$entityType = trim((string) ($body['entity_type'] ?? ''));
$entitySlug = trim((string) ($body['entity_slug'] ?? ''));
$text = trim((string) ($body['body'] ?? ''));

$allowed = ['product', 'article'];
if ($entityType === '' || !in_array($entityType, $allowed, true)) {
    pmx_json(['ok' => false, 'error' => 'Nieprawidłowy typ treści.'], 422);
}
if ($entitySlug === '' || mb_strlen($entitySlug) > 200) {
    pmx_json(['ok' => false, 'error' => 'Brak identyfikatora treści.'], 422);
}
$text = preg_replace('/\s+/u', ' ', $text) ?? '';
if ($text === '' || mb_strlen($text) < 2) {
    pmx_json(['ok' => false, 'error' => 'Komentarz jest za krótki (min. 2 znaki).'], 422);
}
if (mb_strlen($text) > 1000) {
    pmx_json(['ok' => false, 'error' => 'Komentarz jest za długi (maks. 1000 znaków).'], 422);
}

$authorName = trim((string) $user['name']);
if ($authorName === '') {
    $authorName = (string) $user['email'];
}

$now = gmdate('c');
$ins = $pdo->prepare(
    'INSERT INTO comments (entity_type, entity_slug, user_id, author_name, author_email, body, is_approved, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
);
$ins->execute([
    $entityType,
    $entitySlug,
    (int) $user['id'],
    $authorName,
    (string) $user['email'],
    $text,
    $now,
]);

$id = (int) $pdo->lastInsertId();
pmx_json([
    'ok' => true,
    'comment' => [
        'id' => $id,
        'author' => $authorName,
        'body' => $text,
        'createdAt' => $now,
        'isOwner' => true,
    ],
]);
