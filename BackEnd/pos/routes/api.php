<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('menu-items', \App\Http\Controllers\MenuItemController::class);
Route::apiResource('orders', \App\Http\Controllers\OrderController::class);
Route::get('dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);

// Payment routes
Route::post('payments/confirm', [\App\Http\Controllers\PaymentController::class, 'confirmPayment']);
Route::get('payments/{orderId}/status', [\App\Http\Controllers\PaymentController::class, 'checkPaymentStatus']);
Route::get('payments/{orderId}/qr-code', [\App\Http\Controllers\PaymentController::class, 'generateQRCode']);
Route::post('payments/test-confirm/{orderId}', [\App\Http\Controllers\PaymentController::class, 'testPaymentConfirmation']);