<?php
require_once dirname(__DIR__) . '/admin-require.php';

pmx_require_method('POST');
[$pdo, $user] = pmx_require_admin($config);
$body = pmx_read_json_body();

$name = trim((string) ($body['name'] ?? ''));
$category = trim((string) ($body['category'] ?? ''));
$emoji = trim((string) ($body['emoji'] ?? '🍽️'));
if ($emoji === '') {
    $emoji = '🍽️';
}

$allowedCategories = [
    'mieso', 'nabial', 'warzywa', 'owoce', 'zboza', 'polskie-obiadki',
    'zupy', 'orzechy', 'tluszcze', 'makarony', 'fastfood', 'slodycze', 'sosy',
];

if ($name === '' || mb_strlen($name) < 2) {
    pmx_json(['ok' => false, 'error' => 'Podaj nazwę produktu.'], 422);
}
if (!in_array($category, $allowedCategories, true)) {
    pmx_json(['ok' => false, 'error' => 'Nieprawidłowa kategoria.'], 422);
}

$num = static function ($v, bool $required = true): ?float {
    if ($v === null || $v === '') {
        return $required ? null : 0.0;
    }
    if (!is_numeric($v)) {
        return null;
    }
    return (float) $v;
};

$kcal = $num($body['kcal'] ?? null);
$protein = $num($body['protein'] ?? null);
$carbs = $num($body['carbs'] ?? null);
$fat = $num($body['fat'] ?? null);
$satFat = $num($body['satFat'] ?? null);
$unsatFat = $num($body['unsatFat'] ?? null);
$servingGrams = $num($body['servingGrams'] ?? null);
$servingText = trim((string) ($body['servingText'] ?? ''));
$micros = trim((string) ($body['micros'] ?? ''));
$extra = trim((string) ($body['extra'] ?? ''));
$servingPricePln = $num($body['servingPricePln'] ?? null, false);

if ($kcal === null || $protein === null || $carbs === null || $fat === null || $satFat === null || $unsatFat === null) {
    pmx_json(['ok' => false, 'error' => 'Uzupełnij wszystkie makro na 100 g.'], 422);
}
if ($servingGrams === null || $servingGrams <= 0) {
    pmx_json(['ok' => false, 'error' => 'Podaj gramaturę porcji.'], 422);
}
if ($servingText === '') {
    pmx_json(['ok' => false, 'error' => 'Podaj opis porcji.'], 422);
}
if ($satFat + $unsatFat > $fat + 0.6) {
    pmx_json(['ok' => false, 'error' => 'Suma tłuszczów nasyconych i nienasyconych jest zbyt duża względem tłuszczu ogółem.'], 422);
}

$servingRatio = round(($servingGrams / 100) * 1000) / 1000;
$proteinInServing = round($protein * $servingRatio * 10) / 10;

$product = [
    'name' => $name,
    'emoji' => $emoji,
    'category' => $category,
    'servingText' => $servingText,
    'servingRatio' => $servingRatio,
    'servingGrams' => $servingGrams,
    'kcal' => (int) round($kcal),
    'protein' => $protein,
    'carbs' => $carbs,
    'fat' => $fat,
    'satFat' => $satFat,
    'unsatFat' => $unsatFat,
    'micros' => $micros !== '' ? $micros : '—',
    'extra' => $extra,
    'servingPricePln' => ($servingPricePln !== null && $servingPricePln >= 0) ? $servingPricePln : null,
    'proteinInServing' => $proteinInServing,
];

if ($product['servingPricePln'] !== null && $protein > 0 && $servingRatio > 0) {
    $product['pricePer100gProtein'] = round((($product['servingPricePln'] * 100) / ($protein * $servingRatio)) * 100) / 100;
}

$baseSlug = pmx_slugify($name);
$slug = $baseSlug;
$i = 2;
$check = $pdo->prepare('SELECT id FROM custom_products WHERE slug = ? LIMIT 1');
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
    'INSERT INTO custom_products (slug, payload, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
);
$ins->execute([
    $slug,
    json_encode($product, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    (string) $user['email'],
    $now,
    $now,
]);

$product['slug'] = $slug;
$product['_custom'] = true;

pmx_json(['ok' => true, 'product' => $product]);
