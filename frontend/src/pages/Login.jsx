import { useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import api from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('admin@unick.local')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Login failed')
    }
  }

  return (
    <Row className="align-items-center" style={{ minHeight: '60vh' }}>
      <Col md={6} className="mb-4">
        <h1 className="display-5 fw-bold">Ipon Challenge</h1>
        <p className="lead">Beautiful wooden coin banks crafted by Unick Enterprises. Track orders, inventory, and production all in one place.</p>
        <ul>
          <li>Real-time order status</li>
          <li>Smart inventory forecasting</li>
          <li>Production performance insights</li>
        </ul>
      </Col>
      <Col md={6}>
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-3">Sign in</h3>
            {error && <div className="text-danger mb-2">{error}</div>}
            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </Form.Group>
              <Button type="submit" className="w-100">Login</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}