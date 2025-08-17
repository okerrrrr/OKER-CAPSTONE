<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\OrdersController;
use App\Http\Controllers\Api\ProductionController;
use App\Http\Controllers\Api\ReportsController;

Route::prefix('auth')->group(function () {
	Route::post('register', [AuthController::class, 'register']);
	Route::post('login', [AuthController::class, 'login']);
	Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
	Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
	// Inventory
	Route::get('inventory/summary', [InventoryController::class, 'summary']);
	Route::apiResource('products', InventoryController::class)->parameters(['products' => 'product'])->only(['index','store','show','update','destroy']);
	Route::get('raw-materials', [InventoryController::class, 'listRawMaterials']);
	Route::post('raw-materials', [InventoryController::class, 'createRawMaterial']);
	Route::put('raw-materials/{id}', [InventoryController::class, 'updateRawMaterial']);
	Route::delete('raw-materials/{id}', [InventoryController::class, 'deleteRawMaterial']);
	Route::post('inventory/adjust', [InventoryController::class, 'adjust']);

	// Orders
	Route::apiResource('orders', OrdersController::class);
	Route::post('orders/{order}/status', [OrdersController::class, 'updateStatus']);
	Route::post('orders/estimate-shipping', [OrdersController::class, 'estimateShipping']);

	// Production
	Route::apiResource('production', ProductionController::class);
	Route::post('production/{entry}/complete', [ProductionController::class, 'complete']);
	Route::get('production/recommendations', [ProductionController::class, 'recommendations']);

	// Reports
	Route::get('reports/overview', [ReportsController::class, 'overview']);
	Route::get('reports/inventory-turnover', [ReportsController::class, 'inventoryTurnover']);
	Route::get('reports/production-efficiency', [ReportsController::class, 'productionEfficiency']);
	Route::get('reports/sales-stats', [ReportsController::class, 'salesStats']);
	Route::get('reports/products/{product}/forecast', [ReportsController::class, 'forecastInventory']);
	Route::get('reports/export/sales.csv', [ReportsController::class, 'exportSalesCsv']);
	Route::get('reports/export/overview.pdf', [ReportsController::class, 'exportOverviewPdf']);
});

// Public endpoints
Route::get('catalog', [OrdersController::class, 'catalog']);
Route::post('orders/public', [OrdersController::class, 'placePublicOrder']);
Route::get('orders/public/{order}/tracking', [OrdersController::class, 'publicTracking']);
