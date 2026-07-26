<?php
require_once dirname(__DIR__) . '/admin-require.php';

pmx_require_method('POST');
[$pdo] = pmx_require_admin($config);
$body = pmx_read_json_body();
$slug = trim((string) ($body['slug'] ?? ''));

if ($slug === '') {
    pmx_json(['ok' => false, 'error' => 'Brak sluga artykułu.'], 422);
}

$del = $pdo->prepare('DELETE FROM articles WHERE slug = ?');
$del->execute([$slug]);
if ($del->rowCount() < 1) {
    pmx_json(['ok' => false, 'error' => 'Nie znaleziono artykułu.'], 404);
}

pmx_json(['ok' => true]);
