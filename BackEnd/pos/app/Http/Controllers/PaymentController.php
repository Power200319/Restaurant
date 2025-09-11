<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Confirm QR code payment
     */
    public function confirmPayment(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'transaction_id' => 'required|string',
            'payment_method' => 'required|string',
            'amount' => 'required|numeric',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $order = Order::findOrFail($request->order_id);

                // Check if order is already paid
                if ($order->payment_status === 'paid') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Order is already paid'
                    ], 400);
                }

                // Verify amount matches
                if (abs($order->total - $request->amount) > 0.01) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment amount does not match order total'
                    ], 400);
                }

                // Update order payment status
                $order->update([
                    'payment_status' => 'paid',
                    'payment_method' => $request->payment_method,
                    'transaction_id' => $request->transaction_id,
                    'paid_at' => now(),
                    'payment_data' => $request->all(),
                    'status' => 'preparing' // Move to preparing status after payment
                ]);

                Log::info('Payment confirmed for order', [
                    'order_id' => $order->id,
                    'transaction_id' => $request->transaction_id,
                    'amount' => $request->amount
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment confirmed successfully',
                    'order' => $order->load('orderItems.menuItem')
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Payment confirmation failed', [
                'order_id' => $request->order_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment confirmation failed'
            ], 500);
        }
    }

    /**
     * Check payment status for an order
     */
    public function checkPaymentStatus($orderId)
    {
        $order = Order::findOrFail($orderId);

        return response()->json([
            'order_id' => $order->id,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'total' => $order->total,
            'paid_at' => $order->paid_at,
            'transaction_id' => $order->transaction_id
        ]);
    }

    /**
     * Generate QR code data for payment
     */
    public function generateQRCode($orderId)
    {
        $order = Order::findOrFail($orderId);

        if ($order->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Order is already paid'
            ], 400);
        }

        $qrData = [
            'orderId' => $order->id,
            'amount' => $order->total,
            'currency' => 'USD',
            'timestamp' => now()->toISOString(),
            'merchant' => 'Khmer Food Palace'
        ];

        // Create QR code URL (using a free QR code service)
        $qrText = json_encode($qrData);
        $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($qrText);

        return response()->json([
            'success' => true,
            'qr_url' => $qrUrl,
            'qr_data' => $qrData,
            'order' => $order
        ]);
    }

    /**
     * Test endpoint to simulate payment confirmation (for development/testing)
     */
    public function testPaymentConfirmation(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $order = Order::findOrFail($request->order_id);

                // Check if order is already paid
                if ($order->payment_status === 'paid') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Order is already paid'
                    ], 400);
                }

                // Simulate payment confirmation
                $order->update([
                    'payment_status' => 'paid',
                    'payment_method' => 'test_qr_payment',
                    'transaction_id' => 'TEST_' . time() . '_' . $order->id,
                    'paid_at' => now(),
                    'payment_data' => [
                        'test_payment' => true,
                        'simulated' => true,
                        'timestamp' => now()->toISOString()
                    ],
                    'status' => 'preparing'
                ]);

                Log::info('Test payment confirmed for order', ['order_id' => $order->id]);

                return response()->json([
                    'success' => true,
                    'message' => 'Test payment confirmed successfully',
                    'order' => $order->load('orderItems.menuItem')
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Test payment confirmation failed', [
                'order_id' => $request->order_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Test payment confirmation failed'
            ], 500);
        }
    }
}
