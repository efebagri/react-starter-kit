<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Helpers\AdorableHelper;
use App\Http\Controllers\Api\GeoIpController;

Route::get('/avatar', function (Request $request) {
    $name = $request->query('name');
    $size = $request->integer('size', 450);

    return response()->json([
        'dataUrl' => AdorableHelper::getProfilePicture($name, $size),
    ]);
});

// GeoIP routes
Route::prefix('geoip')->group(function () {
    Route::get('/location', [GeoIpController::class, 'getLocation']);
    Route::post('/location', [GeoIpController::class, 'getLocationForIp']);
    Route::post('/asn', [GeoIpController::class, 'getAsnForIp']);
});
