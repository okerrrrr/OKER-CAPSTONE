import { useEffect, useState } from 'react'
import { Table, Button, Row, Col, Form, Card, Modal } from 'react-bootstrap'
import api from '../lib/api'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [raws, setRaws] = useState([])
  const [adjust, setAdjust] = useState({ item_type: 'product', item_id: '', direction: 'in', quantity: 1 })
  const [showProdModal, setShowProdModal] = useState(false)
  const [prodForm, setProdForm] = useState({ sku: '', name: '', stock_on_hand: 0, reorder_point: 0, price: 0 })
  const [editingProd, setEditingProd] = useState(null)
  const [showRawModal, setShowRawModal] = useState(false)
  const [rawForm, setRawForm] = useState({ code: '', name: '', stock_on_hand: 0, reorder_point: 0 })
  const [editingRaw, setEditingRaw] = useState(null)

  const load = async () => {
    const [{ data: prods }, { data: raw }] = await Promise.all([
      api.get('/products'),
      api.get('/raw-materials')
    ])
    setProducts(prods.data)
    setRaws(raw.data)
  }

  useEffect(() => { load() }, [])

  const doAdjust = async (e) => {
    e.preventDefault()
    await api.post('/inventory/adjust', adjust)
    await load()
    alert('Inventory adjusted')
  }

  const openProd = (p) => {
    if (p) {
      setEditingProd(p)
      setProdForm({ sku: p.sku, name: p.name, stock_on_hand: p.stock_on_hand || 0, reorder_point: p.reorder_point || 0, price: p.price || 0 })
    } else {
      setEditingProd(null)
      setProdForm({ sku: '', name: '', stock_on_hand: 0, reorder_point: 0, price: 0 })
    }
    setShowProdModal(true)
  }

  const saveProd = async () => {
    if (editingProd) {
      await api.put(`/products/${editingProd.id}`, { name: prodForm.name, stock_on_hand: Number(prodForm.stock_on_hand), reorder_point: Number(prodForm.reorder_point), price: Number(prodForm.price) })
    } else {
      await api.post('/products', { ...prodForm, stock_on_hand: Number(prodForm.stock_on_hand), reorder_point: Number(prodForm.reorder_point), price: Number(prodForm.price) })
    }
    setShowProdModal(false)
    await load()
  }

  const deleteProd = async (id) => {
    if (!confirm('Delete product?')) return
    await api.delete(`/products/${id}`)
    await load()
  }

  const openRaw = (r) => {
    if (r) {
      setEditingRaw(r)
      setRawForm({ code: r.code, name: r.name, stock_on_hand: r.stock_on_hand || 0, reorder_point: r.reorder_point || 0 })
    } else {
      setEditingRaw(null)
      setRawForm({ code: '', name: '', stock_on_hand: 0, reorder_point: 0 })
    }
    setShowRawModal(true)
  }

  const saveRaw = async () => {
    if (editingRaw) {
      await api.put(`/raw-materials/${editingRaw.id}`, { name: rawForm.name, stock_on_hand: Number(rawForm.stock_on_hand), reorder_point: Number(rawForm.reorder_point) })
    } else {
      await api.post('/raw-materials', { ...rawForm, stock_on_hand: Number(rawForm.stock_on_hand), reorder_point: Number(rawForm.reorder_point) })
    }
    setShowRawModal(false)
    await load()
  }

  const deleteRaw = async (id) => {
    if (!confirm('Delete raw material?')) return
    await api.delete(`/raw-materials/${id}`)
    await load()
  }

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="mb-0">Products</h4>
            <Button size="sm" onClick={() => openProd(null)}>Add</Button>
          </div>
          <Table size="sm" bordered hover className="mt-2">
            <thead>
              <tr><th>SKU</th><th>Name</th><th>Stock</th><th>Reorder</th><th>Price</th><th></th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.sku}</td><td>{p.name}</td><td>{p.stock_on_hand}</td><td>{p.reorder_point}</td><td>{p.price}</td>
                  <td className="text-nowrap"><Button size="sm" variant="outline-secondary" onClick={() => openProd(p)} className="me-2">Edit</Button><Button size="sm" variant="outline-danger" onClick={() => deleteProd(p.id)}>Delete</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={6}>
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="mb-0">Raw Materials</h4>
            <Button size="sm" onClick={() => openRaw(null)}>Add</Button>
          </div>
          <Table size="sm" bordered hover className="mt-2">
            <thead>
              <tr><th>Code</th><th>Name</th><th>Stock</th><th>Reorder</th><th></th></tr>
            </thead>
            <tbody>
              {raws.map(r => (
                <tr key={r.id}>
                  <td>{r.code}</td><td>{r.name}</td><td>{r.stock_on_hand}</td><td>{r.reorder_point}</td>
                  <td className="text-nowrap"><Button size="sm" variant="outline-secondary" onClick={() => openRaw(r)} className="me-2">Edit</Button><Button size="sm" variant="outline-danger" onClick={() => deleteRaw(r.id)}>Delete</Button></td>
                </tr>
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

      <Modal show={showProdModal} onHide={() => setShowProdModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editingProd ? 'Edit Product' : 'Add Product'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            {!editingProd && (
              <Form.Group className="mb-2">
                <Form.Label>SKU</Form.Label>
                <Form.Control value={prodForm.sku} onChange={e => setProdForm({ ...prodForm, sku: e.target.value })} />
              </Form.Group>
            )}
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" value={prodForm.stock_on_hand} onChange={e => setProdForm({ ...prodForm, stock_on_hand: Number(e.target.value) })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Reorder Point</Form.Label>
              <Form.Control type="number" value={prodForm.reorder_point} onChange={e => setProdForm({ ...prodForm, reorder_point: Number(e.target.value) })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" value={prodForm.price} onChange={e => setProdForm({ ...prodForm, price: Number(e.target.value) })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProdModal(false)}>Cancel</Button>
          <Button onClick={saveProd}>Save</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRawModal} onHide={() => setShowRawModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editingRaw ? 'Edit Raw Material' : 'Add Raw Material'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            {!editingRaw && (
              <Form.Group className="mb-2">
                <Form.Label>Code</Form.Label>
                <Form.Control value={rawForm.code} onChange={e => setRawForm({ ...rawForm, code: e.target.value })} />
              </Form.Group>
            )}
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control value={rawForm.name} onChange={e => setRawForm({ ...rawForm, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" value={rawForm.stock_on_hand} onChange={e => setRawForm({ ...rawForm, stock_on_hand: Number(e.target.value) })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Reorder Point</Form.Label>
              <Form.Control type="number" value={rawForm.reorder_point} onChange={e => setRawForm({ ...rawForm, reorder_point: Number(e.target.value) })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRawModal(false)}>Cancel</Button>
          <Button onClick={saveRaw}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}