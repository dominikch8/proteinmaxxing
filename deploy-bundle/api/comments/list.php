<?php
/**
 * Lista komentarzy dla produktu/artykułu (entity_type + entity_slug).
 * GET /api/comments/list.php?entity_type=product&entity_slug=banan
 */
require_once dirname(__DIR__) . '/bootstrap.php';

pmx_require_method('GET');

$entityType = trim((string) ($_GET['entity_type'] ?? ''));
$entitySlug = trim((string) ($_GET['entity_slug'] ?? ''));

$allowed = ['product', 'article'];
if ($entityType === '' || !in_array($entityType, $allowed, true)) {
    pmx_json(['ok' => false, 'error' => 'Nieprawidłowy typ treści.'], 422);
}
if ($entitySlug === '' || mb_strlen($entitySlug) > 200) {
    pmx_json(['ok' => false, 'error' => 'Brak identyfikatora treści.'], 422);
}

$pdo = pmx_db($config);
$user = pmx_current_user($pdo);

$stmt = $pdo->prepare(
    'SELECT id, author_name, body, created_at, user_id, author_email
     FROM comments
     WHERE entity_type = ? AND entity_slug = ? AND is_approved = 1
     ORDER BY created_at ASC'
);
$stmt->execute([$entityType, $entitySlug]);
$rows = $stmt->fetchAll();

$comments = array_map(static function (array $row) use ($user): array {
    $isOwner = false;
    if ($user) {
        if ((int) $row['user_id'] === (int) $user['id']) {
            $isOwner = true;
        }
        if (pmx_normalize_email((string) $row['author_email']) === pmx_normalize_email((string) $user['email'])) {
            $isOwner = true;
        }
    }
    $c = pmx_public_comment($row);
    $c['isOwner'] = $isOwner;
    return $c;
}, $rows);

pmx_json(['ok' => true, 'comments' => $comments, 'canComment' => $user !== null]);
