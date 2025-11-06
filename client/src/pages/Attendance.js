import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Filter, X, QrCode } from 'lucide-react';
import { getTeachers, getAttendance, createAttendance, updateAttendance, deleteAttendance } from '../services/api';
import { format } from 'date-fns';
import QRScanner from '../components/QRScanner';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filters, setFilters] = useState({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    teacher_id: '',
  });
  const [formData, setFormData] = useState({
    teacher_id: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora_entrada: '',
    hora_salida: '',
    estado: 'presente',
    observaciones: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeachers();
    loadAttendance();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [filters]);

  const loadTeachers = async () => {
    try {
      const response = await getTeachers({ activo: 1 });
      setTeachers(response.data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadAttendance = async () => {
    try {
      const params = {};
      if (filters.fecha) params.fecha = filters.fecha;
      if (filters.teacher_id) params.teacher_id = filters.teacher_id;

      const response = await getAttendance(params);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        teacher_id: record.teacher_id,
        fecha: record.fecha,
        hora_entrada: record.hora_entrada || '',
        hora_salida: record.hora_salida || '',
        estado: record.estado,
        observaciones: record.observaciones || '',
      });
    } else {
      setEditingRecord(null);
      setFormData({
        teacher_id: '',
        fecha: format(new Date(), 'yyyy-MM-dd'),
        hora_entrada: '',
        hora_salida: '',
        estado: 'presente',
        observaciones: '',
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingRecord) {
        await updateAttendance(editingRecord.id, formData);
      } else {
        await createAttendance(formData);
      }
      loadAttendance();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar asistencia');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      try {
        await deleteAttendance(id);
        loadAttendance();
      } catch (error) {
        alert('Error al eliminar registro');
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      fecha: format(new Date(), 'yyyy-MM-dd'),
      teacher_id: '',
    });
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>Registro de Asistencia</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Gestiona los registros de asistencia diaria</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-success" onClick={() => setShowQRScanner(true)}>
            <QrCode size={18} />
            Escanear QR
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Registro Manual
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-input"
              value={filters.fecha}
              onChange={(e) => setFilters({ ...filters, fecha: e.target.value })}
            />
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label">Docente</label>
            <select
              className="form-select"
              value={filters.teacher_id}
              onChange={(e) => setFilters({ ...filters, teacher_id: e.target.value })}
            >
              <option value="">Todos los docentes</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {`${teacher.apellido}, ${teacher.nombre}`}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-outline" onClick={clearFilters}>
            <X size={18} />
            Limpiar
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Docente</th>
                <th>DNI</th>
                <th>Especialidad</th>
                <th>Hora Entrada</th>
                <th>Hora Salida</th>
                <th>Estado</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No se encontraron registros de asistencia
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id}>
                    <td>{format(new Date(record.fecha + 'T00:00:00'), 'dd/MM/yyyy')}</td>
                    <td>{`${record.apellido}, ${record.nombre}`}</td>
                    <td>{record.dni}</td>
                    <td>{record.especialidad || '-'}</td>
                    <td>{record.hora_entrada || '-'}</td>
                    <td>{record.hora_salida || '-'}</td>
                    <td>
                      <span
                        className={`badge ${
                          record.estado === 'presente'
                            ? 'badge-success'
                            : record.estado === 'ausente'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {record.estado}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.observaciones || '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleOpenModal(record)}
                          style={{ padding: '0.375rem 0.75rem' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(record.id)}
                          style={{ padding: '0.375rem 0.75rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
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
                {editingRecord ? 'Editar Asistencia' : 'Registrar Asistencia'}
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
                  <label className="form-label">Docente *</label>
                  <select
                    className="form-select"
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    required
                    disabled={!!editingRecord}
                  >
                    <option value="">Seleccionar docente</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {`${teacher.apellido}, ${teacher.nombre} - ${teacher.dni}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                    disabled={!!editingRecord}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hora de Entrada</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.hora_entrada}
                    onChange={(e) => setFormData({ ...formData, hora_entrada: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hora de Salida</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.hora_salida}
                    onChange={(e) => setFormData({ ...formData, hora_salida: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estado *</label>
                  <select
                    className="form-select"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    required
                  >
                    <option value="presente">Presente</option>
                    <option value="ausente">Ausente</option>
                    <option value="tardanza">Tardanza</option>
                    <option value="permiso">Permiso</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    className="form-textarea"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRecord ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          onSuccess={() => {
            loadAttendance();
            setShowQRScanner(false);
          }}
        />
      )}
    </div>
  );
};

export default Attendance;
