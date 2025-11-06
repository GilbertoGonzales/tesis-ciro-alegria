import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { createAttendance } from '../services/api';
import { format } from 'date-fns';
import jsQR from 'jsqr';

const QRScanner = ({ onClose, onSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
        setError('');
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Por favor, permite el acceso o usa la opción de archivo.');
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setScanning(false);
  };

  const scanQRFromVideo = () => {
    if (videoRef.current && canvasRef.current && scanning) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          processQRData(code.data);
          return;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(scanQRFromVideo);
    }
  };

  useEffect(() => {
    if (scanning) {
      scanQRFromVideo();
    }
  }, [scanning]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessing(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setProcessing(false);

        if (code) {
          processQRData(code.data);
        } else {
          setError('No se pudo leer el código QR de la imagen. Asegúrate de que la imagen sea clara y contenga un código QR válido.');
        }
      };
      img.onerror = () => {
        setProcessing(false);
        setError('Error al cargar la imagen. Intenta con otra imagen.');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setProcessing(false);
      setError('Error al leer el archivo. Intenta nuevamente.');
    };
    reader.readAsDataURL(file);
  };

  const processQRData = async (data) => {
    try {
      // Intentar parsear el JSON
      let teacherData;
      try {
        teacherData = JSON.parse(data);
      } catch (parseError) {
        setError('El código QR no contiene datos válidos. Asegúrate de escanear un código QR generado por el sistema.');
        return;
      }

      // Validar que tenga los campos necesarios
      if (!teacherData.id || !teacherData.nombre || !teacherData.apellido) {
        setError('El código QR no contiene la información completa del docente.');
        return;
      }

      setScannedData(teacherData);
      setProcessing(true);

      const now = new Date();
      const attendanceData = {
        teacher_id: teacherData.id,
        fecha: format(now, 'yyyy-MM-dd'),
        hora_entrada: format(now, 'HH:mm:ss'),
        estado: 'presente',
        observaciones: 'Registrado mediante código QR',
      };

      await createAttendance(attendanceData);
      setProcessing(false);
      setSuccess(`✓ Asistencia registrada exitosamente\n${teacherData.apellido}, ${teacherData.nombre}\nHora: ${format(now, 'HH:mm:ss')}`);
      stopCamera();
      
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 2500);
    } catch (err) {
      setProcessing(false);
      stopCamera();
      
      console.error('Error al procesar QR:', err);
      
      if (err.response?.data?.error) {
        const errorMsg = err.response.data.error;
        if (errorMsg.includes('ya existe')) {
          setError('Este docente ya tiene asistencia registrada para hoy');
        } else if (errorMsg.includes('no encontrado')) {
          setError('Docente no encontrado en el sistema');
        } else {
          setError(`Error: ${errorMsg}`);
        }
      } else if (err.message) {
        setError(`Error de conexión: ${err.message}`);
      } else {
        setError('Error al registrar la asistencia. Verifica tu conexión e intenta nuevamente.');
      }
    }
  };

  const handleManualInput = () => {
    const qrInput = prompt('Ingresa el código QR manualmente (formato JSON):');
    if (qrInput) {
      processQRData(qrInput);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Escanear Código QR</h2>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              <CheckCircle size={20} />
              <div style={{ whiteSpace: 'pre-line' }}>{success}</div>
            </div>
          )}

          {!scanning && !success && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100%',
                height: '300px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                border: '2px dashed var(--border)',
              }}>
                <div>
                  {processing ? (
                    <>
                      <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Procesando código QR...
                      </p>
                    </>
                  ) : (
                    <>
                      <Camera size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Presiona el botón para iniciar la cámara
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={startCamera} 
                  style={{ width: '100%' }}
                  disabled={processing}
                >
                  <Camera size={18} />
                  Iniciar Cámara
                </button>

                <button 
                  className="btn btn-outline" 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '100%' }}
                  disabled={processing}
                >
                  <Upload size={18} />
                  Subir Imagen QR
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                <button 
                  className="btn btn-outline" 
                  onClick={handleManualInput}
                  style={{ width: '100%' }}
                  disabled={processing}
                >
                  Ingresar Código Manualmente
                </button>
              </div>

              <p style={{ 
                marginTop: '1rem', 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}>
                El sistema registrará automáticamente la asistencia con la hora actual
              </p>
            </div>
          )}

          {scanning && (
            <div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  borderRadius: '0.5rem',
                  backgroundColor: '#000',
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <p style={{ 
                marginTop: '1rem', 
                fontSize: '0.875rem', 
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                Apunta la cámara hacia el código QR
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={handleClose}>
            {success ? 'Cerrar' : 'Cancelar'}
          </button>
          {scanning && (
            <button className="btn btn-danger" onClick={stopCamera}>
              Detener Cámara
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
