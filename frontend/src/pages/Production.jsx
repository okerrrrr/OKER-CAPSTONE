import { useEffect, useState } from 'react'
import { Table, Button, Row, Col, Form, Card } from 'react-bootstrap'
import api from '../lib/api'

export default function Production() {
  const [entries, setEntries] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ product_id: '', production_date: new Date().toISOString().slice(0,10), quantity: 1, status: 'in_progress' })

  const load = async () => {
    const [{ data: entries }, { data: products }] = await Promise.all([
      api.get('/production'),
      api.get('/products')
    ])
    setEntries(entries.data)
    setProducts(products.data)
  }

  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    await api.post('/production', form)
    setForm({ ...form, quantity: 1 })
    load()
  }

  const complete = async (id) => {
    await api.post(`/production/${id}/complete`)
    load()
  }

  return (
    <Row>
      <Col md={5}>
        <Card className="mb-3"><Card.Body>
          <h5>Log Production</h5>
          <Form onSubmit={add}>
            <Form.Group className="mb-2">
              <Form.Label>Product</Form.Label>
              <Form.Select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}>
                <option value="">Select...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={form.production_date} onChange={e => setForm({ ...form, production_date: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Qty</Form.Label>
              <Form.Control type="number" min={1} value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
            </Form.Group>
            <Button type="submit" className="w-100">Add</Button>
          </Form>
        </Card.Body></Card>
      </Col>
      <Col md={7}>
        <h4>Recent Entries</h4>
        <Table size="sm" bordered hover>
          <thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td>{e.production_date}</td>
                <td>{e.product?.name}</td>
                <td>{e.quantity}</td>
                <td>{e.status}</td>
                <td>{e.status !== 'completed' && <Button size="sm" onClick={() => complete(e.id)}>Complete</Button>}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Col>
    </Row>
  )
}