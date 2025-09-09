<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['table_number', 'total', 'status'];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
