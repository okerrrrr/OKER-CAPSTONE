<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryTransaction;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductionEntry;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportsController extends Controller
{
    public function overview()
    {
        return [
            'sales' => $this->salesStats(),
            'inventory_turnover' => $this->inventoryTurnover(),
            'production_efficiency' => $this->productionEfficiency(),
        ];
    }

    private function monthExpr(string $column): string
    {
        $driver = DB::connection()->getDriverName();
        if ($driver === 'sqlite') {
            return "strftime('%Y-%m-01', $column)";
        }

        // mysql / mariadb
        return "DATE_FORMAT($column, '%Y-%m-01')";
    }

    public function inventoryTurnover()
    {
        $expr = $this->monthExpr('transacted_at');
        $monthly = InventoryTransaction::selectRaw("$expr as period, SUM(CASE WHEN direction='out' THEN quantity ELSE 0 END) as qty_out")
            ->groupBy('period')
            ->orderBy('period')
            ->limit(12)
            ->get();

        return $monthly;
    }

    public function productionEfficiency()
    {
        $expr = $this->monthExpr('production_date');
        $monthly = ProductionEntry::selectRaw("$expr as period, SUM(quantity) as qty")
            ->groupBy('period')
            ->orderBy('period')
            ->limit(12)
            ->get();

        return $monthly;
    }

    public function salesStats()
    {
        $expr = $this->monthExpr('placed_at');
        $monthly = Order::selectRaw("$expr as period, COUNT(*) as orders, SUM(total) as revenue")
            ->groupBy('period')
            ->orderBy('period')
            ->limit(12)
            ->get();

        return $monthly;
    }

    public function forecastInventory(Request $request, Product $product)
    {
        $n = (int) $request->get('window', 3);
        $expr = $this->monthExpr('transacted_at');
        $series = InventoryTransaction::where('item_type', Product::class)
            ->where('item_id', $product->id)
            ->selectRaw("$expr as period, SUM(CASE WHEN direction='out' THEN quantity ELSE 0 END) as qty_out")
            ->groupBy('period')->orderBy('period')->limit(12)->get();

        $values = $series->pluck('qty_out')->map(fn ($v) => (int) $v)->values()->all();
        $forecast = null;
        if (count($values) >= $n) {
            $forecast = array_sum(array_slice($values, -$n)) / $n;
        }

        return [
            'history' => $series,
            'moving_average' => $forecast,
        ];
    }

    public function exportSalesCsv(): StreamedResponse
    {
        $data = $this->salesStats();
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sales_stats.csv"',
        ];
        $callback = function () use ($data) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['period', 'orders', 'revenue']);
            foreach ($data as $row) {
                fputcsv($out, [$row->period, $row->orders, $row->revenue]);
            }
            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportOverviewPdf()
    {
        $viewData = [
            'sales' => $this->salesStats(),
            'turnover' => $this->inventoryTurnover(),
            'efficiency' => $this->productionEfficiency(),
        ];
        $pdf = Pdf::loadView('reports.overview', $viewData);

        return $pdf->download('overview.pdf');
    }
}
