import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, QrCode } from 'lucide-react';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../services/api';
import TeacherQRCode from '../components/TeacherQRCode';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacherQR, setSelectedTeacherQR] = useState(null);
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    especialidad: '',
    activo: 1,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [searchTerm, teachers]);

  const loadTeachers = async () => {
    try {
      const response = await getTeachers();
      setTeachers(response.data);
      setFilteredTeachers(response.data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    if (!searchTerm) {
      setFilteredTeachers(teachers);
      return;
    }

    const filtered = teachers.filter(
      (teacher) =>
        teacher.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.dni.includes(searchTerm) ||
        (teacher.especialidad && teacher.especialidad.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTeachers(filtered);
  };

  const handleOpenModal = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData(teacher);
    } else {
      setEditingTeacher(null);
      setFormData({
        dni: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        especialidad: '',
        activo: 1,
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setError('');
  };

  // Validación: solo letras y espacios
  const handleTextOnlyChange = (field, value) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    if (regex.test(value)) {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Validación: solo números
  const handleNumberOnlyChange = (field, value) => {
    const regex = /^[0-9]*$/;
    if (regex.test(value)) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData);
      } else {
        await createTeacher(formData);
      }
      loadTeachers();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar docente');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de desactivar este docente?')) {
      try {
        await deleteTeacher(id);
        loadTeachers();
      } catch (error) {
        alert('Error al desactivar docente');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>Gestión de Docentes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Administra la información de los docentes</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Nuevo Docente
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={20}
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nombre, apellido, DNI o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Especialidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No se encontraron docentes
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.dni}</td>
                    <td>{teacher.apellido}</td>
                    <td>{teacher.nombre}</td>
                    <td>{teacher.email || '-'}</td>
                    <td>{teacher.telefono || '-'}</td>
                    <td>{teacher.especialidad || '-'}</td>
                    <td>
                      <span className={`badge ${teacher.activo ? 'badge-success' : 'badge-secondary'}`}>
                        {teacher.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => setSelectedTeacherQR(teacher)}
                          style={{ padding: '0.375rem 0.75rem' }}
                          title="Ver código QR"
                        >
                          <QrCode size={16} />
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleOpenModal(teacher)}
                          style={{ padding: '0.375rem 0.75rem' }}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        {teacher.activo && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(teacher.id)}
                            style={{ padding: '0.375rem 0.75rem' }}
                            title="Desactivar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingTeacher ? 'Editar Docente' : 'Nuevo Docente'}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">DNI *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.dni}
                    onChange={(e) => handleNumberOnlyChange('dni', e.target.value)}
                    placeholder="Solo números"
                    maxLength="20"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => handleTextOnlyChange('nombre', e.target.value)}
                    placeholder="Solo letras"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Apellido *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.apellido}
                    onChange={(e) => handleTextOnlyChange('apellido', e.target.value)}
                    placeholder="Solo letras"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.telefono}
                    onChange={(e) => handleNumberOnlyChange('telefono', e.target.value)}
                    placeholder="Solo números"
                    maxLength="20"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Especialidad</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  />
                </div>

                {editingTeacher && (
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      value={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: parseInt(e.target.value) })}
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTeacher ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTeacherQR && (
        <TeacherQRCode
          teacher={selectedTeacherQR}
          onClose={() => setSelectedTeacherQR(null)}
        />
      )}
    </div>
  );
};

export default Teachers;
