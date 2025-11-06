import React, { useState, useEffect } from 'react';
import { Download, Calendar, FileText } from 'lucide-react';
import { getTeachers, getAttendance, getAttendanceStats } from '../services/api';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const Reports = () => {
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fecha_inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    fecha_fin: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    teacher_id: '',
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    loadReport();
  }, [filters]);

  const loadTeachers = async () => {
    try {
      const response = await getTeachers({ activo: 1 });
      setTeachers(response.data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = {
        fecha_inicio: filters.fecha_inicio,
        fecha_fin: filters.fecha_fin,
      };

      if (filters.teacher_id) {
        params.teacher_id = filters.teacher_id;
      }

      const [statsRes, attendanceRes] = await Promise.all([
        getAttendanceStats(params),
        getAttendance(params),
      ]);

      setStats(statsRes.data);
      setAttendanceData(attendanceRes.data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (months) => {
    const end = new Date();
    const start = subMonths(end, months);
    setFilters({
      ...filters,
      fecha_inicio: format(start, 'yyyy-MM-dd'),
      fecha_fin: format(end, 'yyyy-MM-dd'),
    });
  };

  const exportToCSV = () => {
    if (attendanceData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = ['Fecha', 'Docente', 'DNI', 'Especialidad', 'Hora Entrada', 'Hora Salida', 'Estado', 'Observaciones'];
    const rows = attendanceData.map(record => [
      format(new Date(record.fecha + 'T00:00:00'), 'dd/MM/yyyy'),
      `${record.apellido}, ${record.nombre}`,
      record.dni,
      record.especialidad || '',
      record.hora_entrada || '',
      record.hora_salida || '',
      record.estado,
      record.observaciones || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_asistencia_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getTotalByStatus = (status) => {
    const stat = stats.find(s => s.estado === status);
    return stat ? stat.total : 0;
  };

  const getPercentage = (status) => {
    const total = stats.reduce((sum, s) => sum + s.total, 0);
    if (total === 0) return 0;
    const statusTotal = getTotalByStatus(status);
    return ((statusTotal / total) * 100).toFixed(1);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
          Reportes de Asistencia
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Visualiza y exporta reportes detallados
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Filtros Rápidos</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => handleQuickFilter(0)}>
              Este Mes
            </button>
            <button className="btn btn-outline" onClick={() => handleQuickFilter(1)}>
              Último Mes
            </button>
            <button className="btn btn-outline" onClick={() => handleQuickFilter(3)}>
              Últimos 3 Meses
            </button>
            <button className="btn btn-outline" onClick={() => handleQuickFilter(6)}>
              Últimos 6 Meses
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label">Fecha Inicio</label>
            <input
              type="date"
              className="form-input"
              value={filters.fecha_inicio}
              onChange={(e) => setFilters({ ...filters, fecha_inicio: e.target.value })}
            />
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label">Fecha Fin</label>
            <input
              type="date"
              className="form-input"
              value={filters.fecha_fin}
              onChange={(e) => setFilters({ ...filters, fecha_fin: e.target.value })}
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

          <button className="btn btn-success" onClick={exportToCSV}>
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-label">Total Registros</div>
              <div className="stat-value">
                {stats.reduce((sum, s) => sum + s.total, 0)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Presentes</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>
                {getTotalByStatus('presente')}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {getPercentage('presente')}% del total
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Ausentes</div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>
                {getTotalByStatus('ausente')}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {getPercentage('ausente')}% del total
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Tardanzas</div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>
                {getTotalByStatus('tardanza')}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {getPercentage('tardanza')}% del total
              </div>
            </div>
          </div>

          {/* Attendance Details */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Detalle de Asistencias
            </h2>

            {attendanceData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No hay registros para el período seleccionado</p>
              </div>
            ) : (
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
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((record) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
