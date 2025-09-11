<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'table_number',
        'total',
        'status',
        'payment_status',
        'payment_method',
        'transaction_id',
        'paid_at',
        'payment_data'
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'paid_at' => 'datetime',
        'payment_data' => 'array',
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
