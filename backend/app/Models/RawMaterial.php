<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'name', 'category', 'unit', 'stock_on_hand', 'reorder_point', 'reorder_quantity', 'safety_stock',
    ];
}
