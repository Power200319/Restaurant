<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard stats.
     */
    public function stats()
    {
        $today = now()->toDateString();

        $totalOrdersToday = Order::whereDate('created_at', $today)->count();
        $revenue = Order::whereDate('created_at', $today)->sum('total');
        $activeTables = Order::where('status', '!=', 'completed')->distinct('table_number')->count();
        $pendingOrders = Order::where('status', 'pending')->count();

        return response()->json([
            [
                'label' => 'Total Orders Today',
                'value' => $totalOrdersToday,
                'change' => '+12%', // Mock change, can calculate from previous day
                'icon' => '📊'
            ],
            [
                'label' => 'Revenue',
                'value' => '$' . number_format($revenue, 2),
                'change' => '+8%',
                'icon' => '💰'
            ],
            [
                'label' => 'Active Tables',
                'value' => $activeTables . '/12', // Assuming 12 tables
                'change' => '+2',
                'icon' => '🍽️'
            ],
            [
                'label' => 'Pending Orders',
                'value' => $pendingOrders,
                'change' => '-3',
                'icon' => '⏳'
            ]
        ]);
    }
}
