<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Overview Report</title>
	<style>
		body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
		h1 { font-size: 18px; }
		table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
		th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
	</style>
</head>
<body>
	<h1>Overview</h1>
	<h3>Sales</h3>
	<table>
		<tr><th>Period</th><th>Orders</th><th>Revenue</th></tr>
		@foreach($sales as $row)
		<tr><td>{{ $row->period }}</td><td>{{ $row->orders }}</td><td>{{ number_format($row->revenue,2) }}</td></tr>
		@endforeach
	</table>
	<h3>Inventory Turnover (Qty Out)</h3>
	<table>
		<tr><th>Period</th><th>Qty Out</th></tr>
		@foreach($turnover as $row)
		<tr><td>{{ $row->period }}</td><td>{{ $row->qty_out }}</td></tr>
		@endforeach
	</table>
	<h3>Production Efficiency</h3>
	<table>
		<tr><th>Period</th><th>Quantity</th></tr>
		@foreach($efficiency as $row)
		<tr><td>{{ $row->period }}</td><td>{{ $row->qty }}</td></tr>
		@endforeach
	</table>
</body>
</html>