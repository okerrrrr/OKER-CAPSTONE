import { Container, Nav, Navbar } from 'react-bootstrap'
import { Outlet, Link } from 'react-router-dom'

export default function App() {
  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Unick Enterprises</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/inventory">Inventory</Nav.Link>
              <Nav.Link as={Link} to="/orders">Orders</Nav.Link>
              <Nav.Link as={Link} to="/production">Production</Nav.Link>
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