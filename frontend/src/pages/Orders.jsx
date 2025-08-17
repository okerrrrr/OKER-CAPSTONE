import { useEffect, useState } from 'react'
import { Table, Button, Row, Col, Form, Card } from 'react-bootstrap'
import api from '../lib/api'

export default function Orders() {
  const [catalog, setCatalog] = useState([])
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer' })

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
        <Card>
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
      </Col>
    </Row>
  )
}