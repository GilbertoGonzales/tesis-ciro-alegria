import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, X, Copy, CheckCircle } from 'lucide-react';

const TeacherQRCode = ({ teacher, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const qrData = JSON.stringify({
    id: teacher.id,
    dni: teacher.dni,
    nombre: teacher.nombre,
    apellido: teacher.apellido,
    especialidad: teacher.especialidad,
  });

  // Log para depuración
  console.log('QR Data generado:', qrData);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadQR = () => {
    const svg = document.getElementById('teacher-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${teacher.apellido}_${teacher.nombre}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Código QR del Docente</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
              {teacher.apellido}, {teacher.nombre}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              DNI: {teacher.dni}
            </p>
            {teacher.especialidad && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {teacher.especialidad}
              </p>
            )}
          </div>

          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '0.5rem',
            display: 'inline-block'
          }}>
            <QRCodeSVG
              id="teacher-qr-code"
              value={qrData}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <p style={{ 
            marginTop: '1rem', 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)',
            lineHeight: '1.5'
          }}>
            Escanea este código QR para registrar la asistencia automáticamente
          </p>
        </div>

        <div className="modal-footer" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn btn-outline" onClick={copyToClipboard}>
            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
            {copied ? 'Copiado' : 'Copiar Código'}
          </button>
          <button className="btn btn-primary" onClick={downloadQR}>
            <Download size={18} />
            Descargar QR
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherQRCode;
