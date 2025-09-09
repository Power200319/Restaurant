<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = ['name', 'price', 'image', 'category'];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
