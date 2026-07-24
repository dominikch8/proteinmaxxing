<?php
require_once dirname(__DIR__) . '/bootstrap.php';

pmx_require_method('GET');
$pdo = pmx_db($config);

$rows = $pdo->query('SELECT slug, payload, created_by, created_at, updated_at FROM custom_products ORDER BY created_at DESC')->fetchAll();
$products = [];
foreach ($rows as $row) {
    $payload = json_decode((string) $row['payload'], true);
    if (!is_array($payload)) {
        continue;
    }
    $payload['slug'] = $row['slug'];
    $payload['_custom'] = true;
    $payload['_createdBy'] = $row['created_by'];
    $payload['_createdAt'] = $row['created_at'];
    $products[] = $payload;
}

pmx_json(['ok' => true, 'products' => $products]);
