import { useEffect, useState } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import api from '../lib/api'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

export default function Reports() {
  const [overview, setOverview] = useState({ sales: [], inventory_turnover: [], production_efficiency: [] })

  useEffect(() => {
    api.get('/reports/overview').then(r => setOverview(r.data))
  }, [])

  const toLine = (rows, yKey, label) => ({
    labels: rows.map(r => (r.period || '').substring(0, 7)),
    datasets: [{ label, data: rows.map(r => r[yKey]), borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.2)' }]
  })

  const toBar = (rows, yKey, label) => ({
    labels: rows.map(r => (r.period || '').substring(0, 7)),
    datasets: [{ label, data: rows.map(r => r[yKey]), backgroundColor: 'rgba(25,135,84,0.5)', borderColor: '#198754' }]
  })

  return (
    <>
      <Row>
        <Col md={6} className="mb-3"><Card><Card.Body><Card.Title>Revenue</Card.Title><Line data={toLine(overview.sales, 'revenue', 'Revenue')} /></Card.Body></Card></Col>
        <Col md={6} className="mb-3"><Card><Card.Body><Card.Title>Orders</Card.Title><Bar data={toBar(overview.sales, 'orders', 'Orders')} /></Card.Body></Card></Col>
        <Col md={6} className="mb-3"><Card><Card.Body><Card.Title>Inventory Turnover (Qty Out)</Card.Title><Line data={toLine(overview.inventory_turnover, 'qty_out', 'Qty Out')} /></Card.Body></Card></Col>
        <Col md={6} className="mb-3"><Card><Card.Body><Card.Title>Production Efficiency (Qty)</Card.Title><Line data={toLine(overview.production_efficiency, 'qty', 'Qty')} /></Card.Body></Card></Col>
      </Row>
    </>
  )
}