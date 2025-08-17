import { useEffect, useState } from 'react'
import { Table, Button, Row, Col, Form, Card, InputGroup } from 'react-bootstrap'
import api from '../lib/api'

export default function Orders() {
  const [catalog, setCatalog] = useState([])
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer' })
  const [trackingId, setTrackingId] = useState('')
  const [tracking, setTracking] = useState(null)

  useEffect(() => {
    api.get('/catalog').then(r => setCatalog(r.data.data))
  }, [])

  const addToCart = (p) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === p.id)
      if (existing) return prev.map(i => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product_id: p.id, name: p.name, quantity: 1, unit_price: p.price }]
    })
  }

  const place = async () => {
    const payload = {
      customer_name: customer.name,
      items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price }))
    }
    const { data } = await api.post('/orders', payload)
    alert('Order placed: #' + data.id)
    setCart([])
  }

  const checkTracking = async () => {
    if (!trackingId) return
    const { data } = await api.get(`/orders/public/${trackingId}/tracking`)
    setTracking(data)
  }

  return (
    <Row>
      <Col md={7}>
        <h4>Catalog</h4>
        <Table size="sm" bordered hover>
          <thead>
            <tr><th>SKU</th><th>Name</th><th>Price</th><th></th></tr>
          </thead>
          <tbody>
            {catalog.map(p => (
              <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>₱{p.price}</td><td><Button size="sm" onClick={() => addToCart(p)}>Add</Button></td></tr>
            ))}
          </tbody>
        </Table>
      </Col>
      <Col md={5}>
        <Card className="mb-3">
          <Card.Body>
            <h5>Cart</h5>
            <ul>
              {cart.map(i => <li key={i.product_id}>{i.name} x{i.quantity}</li>)}
            </ul>
            <Form.Group className="mb-2">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
            </Form.Group>
            <Button disabled={!cart.length} onClick={place} className="w-100">Place Order</Button>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <h5>Track Order</h5>
            <InputGroup className="mb-2">
              <Form.Control placeholder="Order ID" value={trackingId} onChange={e => setTrackingId(e.target.value)} />
              <Button onClick={checkTracking}>Check</Button>
            </InputGroup>
            {tracking && (
              <div className="small text-muted">
                Status: <strong>{tracking.status}</strong>{tracking.tracking_number ? ` • #${tracking.tracking_number}` : ''}
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}