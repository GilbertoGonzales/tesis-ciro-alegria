import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getTeachers, getAttendance, getAttendanceStats } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get teachers count
      const teachersRes = await getTeachers({ activo: 1 });
      
      // Get today's attendance
      const attendanceRes = await getAttendance({ fecha: today });
      
      // Get attendance stats for today
      const statsRes = await getAttendanceStats({ 
        fecha_inicio: today, 
        fecha_fin: today 
      });

      const statsMap = statsRes.data.reduce((acc, stat) => {
        acc[stat.estado] = stat.total;
        return acc;
      }, {});

      setStats({
        totalTeachers: teachersRes.data.length,
        presentToday: statsMap['presente'] || 0,
        absentToday: statsMap['ausente'] || 0,
        lateToday: statsMap['tardanza'] || 0,
      });

      setRecentAttendance(attendanceRes.data.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Vista general del sistema de asistencia
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Docentes</div>
          <div className="stat-value">{stats.totalTeachers}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Presentes Hoy</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {stats.presentToday}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Ausentes Hoy</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {stats.absentToday}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Tardanzas Hoy</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {stats.lateToday}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
          Asistencia Reciente
        </h2>

        {recentAttendance.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            No hay registros de asistencia para hoy
          </p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>DNI</th>
                  <th>Especialidad</th>
                  <th>Hora Entrada</th>
                  <th>Hora Salida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((record) => (
                  <tr key={record.id}>
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
    </div>
  );
};

export default Dashboard;
