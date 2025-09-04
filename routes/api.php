<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Helpers\AdorableHelper;

Route::get('/avatar', function (Request $request) {
    $name = $request->query('name');
    $size = $request->integer('size', 450);

    return response()->json([
        'dataUrl' => AdorableHelper::getProfilePicture($name, $size),
    ]);
});
