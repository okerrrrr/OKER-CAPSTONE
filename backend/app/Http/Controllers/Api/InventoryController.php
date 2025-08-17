<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\RawMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();
        if ($search = $request->string('q')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%");
        }

        return $query->orderBy('name')->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sku' => ['required', 'string', 'max:64', 'unique:products,sku'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:128'],
            'lead_time_days' => ['nullable', 'integer', 'min:0'],
            'reorder_point' => ['nullable', 'integer', 'min:0'],
            'reorder_quantity' => ['nullable', 'integer', 'min:0'],
            'safety_stock' => ['nullable', 'integer', 'min:0'],
            'stock_on_hand' => ['nullable', 'integer', 'min:0'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:16'],
        ]);

        return Product::create($data);
    }

    public function show(Product $product)
    {
        return $product;
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:128'],
            'lead_time_days' => ['nullable', 'integer', 'min:0'],
            'reorder_point' => ['nullable', 'integer', 'min:0'],
            'reorder_quantity' => ['nullable', 'integer', 'min:0'],
            'safety_stock' => ['nullable', 'integer', 'min:0'],
            'stock_on_hand' => ['nullable', 'integer', 'min:0'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:16'],
        ]);
        $product->update($data);

        return $product->refresh();
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->noContent();
    }

    public function listRawMaterials(Request $request)
    {
        return RawMaterial::orderBy('name')->paginate(20);
    }

    public function createRawMaterial(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:64', 'unique:raw_materials,code'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:128'],
            'unit' => ['nullable', 'string', 'max:16'],
            'stock_on_hand' => ['nullable', 'integer', 'min:0'],
            'reorder_point' => ['nullable', 'integer', 'min:0'],
            'reorder_quantity' => ['nullable', 'integer', 'min:0'],
            'safety_stock' => ['nullable', 'integer', 'min:0'],
        ]);

        return RawMaterial::create($data);
    }

    public function updateRawMaterial(Request $request, int $id)
    {
        $raw = RawMaterial::findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:128'],
            'unit' => ['nullable', 'string', 'max:16'],
            'stock_on_hand' => ['nullable', 'integer', 'min:0'],
            'reorder_point' => ['nullable', 'integer', 'min:0'],
            'reorder_quantity' => ['nullable', 'integer', 'min:0'],
            'safety_stock' => ['nullable', 'integer', 'min:0'],
        ]);
        $raw->update($data);

        return $raw->refresh();
    }

    public function deleteRawMaterial(int $id)
    {
        RawMaterial::findOrFail($id)->delete();

        return response()->noContent();
    }

    public function summary()
    {
        return [
            'products_count' => Product::count(),
            'raw_materials_count' => RawMaterial::count(),
            'low_stock_products' => Product::whereColumn('stock_on_hand', '<=', 'reorder_point')->count(),
            'low_stock_raw' => RawMaterial::whereColumn('stock_on_hand', '<=', 'reorder_point')->count(),
        ];
    }

    public function adjust(Request $request)
    {
        $data = $request->validate([
            'item_type' => ['required', 'in:product,raw_material'],
            'item_id' => ['required', 'integer'],
            'direction' => ['required', 'in:in,out'],
            'quantity' => ['required', 'integer', 'min:1'],
            'reference' => ['nullable', 'string', 'max:128'],
            'reason' => ['nullable', 'string', 'max:255'],
            'transacted_at' => ['nullable', 'date'],
        ]);

        return DB::transaction(function () use ($data) {
            $transaction = InventoryTransaction::create([
                'item_type' => $data['item_type'] === 'product' ? Product::class : RawMaterial::class,
                'item_id' => $data['item_id'],
                'direction' => $data['direction'],
                'quantity' => $data['quantity'],
                'reference' => $data['reference'] ?? null,
                'reason' => $data['reason'] ?? null,
                'transacted_at' => $data['transacted_at'] ?? now(),
                'user_id' => auth()->id(),
            ]);

            if ($data['item_type'] === 'product') {
                $product = Product::findOrFail($data['item_id']);
                $product->increment('stock_on_hand', $data['direction'] === 'in' ? $data['quantity'] : -$data['quantity']);
            } else {
                $raw = RawMaterial::findOrFail($data['item_id']);
                $raw->increment('stock_on_hand', $data['direction'] === 'in' ? $data['quantity'] : -$data['quantity']);
            }

            return $transaction;
        });
    }
}
