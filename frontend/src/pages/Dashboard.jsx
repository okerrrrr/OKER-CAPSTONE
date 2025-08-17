import { useEffect, useState } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import api from '../lib/api'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function Dashboard() {
  const [summary, setSummary] = useState({ products_count: 0, raw_materials_count: 0, low_stock_products: 0, low_stock_raw: 0 })
  const [sales, setSales] = useState([])
  const [turnover, setTurnover] = useState([])
  const [eff, setEff] = useState([])

  useEffect(() => {
    api.get('/inventory/summary').then(r => setSummary(r.data))
    api.get('/reports/sales-stats').then(r => setSales(r.data))
    api.get('/reports/inventory-turnover').then(r => setTurnover(r.data))
    api.get('/reports/production-efficiency').then(r => setEff(r.data))
  }, [])

  const toLine = (rows, yKey) => ({
    labels: rows.map(r => (r.period || '').substring(0, 7)),
    datasets: [{ label: yKey, data: rows.map(r => r[yKey]), borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.2)' }]
  })

  return (
    <>
      <Row className="mb-3">
        <Col md={3}><Card><Card.Body><div className="text-muted">Products</div><div className="fs-3">{summary.products_count}</div></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><div className="text-muted">Raw Materials</div><div className="fs-3">{summary.raw_materials_count}</div></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><div className="text-muted">Low Stock (Products)</div><div className="fs-3">{summary.low_stock_products}</div></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><div className="text-muted">Low Stock (Raw)</div><div className="fs-3">{summary.low_stock_raw}</div></Card.Body></Card></Col>
      </Row>
      <Row>
        <Col md={6} className="mb-3"><Card><Card.Body><Card.Title>Sales</Card.Title><Line data={toLine(sales, 'revenue')} /></Card.Body></Card></Col>
        <Col md={6} className="mb-3"><Card><Card.Body><Card.Title>Inventory Turnover (Qty Out)</Card.Title><Line data={toLine(turnover, 'qty_out')} /></Card.Body></Card></Col>
        <Col md={12} className="mb-3"><Card><Card.Body><Card.Title>Production Efficiency (Qty)</Card.Title><Line data={toLine(eff, 'qty')} /></Card.Body></Card></Col>
      </Row>
    </>
  )
}