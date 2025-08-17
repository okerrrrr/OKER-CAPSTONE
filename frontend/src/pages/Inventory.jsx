import { useEffect, useState } from 'react'
import { Table, Button, Row, Col, Form, Card } from 'react-bootstrap'
import api from '../lib/api'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [raws, setRaws] = useState([])
  const [adjust, setAdjust] = useState({ item_type: 'product', item_id: '', direction: 'in', quantity: 1 })

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data.data))
    api.get('/raw-materials').then(r => setRaws(r.data.data))
  }, [])

  const doAdjust = async (e) => {
    e.preventDefault()
    await api.post('/inventory/adjust', adjust)
    // refresh lists
    api.get('/products').then(r => setProducts(r.data.data))
    api.get('/raw-materials').then(r => setRaws(r.data.data))
  }

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <h4>Products</h4>
          <Table size="sm" bordered hover>
            <thead>
              <tr><th>SKU</th><th>Name</th><th>Stock</th><th>Reorder</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.stock_on_hand}</td><td>{p.reorder_point}</td></tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={6}>
          <h4>Raw Materials</h4>
          <Table size="sm" bordered hover>
            <thead>
              <tr><th>Code</th><th>Name</th><th>Stock</th><th>Reorder</th></tr>
            </thead>
            <tbody>
              {raws.map(r => (
                <tr key={r.id}><td>{r.code}</td><td>{r.name}</td><td>{r.stock_on_hand}</td><td>{r.reorder_point}</td></tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <h5>Adjust Inventory</h5>
          <Form onSubmit={doAdjust}>
            <Row className="g-2">
              <Col md={2}>
                <Form.Select value={adjust.item_type} onChange={e => setAdjust(a => ({ ...a, item_type: e.target.value }))}>
                  <option value="product">Product</option>
                  <option value="raw_material">Raw Material</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Control placeholder="ID" value={adjust.item_id} onChange={e => setAdjust(a => ({ ...a, item_id: e.target.value }))} />
              </Col>
              <Col md={2}>
                <Form.Select value={adjust.direction} onChange={e => setAdjust(a => ({ ...a, direction: e.target.value }))}>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Control type="number" min={1} value={adjust.quantity} onChange={e => setAdjust(a => ({ ...a, quantity: Number(e.target.value) }))} />
              </Col>
              <Col md={3}>
                <Button type="submit" className="w-100">Apply</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </>
  )
}