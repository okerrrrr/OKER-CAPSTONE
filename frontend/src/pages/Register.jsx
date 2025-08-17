import { useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role, phone })
      localStorage.setItem('token', data.token)
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row className="align-items-center" style={{ minHeight: '60vh' }}>
      <Col md={{ span: 6, offset: 3 }}>
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-3">Create account</h3>
            {error && <div className="text-danger mb-2">{error}</div>}
            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control value={name} onChange={e => setName(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone (optional)</Form.Label>
                <Form.Control value={phone} onChange={e => setPhone(e.target.value)} />
              </Form.Group>
              <Button type="submit" className="w-100" disabled={loading}>{loading ? 'Creating...' : 'Register'}</Button>
            </Form>
            <div className="mt-3 text-muted">Have an account? <Link to="/login">Login</Link></div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}