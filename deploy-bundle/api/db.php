<?php
/**
 * SQLite: użytkownicy + treści admina (produkty, artykuły).
 */

declare(strict_types=1);

function pmx_db(array $config): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $path = (string) ($config['db_path'] ?? (__DIR__ . '/../data/users.sqlite'));
    $dir = dirname($path);
    if (!is_dir($dir)) {
        if (!mkdir($dir, 0750, true) && !is_dir($dir)) {
            pmx_json(['ok' => false, 'error' => 'Nie można utworzyć katalogu danych.'], 500);
        }
    }

    $pdo = new PDO('sqlite:' . $path, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT \'user\',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )'
    );
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS custom_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT NOT NULL UNIQUE,
            payload TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )'
    );
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            subtitle TEXT NOT NULL DEFAULT \'\',
            emoji TEXT NOT NULL DEFAULT \'📝\',
            body TEXT NOT NULL,
            published INTEGER NOT NULL DEFAULT 1,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )'
    );

    pmx_bootstrap_admin($pdo, $config);
    pmx_sync_admin_emails($pdo, $config);
    return $pdo;
}

function pmx_bootstrap_admin(PDO $pdo, array $config): void
{
    $boot = $config['bootstrap_admin'] ?? null;
    if (!is_array($boot)) {
        return;
    }
    $email = pmx_normalize_email((string) ($boot['email'] ?? ''));
    $password = (string) ($boot['password'] ?? '');
    $name = trim((string) ($boot['name'] ?? 'Admin'));
    if ($email === '' || $password === '') {
        return;
    }

    $stmt = $pdo->prepare('SELECT id, role FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    $now = gmdate('c');

    if ($existing) {
        if (($existing['role'] ?? '') !== 'admin') {
            $upd = $pdo->prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?');
            $upd->execute(['admin', $now, (int) $existing['id']]);
        }
        return;
    }

    $ins = $pdo->prepare(
        'INSERT INTO users (email, name, password_hash, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $ins->execute([
        $email,
        $name !== '' ? $name : 'Admin',
        password_hash($password, PASSWORD_DEFAULT),
        'admin',
        $now,
        $now,
    ]);
}

function pmx_sync_admin_emails(PDO $pdo, array $config): void
{
    $admins = $config['admin_emails'] ?? [];
    if (!is_array($admins)) {
        return;
    }
    $now = gmdate('c');
    $upd = $pdo->prepare('UPDATE users SET role = ?, updated_at = ? WHERE email = ? AND role != ?');
    foreach ($admins as $adminEmail) {
        $email = pmx_normalize_email((string) $adminEmail);
        if ($email === '') {
            continue;
        }
        $upd->execute(['admin', $now, $email, 'admin']);
    }
}

function pmx_slugify(string $text): string
{
    $map = [
        'ą' => 'a', 'ć' => 'c', 'ę' => 'e', 'ł' => 'l', 'ń' => 'n',
        'ó' => 'o', 'ś' => 's', 'ź' => 'z', 'ż' => 'z',
        'Ą' => 'a', 'Ć' => 'c', 'Ę' => 'e', 'Ł' => 'l', 'Ń' => 'n',
        'Ó' => 'o', 'Ś' => 's', 'Ź' => 'z', 'Ż' => 'z',
    ];
    $text = strtr($text, $map);
    if (function_exists('iconv')) {
        $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        if (is_string($converted) && $converted !== '') {
            $text = $converted;
        }
    }
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    return trim($text, '-') ?: 'pozycja';
}
