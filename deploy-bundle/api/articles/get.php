<?php
require_once dirname(__DIR__) . '/bootstrap.php';

pmx_require_method('GET');
$pdo = pmx_db($config);

$slug = trim((string) ($_GET['slug'] ?? ''));
if ($slug === '') {
    pmx_json(['ok' => false, 'error' => 'Brak sluga.'], 422);
}

$stmt = $pdo->prepare(
    'SELECT id, slug, title, subtitle, emoji, body, created_by, created_at, updated_at
     FROM articles WHERE slug = ? AND published = 1 LIMIT 1'
);
$stmt->execute([$slug]);
$row = $stmt->fetch();
if (!$row) {
    pmx_json(['ok' => false, 'error' => 'Nie znaleziono artykułu.'], 404);
}

pmx_json([
    'ok' => true,
    'article' => [
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'subtitle' => (string) $row['subtitle'],
        'emoji' => (string) $row['emoji'],
        'body' => (string) $row['body'],
        'createdBy' => (string) $row['created_by'],
        'createdAt' => (string) $row['created_at'],
        'updatedAt' => (string) $row['updated_at'],
    ],
]);
