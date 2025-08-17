<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_type', 'item_id', 'direction', 'quantity', 'reference', 'reason', 'transacted_at', 'user_id',
    ];

    public function item(): MorphTo
    {
        return $this->morphTo();
    }
}
