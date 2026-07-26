<?php
require_once dirname(__DIR__) . '/admin-require.php';

pmx_require_method('POST');
[$pdo, $user] = pmx_require_admin($config);
$body = pmx_read_json_body();

$title = trim((string) ($body['title'] ?? ''));
$subtitle = trim((string) ($body['subtitle'] ?? ''));
$emoji = trim((string) ($body['emoji'] ?? '📝'));
$content = trim((string) ($body['body'] ?? ''));
$slugInput = trim((string) ($body['slug'] ?? ''));

if ($title === '' || mb_strlen($title) < 3) {
    pmx_json(['ok' => false, 'error' => 'Podaj tytuł artykułu (min. 3 znaki).'], 422);
}
if ($content === '' || mb_strlen($content) < 20) {
    pmx_json(['ok' => false, 'error' => 'Treść artykułu jest za krótka.'], 422);
}
if ($emoji === '') {
    $emoji = '📝';
}

// Prosty tekst → akapity HTML (bez surowego HTML z formularza)
$escaped = htmlspecialchars($content, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$parts = preg_split("/\R{2,}/u", $escaped) ?: [];
$htmlParts = [];
foreach ($parts as $part) {
    $part = trim($part);
    if ($part === '') {
        continue;
    }
    $part = nl2br($part, false);
    $htmlParts[] = '<p>' . $part . '</p>';
}
$htmlBody = $htmlParts ? implode("\n", $htmlParts) : '<p>' . nl2br($escaped, false) . '</p>';

$baseSlug = $slugInput !== '' ? pmx_slugify($slugInput) : pmx_slugify($title);
$slug = $baseSlug;
$i = 2;
$check = $pdo->prepare('SELECT id FROM articles WHERE slug = ? LIMIT 1');
while (true) {
    $check->execute([$slug]);
    if (!$check->fetch()) {
        break;
    }
    $slug = $baseSlug . '-' . $i;
    $i++;
}

$now = gmdate('c');
$ins = $pdo->prepare(
    'INSERT INTO articles (slug, title, subtitle, emoji, body, published, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)'
);
$ins->execute([
    $slug,
    $title,
    $subtitle,
    $emoji,
    $htmlBody,
    (string) $user['email'],
    $now,
    $now,
]);

pmx_json([
    'ok' => true,
    'article' => [
        'id' => (int) $pdo->lastInsertId(),
        'slug' => $slug,
        'title' => $title,
        'subtitle' => $subtitle,
        'emoji' => $emoji,
        'url' => 'artykul/' . rawurlencode($slug),
    ],
]);
