<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\RawMaterial;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            ['sku' => 'IPON-SMALL', 'name' => 'Ipon Challenge Small', 'category' => 'Coin Bank', 'price' => 199, 'stock_on_hand' => 50, 'reorder_point' => 20, 'reorder_quantity' => 100, 'unit' => 'pcs'],
            ['sku' => 'IPON-MED', 'name' => 'Ipon Challenge Medium', 'category' => 'Coin Bank', 'price' => 299, 'stock_on_hand' => 40, 'reorder_point' => 20, 'reorder_quantity' => 80, 'unit' => 'pcs'],
            ['sku' => 'IPON-LRG', 'name' => 'Ipon Challenge Large', 'category' => 'Coin Bank', 'price' => 399, 'stock_on_hand' => 30, 'reorder_point' => 15, 'reorder_quantity' => 60, 'unit' => 'pcs'],
        ];
        foreach ($products as $p) {
            Product::updateOrCreate(['sku' => $p['sku']], $p);
        }

        $materials = [
            ['code' => 'WOOD-PINE', 'name' => 'Pine Wood', 'category' => 'Wood', 'unit' => 'board', 'stock_on_hand' => 100],
            ['code' => 'PAINT-CLR', 'name' => 'Clear Paint', 'category' => 'Paint', 'unit' => 'L', 'stock_on_hand' => 25],
            ['code' => 'NAILS-1IN', 'name' => 'Nails 1 inch', 'category' => 'Hardware', 'unit' => 'box', 'stock_on_hand' => 20],
        ];
        foreach ($materials as $m) {
            RawMaterial::updateOrCreate(['code' => $m['code']], $m);
        }

        DB::transaction(function () {
            $product = Product::first();
            if (! $product) {
                return;
            }

            $order = Order::create([
                'user_id' => null,
                'customer_name' => 'Sample Customer',
                'customer_email' => 'customer@example.com',
                'customer_phone' => '09171234567',
                'shipping_address' => '123 Sample St',
                'shipping_city' => 'Quezon City',
                'shipping_region' => 'NCR',
                'shipping_postal_code' => '1100',
                'status' => 'pending',
                'subtotal' => 2 * $product->price,
                'shipping_cost' => 0,
                'discount' => 0,
                'total' => 2 * $product->price,
            ]);

            $order->items()->create([
                'product_id' => $product->id,
                'quantity' => 2,
                'unit_price' => $product->price,
                'line_total' => 2 * $product->price,
            ]);
        });
    }
}
