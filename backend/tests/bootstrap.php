<?php

require dirname(__DIR__).'/vendor/autoload.php';

// Set test environment
$_ENV['APP_ENV'] = 'test';
$_ENV['APP_DEBUG'] = '1';
$_ENV['APP_SECRET'] = 'test_secret_key_for_testing_only';
$_ENV['JWT_SECRET_KEY'] = dirname(__DIR__) . '/config/jwt/private.pem';
$_ENV['JWT_PUBLIC_KEY'] = dirname(__DIR__) . '/config/jwt/public.pem';
$_ENV['JWT_PASSPHRASE'] = 'mob_defi_jwt_passphrase';
$_ENV['API_USER_PASSWORD'] = 'test_password';
$_ENV['CORS_ALLOW_ORIGIN'] = '*';
