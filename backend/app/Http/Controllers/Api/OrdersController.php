<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Notifications\OrderPlaced;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class OrdersController extends Controller
{
    public function index(Request $request)
    {
        return Order::with('items.product')->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        return $this->place($request, auth()->id());
    }

    public function show(Order $order)
    {
        return $order->load('items.product');
    }

    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'customer_name' => ['sometimes', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email'],
            'customer_phone' => ['nullable', 'string', 'max:32'],
            'shipping_address' => ['nullable', 'string', 'max:255'],
            'shipping_city' => ['nullable', 'string', 'max:128'],
            'shipping_region' => ['nullable', 'string', 'max:128'],
            'shipping_postal_code' => ['nullable', 'string', 'max:32'],
        ]);
        $order->update($data);

        return $order->refresh();
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return response()->noContent();
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,in_production,ready_for_shipping,shipped,completed,cancelled'],
            'logistics_provider' => ['nullable', 'string', 'max:128'],
            'tracking_number' => ['nullable', 'string', 'max:128'],
        ]);

        $order->update($data);
        Notification::send(auth()->user(), new OrderStatusUpdated($order));

        return $order->refresh();
    }

    public function catalog(Request $request)
    {
        return Product::orderBy('name')->paginate(20);
    }

    public function placePublicOrder(Request $request)
    {
        return $this->place($request, null);
    }

    public function publicTracking(Order $order)
    {
        return $order->only(['id', 'status', 'logistics_provider', 'tracking_number', 'placed_at', 'shipped_at', 'delivered_at']);
    }

    private function place(Request $request, ?int $userId)
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email'],
            'customer_phone' => ['nullable', 'string', 'max:32'],
            'shipping_address' => ['nullable', 'string', 'max:255'],
            'shipping_city' => ['nullable', 'string', 'max:128'],
            'shipping_region' => ['nullable', 'string', 'max:128'],
            'shipping_postal_code' => ['nullable', 'string', 'max:32'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
        ]);

        return DB::transaction(function () use ($data, $userId) {
            $subtotal = 0;
            $itemsToCreate = [];
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $unitPrice = $item['unit_price'] ?? $product->price;
                $lineTotal = $unitPrice * $item['quantity'];
                $subtotal += $lineTotal;
                $itemsToCreate[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            }

            $shipping = $data['shipping_cost'] ?? 0;
            $discount = $data['discount'] ?? 0;
            $total = max($subtotal + $shipping - $discount, 0);

            $order = Order::create([
                'user_id' => $userId,
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'shipping_city' => $data['shipping_city'] ?? null,
                'shipping_region' => $data['shipping_region'] ?? null,
                'shipping_postal_code' => $data['shipping_postal_code'] ?? null,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_cost' => $shipping,
                'discount' => $discount,
                'total' => $total,
            ]);

            foreach ($itemsToCreate as $row) {
                $order->items()->create($row);
            }

            Notification::send(auth()->user(), new OrderPlaced($order));

            return $order->load('items.product');
        });
    }
}
