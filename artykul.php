<?php
/**
 * Widok pojedynczego artykułu dodanego przez admina.
 */
declare(strict_types=1);

$config = require __DIR__ . '/api/config.php';

function pmx_normalize_email(string $email): string
{
    return strtolower(trim($email));
}

function pmx_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: text/plain; charset=utf-8');
    echo (string) ($payload['error'] ?? 'Błąd');
    exit;
}

require_once __DIR__ . '/api/db.php';

$slug = trim((string) ($_GET['slug'] ?? ''));
if ($slug === '') {
    http_response_code(404);
    $title = 'Nie znaleziono artykułu';
    $bodyHtml = '<p>Brak identyfikatora artykułu.</p>';
    $subtitle = '';
    $emoji = '📝';
    $article = null;
} else {
    try {
        $pdo = pmx_db($config);
        $stmt = $pdo->prepare(
            'SELECT slug, title, subtitle, emoji, body, created_at FROM articles WHERE slug = ? AND published = 1 LIMIT 1'
        );
        $stmt->execute([$slug]);
        $article = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    } catch (Throwable $e) {
        http_response_code(500);
        $title = 'Błąd serwera';
        $bodyHtml = '<p>Nie udało się wczytać artykułu.</p>';
        $subtitle = '';
        $emoji = '📝';
        $article = null;
    }

    if ($article) {
        $title = (string) $article['title'];
        $subtitle = (string) $article['subtitle'];
        $emoji = (string) $article['emoji'];
        $bodyHtml = (string) $article['body'];
    } else {
        http_response_code(404);
        $title = 'Nie znaleziono artykułu';
        $bodyHtml = '<p>Ten artykuł nie istnieje lub został usunięty.</p><p><a href="artykuly">Wróć do listy artykułów</a></p>';
        $subtitle = '';
        $emoji = '📝';
    }
}

function h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <script src="/js/theme-init.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="/js/consent-head.js"></script>
    <meta name="google-adsense-account" content="ca-pub-8540801395510703">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8540801395510703" crossorigin="anonymous"></script>
    <title><?= h($title) ?> | Proteiner</title>
    <meta name="description" content="<?= h($subtitle !== '' ? $subtitle : $title) ?>">
    <link rel="canonical" href="https://proteiner.pl/artykul/<?= h(rawurlencode($slug)) ?>">
    <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Encode+Sans:wght@600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/themes.css">
    <link rel="stylesheet" href="/css/site.css">
    <link rel="stylesheet" href="/css/theme-switch.css">
    <link rel="stylesheet" href="/css/poradnik.css">
</head>
<body class="poradnik-page">
    <header class="site-header">
        <nav>
            <a href="/" class="logo">
                <img class="logo-mark" src="/images/favicon.svg" alt="" width="56" height="56" decoding="async">
                <span>Proteiner</span>
            </a>
            <ul class="nav-links">
                <li><a class="nav-link" href="/">Kalkulator</a></li>
                <li><a class="nav-link" href="/dieta">Dieta</a></li>
                <li><a class="nav-link" href="/porownaj-produkty">Porównaj produkty</a></li>
                <li><a class="nav-link" href="/dodaj-produkt">Dodaj produkty</a></li>
                <li><a class="nav-link" href="/poradnik-zywienia">Poradnik</a></li>
                <li><a class="nav-link active" href="/artykuly" aria-current="page">Artykuły</a></li>
                <li><a class="nav-link" href="/informacje">Informacje</a></li>
            </ul>
        </nav>
    </header>
    <div class="page-container">
        <main class="main-content">
            <nav class="breadcrumb category-breadcrumb" aria-label="Nawigacja">
                <a href="/">Strona główna</a> ›
                <a href="/artykuly">Artykuły</a> ›
                <span><?= h($title) ?></span>
            </nav>
            <div class="info-tab">
                <div class="page-hero">
                    <h1><?= h($emoji) ?> <?= h($title) ?></h1>
                    <?php if ($subtitle !== ''): ?>
                        <p class="subtitle"><?= h($subtitle) ?></p>
                    <?php endif; ?>
                </div>
                <div class="article-body">
                    <?= $bodyHtml ?>
                </div>
            </div>
        </main>
    </div>
    <footer class="site-footer">
        <p class="site-footer-brand"><strong>Proteiner</strong> — kalkulator dietetyczny i baza produktów</p>
        <nav class="site-footer-nav" aria-label="Nawigacja w stopce">
            <a href="/informacje">Informacje</a>
            <span aria-hidden="true">·</span>
            <a href="/artykuly">Artykuły</a>
            <span aria-hidden="true">·</span>
            <a href="/poradnik-zywienia">Poradnik</a>
        </nav>
        <p class="site-footer-copy">&copy; 2026 Wszelkie prawa zastrzeżone.</p>
    </footer>
    <link rel="stylesheet" href="/css/cookie-consent.css">
    <script src="/js/cookie-banner.js"></script>
<script src="/js/auth-ui.js"></script>
<script src="/js/theme.js"></script>
</body>
</html>
