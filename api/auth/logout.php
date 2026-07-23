<?php
require_once dirname(__DIR__) . '/bootstrap.php';

pmx_require_method('POST');
pmx_logout_user();
pmx_json(['ok' => true]);
