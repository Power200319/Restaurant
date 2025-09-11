<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Order::with('orderItems.menuItem')->latest()->take(10)->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'table_number' => 'nullable|string',
            'items' => 'required|array',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request) {
            $total = 0;
            foreach ($request->items as $item) {
                $menuItem = \App\Models\MenuItem::find($item['menu_item_id']);
                $total += $menuItem->price * $item['quantity'];
            }

            $order = Order::create([
                'table_number' => $request->table_number,
                'total' => $total,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            foreach ($request->items as $item) {
                $menuItem = \App\Models\MenuItem::find($item['menu_item_id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                    'price' => $menuItem->price,
                ]);
            }

            return $order;
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Order::with('orderItems.menuItem')->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->only(['status']));
        return $order;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Order::destroy($id);
        return response()->noContent();
    }
}
