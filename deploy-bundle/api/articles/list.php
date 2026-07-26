<?php
require_once dirname(__DIR__) . '/bootstrap.php';

pmx_require_method('GET');
$pdo = pmx_db($config);

$rows = $pdo->query(
    'SELECT id, slug, title, subtitle, emoji, created_by, created_at, updated_at
     FROM articles WHERE published = 1 ORDER BY created_at DESC'
)->fetchAll();

$articles = array_map(static function (array $row): array {
    return [
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'subtitle' => (string) $row['subtitle'],
        'emoji' => (string) $row['emoji'],
        'createdBy' => (string) $row['created_by'],
        'createdAt' => (string) $row['created_at'],
        'updatedAt' => (string) $row['updated_at'],
        'url' => 'artykul/' . rawurlencode((string) $row['slug']),
    ];
}, $rows);

pmx_json(['ok' => true, 'articles' => $articles]);
