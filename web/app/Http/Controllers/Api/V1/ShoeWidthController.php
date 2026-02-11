<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\V1\ApiController;

class ShoeWidthController extends ApiController
{
    public function index()
    {
        $widths = DB::table('shoe_widths')->select('id', 'code', 'label')->get();

        return response()->json([
            'success' => true,
            'data' => $widths
        ]);
    }
}
