<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Headers to add
        $headers = [
            'Access-Control-Allow-Origin' => '*', // or your frontend domain if using credentials
            'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age' => '3600',
            // 'Access-Control-Allow-Credentials' => 'true', // uncomment if using cookies/auth
        ];

        // Handle OPTIONS preflight request
        if ($request->getMethod() === "OPTIONS") {
            return response('', 200)->withHeaders($headers);
        }

        // Handle normal request
        $response = $next($request);

        // Add CORS headers to response
        foreach ($headers as $key => $value) {
            $response->header($key, $value);
        }

        return $response;
    }
}
