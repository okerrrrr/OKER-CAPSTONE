<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryTransaction;
use App\Models\ProductionEntry;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductionController extends Controller
{
	public function index(Request $request)
	{
		return ProductionEntry::with('product')->latest('production_date')->paginate(20);
	}

	public function store(Request $request)
	{
		$data = $request->validate([
			'product_id' => ['required','exists:products,id'],
			'production_date' => ['required','date'],
			'quantity' => ['required','integer','min:1'],
			'status' => ['nullable','in:in_progress,completed'],
			'work_center' => ['nullable','string','max:128'],
			'remarks' => ['nullable','string'],
		]);
		$data['user_id'] = auth()->id();
		return ProductionEntry::create($data);
	}

	public function show(ProductionEntry $production)
	{
		return $production->load('product');
	}

	public function update(Request $request, ProductionEntry $production)
	{
		$data = $request->validate([
			'production_date' => ['sometimes','date'],
			'quantity' => ['sometimes','integer','min:1'],
			'status' => ['nullable','in:in_progress,completed'],
			'work_center' => ['nullable','string','max:128'],
			'remarks' => ['nullable','string'],
		]);
		$production->update($data);
		return $production->refresh();
	}

	public function destroy(ProductionEntry $production)
	{
		$production->delete();
		return response()->noContent();
	}

	public function complete(ProductionEntry $entry)
	{
		if ($entry->status === 'completed') {
			return $entry;
		}

		return DB::transaction(function () use ($entry) {
			$entry->update(['status' => 'completed']);
			// Increase finished goods inventory
			\App\Models\InventoryTransaction::create([
				'item_type' => Product::class,
				'item_id' => $entry->product_id,
				'direction' => 'in',
				'quantity' => $entry->quantity,
				'reference' => 'production:'.$entry->id,
				'reason' => 'Production completion',
				'user_id' => auth()->id(),
				'transacted_at' => now(),
			]);
			Product::whereKey($entry->product_id)->increment('stock_on_hand', $entry->quantity);
			return $entry->refresh();
		});
	}

	public function recommendations()
	{
		$lowStock = Product::whereColumn('stock_on_hand', '<=', 'reorder_point')
			->orderByRaw('(reorder_point - stock_on_hand) DESC')
			->limit(10)
			->get(['id','name','stock_on_hand','reorder_point','reorder_quantity']);
		return $lowStock->map(function ($p) {
			return [
				'product_id' => $p->id,
				'name' => $p->name,
				'suggested_batch' => max($p->reorder_quantity, ($p->reorder_point + $p->safety_stock) - $p->stock_on_hand),
			];
		});
	}
}
