import { Container, Nav, Navbar } from 'react-bootstrap'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function App() {
  const navigate = useNavigate()
  const isAuthed = typeof window !== 'undefined' && !!localStorage.getItem('token')
  const logout = async () => {
    try { await api.post('/auth/logout') } catch (e) {}
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Unick Enterprises</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthed && <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/inventory">Inventory</Nav.Link>
                <Nav.Link as={Link} to="/orders">Orders</Nav.Link>
                <Nav.Link as={Link} to="/production">Production</Nav.Link>
                <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
              </>}
            </Nav>
            <Nav>
              {!isAuthed ? (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              ) : (
                <Nav.Link onClick={logout}>Logout</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        <Outlet />
      </Container>
    </>
  )
}