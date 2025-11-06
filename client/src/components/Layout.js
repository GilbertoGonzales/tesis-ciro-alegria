import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, ClipboardList, BarChart3, LogOut, Menu, X } from 'lucide-react';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/docentes', label: 'Docentes', icon: Users },
    { path: '/asistencia', label: 'Asistencia', icon: ClipboardList },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: mobileMenuOpen ? '240px' : '0',
          backgroundColor: 'var(--bg-primary)',
          borderRight: '1px solid var(--border-light)',
          position: 'fixed',
          height: '100vh',
          overflowX: 'hidden',
          transition: 'width 0.2s ease',
          zIndex: 100,
        }}
        className="sidebar"
      >
        <div style={{ padding: '2rem 1.25rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
              Asistencia
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Sistema de Gestión
            </p>
          </div>
          <nav>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.875rem',
                    marginBottom: '0.25rem',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                    fontWeight: isActive ? '600' : '400',
                    fontSize: '0.875rem',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon size={18} strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '0' }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-light)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '0.375rem',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              {user.username}
            </span>
            <button
              onClick={onLogout}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto' }}>{children}</main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
          }}
        />
      )}

      <style>{`
        @media (min-width: 768px) {
          .sidebar {
            width: 240px !important;
            position: relative !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
