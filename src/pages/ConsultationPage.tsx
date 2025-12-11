import { useState } from 'react';
import {
  Stethoscope,
  Clock,
  Activity,
  FileText,
  QrCode,
  Plus,
  MessageCircle,
  CheckCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { prescriptions, users } from '../data/mockData';
import type { Consultation, ConsultationStatus } from '../types';
import clsx from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig: Record<ConsultationStatus, { label: string; color: string; icon: typeof Clock }> = {
  waiting: { label: 'En espera', color: 'amber', icon: Clock },
  in_progress: { label: 'En consulta', color: 'blue', icon: Activity },
  completed: { label: 'Completada', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'red', icon: XCircle },
};

export function ConsultationPage() {
  const { consultations, updateConsultationStatus } = useStore();
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'prescriptions'>('queue');

  const doctor = users.find(u => u.role === 'doctor');

  const queuedConsultations = consultations.filter(c => c.status === 'waiting' || c.status === 'in_progress');
  const completedConsultations = consultations.filter(c => c.status === 'completed');

  const handleStatusChange = (consultationId: string, newStatus: ConsultationStatus) => {
    updateConsultationStatus(consultationId, newStatus);
    if (newStatus === 'completed') {
      setSelectedConsultation(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultorio Médico</h1>
          <p className="text-slate-500">Gestión de consultas y expedientes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-teal-700">{doctor?.name}</span>
          </div>
          <button className="btn btn-primary">
            <Plus size={18} />
            Nueva Consulta
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {consultations.filter(c => c.status === 'waiting').length}
              </p>
              <p className="text-sm text-slate-500">En espera</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Activity className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {consultations.filter(c => c.status === 'in_progress').length}
              </p>
              <p className="text-sm text-slate-500">En consulta</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {consultations.filter(c => c.status === 'completed').length}
              </p>
              <p className="text-sm text-slate-500">Hoy completadas</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FileText className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{prescriptions.length}</p>
              <p className="text-sm text-slate-500">Recetas emitidas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Panel */}
        <div className="lg:col-span-1">
          <div className="card">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('queue')}
                className={clsx(
                  'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'queue'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500'
                )}
              >
                Cola de Espera
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={clsx(
                  'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'history'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500'
                )}
              >
                Historial
              </button>
            </div>

            {/* Queue List */}
            <div className="divide-y divide-slate-100">
              {activeTab === 'queue' && queuedConsultations.map(consultation => {
                const config = statusConfig[consultation.status];
                const Icon = config.icon;

                return (
                  <button
                    key={consultation.id}
                    onClick={() => setSelectedConsultation(consultation)}
                    className={clsx(
                      'w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center gap-3',
                      selectedConsultation?.id === consultation.id && 'bg-teal-50'
                    )}
                  >
                    <div className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      `bg-${config.color}-100`
                    )}>
                      <Icon size={20} className={`text-${config.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {consultation.patientName}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {consultation.chiefComplaint}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </button>
                );
              })}

              {activeTab === 'history' && completedConsultations.map(consultation => (
                <button
                  key={consultation.id}
                  onClick={() => setSelectedConsultation(consultation)}
                  className="w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {consultation.patientName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {consultation.diagnosis}
                    </p>
                  </div>
                </button>
              ))}

              {((activeTab === 'queue' && queuedConsultations.length === 0) ||
                (activeTab === 'history' && completedConsultations.length === 0)) && (
                <div className="p-8 text-center text-slate-400">
                  <Stethoscope size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No hay consultas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Consultation Detail */}
        <div className="lg:col-span-2">
          {selectedConsultation ? (
            <div className="card">
              {/* Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedConsultation.patientName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedConsultation.patientName}
                      </h2>
                      <p className="text-slate-500">
                        {selectedConsultation.patientAge} años •{' '}
                        {selectedConsultation.patientGender === 'male' ? 'Masculino' : 'Femenino'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {format(selectedConsultation.createdAt, "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <span className={clsx(
                    'badge',
                    `badge-${statusConfig[selectedConsultation.status].color}`
                  )}>
                    {statusConfig[selectedConsultation.status].label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Chief Complaint */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Motivo de Consulta</h3>
                  <p className="text-slate-900 bg-slate-50 p-4 rounded-lg">
                    {selectedConsultation.chiefComplaint}
                  </p>
                </div>

                {/* Vital Signs */}
                {selectedConsultation.vitalSigns && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-3">Signos Vitales</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedConsultation.vitalSigns.bloodPressureSystolic && (
                        <div className="p-3 bg-red-50 rounded-lg text-center">
                          <p className="text-xs text-red-600 mb-1">Presión Arterial</p>
                          <p className="text-lg font-bold text-red-700">
                            {selectedConsultation.vitalSigns.bloodPressureSystolic}/
                            {selectedConsultation.vitalSigns.bloodPressureDiastolic}
                          </p>
                          <p className="text-xs text-red-500">mmHg</p>
                        </div>
                      )}
                      {selectedConsultation.vitalSigns.heartRate && (
                        <div className="p-3 bg-pink-50 rounded-lg text-center">
                          <p className="text-xs text-pink-600 mb-1">Frecuencia Cardíaca</p>
                          <p className="text-lg font-bold text-pink-700">
                            {selectedConsultation.vitalSigns.heartRate}
                          </p>
                          <p className="text-xs text-pink-500">lpm</p>
                        </div>
                      )}
                      {selectedConsultation.vitalSigns.temperature && (
                        <div className="p-3 bg-amber-50 rounded-lg text-center">
                          <p className="text-xs text-amber-600 mb-1">Temperatura</p>
                          <p className="text-lg font-bold text-amber-700">
                            {selectedConsultation.vitalSigns.temperature}°C
                          </p>
                        </div>
                      )}
                      {selectedConsultation.vitalSigns.weight && (
                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <p className="text-xs text-blue-600 mb-1">Peso</p>
                          <p className="text-lg font-bold text-blue-700">
                            {selectedConsultation.vitalSigns.weight} kg
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Diagnosis */}
                {selectedConsultation.diagnosis && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Diagnóstico</h3>
                    <p className="text-slate-900 bg-teal-50 p-4 rounded-lg border border-teal-100">
                      {selectedConsultation.diagnosis}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {selectedConsultation.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Notas</h3>
                    <p className="text-slate-700">{selectedConsultation.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-3">
                {selectedConsultation.status === 'waiting' && (
                  <button
                    onClick={() => handleStatusChange(selectedConsultation.id, 'in_progress')}
                    className="btn btn-primary"
                  >
                    <Activity size={18} />
                    Iniciar Consulta
                  </button>
                )}

                {selectedConsultation.status === 'in_progress' && (
                  <>
                    <button className="btn btn-secondary">
                      <FileText size={18} />
                      Crear Receta
                    </button>
                    <button className="btn btn-secondary">
                      <MessageCircle size={18} />
                      Chat con Paciente
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedConsultation.id, 'completed')}
                      className="btn btn-success"
                    >
                      <CheckCircle size={18} />
                      Finalizar Consulta
                    </button>
                  </>
                )}

                {selectedConsultation.status === 'completed' && (
                  <>
                    <button className="btn btn-secondary">
                      <QrCode size={18} />
                      Ver Receta QR
                    </button>
                    <button className="btn btn-secondary">
                      <FileText size={18} />
                      Ver Expediente
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Stethoscope size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                Selecciona una consulta
              </h3>
              <p className="text-slate-400">
                Haz clic en un paciente de la cola para ver los detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
