<?php

return [

    'paths' => ['api/*', 'proxy/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'], // use * for dev; in production, replace with your frontend URL

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];



