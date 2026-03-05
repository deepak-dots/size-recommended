<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SizeReportController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'report_html' => 'required|string'
        ]);

        try {

            $response = Http::withHeaders([
                'Authorization' => 'Klaviyo-API-Key ' . env('KLAVIYO_PRIVATE_KEY'),
                'revision' => '2023-10-15',
                'Content-Type' => 'application/json'
            ])->post('https://a.klaviyo.com/api/events/', [
                'data' => [
                    'type' => 'event',
                    'attributes' => [
                        'metric' => [
                            'data' => [
                                'type' => 'metric',
                                'attributes' => [
                                    'name' => 'Sizing Completed'
                                ]
                            ]
                        ],
                        'profile' => [
                            'data' => [
                                'type' => 'profile',
                                'attributes' => [
                                    'email' => $request->email
                                ]
                            ]
                        ],
                        'properties' => [
                            'report_html' => $request->report_html
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                return response()->json(['success' => true]);
            }

            return response()->json([
                'success' => false,
                'error' => $response->body()
            ], 500);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}