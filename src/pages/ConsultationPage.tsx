import { useState } from 'react';
import {
  Stethoscope,
  Clock,
  Activity,
  FileText,
  QrCode,
  Plus,
  CheckCircle,
  XCircle,
  ChevronRight,
  Edit2,
  Thermometer,
  Heart,
  Scale,
  Pill,
  X,
  Save
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { prescriptions, users } from '../data/mockData';
import type { Consultation, ConsultationStatus, VitalSigns } from '../types';
import clsx from 'clsx';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Modal } from '../components/common/Modal';

const statusConfig: Record<ConsultationStatus, { label: string; color: string; icon: typeof Clock }> = {
  waiting: { label: 'En espera', color: 'amber', icon: Clock },
  in_progress: { label: 'En consulta', color: 'blue', icon: Activity },
  completed: { label: 'Completada', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'red', icon: XCircle },
};

export function ConsultationPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'es' ? es : enUS;
  const {
    consultations,
    updateConsultationStatus,
    addConsultation,
    updateConsultation,
    cancelConsultation,
    showNotification
  } = useStore();
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'prescriptions'>('queue');

  // Modal states
  const [showNewConsultationModal, setShowNewConsultationModal] = useState(false);
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Form states
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    complaint: '',
    fee: '50'
  });

  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bloodPressureSystolic: undefined,
    bloodPressureDiastolic: undefined,
    heartRate: undefined,
    temperature: undefined,
    weight: undefined,
    height: undefined,
    oxygenSaturation: undefined
  });

  const [diagnosis, setDiagnosis] = useState({
    text: '',
    notes: ''
  });

  const [prescription, setPrescription] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
  });

  const doctor = users.find(u => u.role === 'doctor');

  const queuedConsultations = consultations.filter(c => c.status === 'waiting' || c.status === 'in_progress');
  const completedConsultations = consultations.filter(c => c.status === 'completed');

  const handleStatusChange = (consultationId: string, newStatus: ConsultationStatus) => {
    updateConsultationStatus(consultationId, newStatus);
    if (newStatus === 'completed') {
      setSelectedConsultation(null);
    } else {
      // Update selected consultation state
      const updated = consultations.find(c => c.id === consultationId);
      if (updated) {
        setSelectedConsultation({ ...updated, status: newStatus });
      }
    }
  };

  const handleNewConsultation = () => {
    if (!newPatient.name || !newPatient.complaint) {
      showNotification('Por favor complete los campos requeridos', 'error');
      return;
    }

    addConsultation({
      branchId: 'branch-1',
      doctorId: doctor?.id || '',
      patientName: newPatient.name,
      patientAge: parseInt(newPatient.age) || undefined,
      patientGender: newPatient.gender,
      chiefComplaint: newPatient.complaint,
      status: 'waiting',
      fee: parseFloat(newPatient.fee) || 50
    });

    setNewPatient({ name: '', age: '', gender: 'male', complaint: '', fee: '50' });
    setShowNewConsultationModal(false);
  };

  const handleSaveVitalSigns = () => {
    if (!selectedConsultation) return;

    updateConsultation(selectedConsultation.id, { vitalSigns });
    setSelectedConsultation({ ...selectedConsultation, vitalSigns });
    setShowVitalSignsModal(false);
  };

  const handleSaveDiagnosis = () => {
    if (!selectedConsultation || !diagnosis.text) {
      showNotification('El diagnóstico es requerido', 'error');
      return;
    }

    updateConsultation(selectedConsultation.id, {
      diagnosis: diagnosis.text,
      notes: diagnosis.notes
    });
    setSelectedConsultation({
      ...selectedConsultation,
      diagnosis: diagnosis.text,
      notes: diagnosis.notes
    });
    setShowDiagnosisModal(false);
    setDiagnosis({ text: '', notes: '' });
  };

  const handleCreatePrescription = () => {
    if (!selectedConsultation) return;

    const validMeds = prescription.medications.filter(m => m.name && m.dosage);
    if (validMeds.length === 0) {
      showNotification('Agregue al menos un medicamento', 'error');
      return;
    }

    showNotification(`Receta creada con ${validMeds.length} medicamento(s)`, 'success');
    setShowPrescriptionModal(false);
    setPrescription({ medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
  };

  const handleCancelConsultation = () => {
    if (!selectedConsultation) return;
    cancelConsultation(selectedConsultation.id);
    setSelectedConsultation(null);
    setShowCancelModal(false);
  };

  const addMedication = () => {
    setPrescription(prev => ({
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedication = (index: number) => {
    setPrescription(prev => ({
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setPrescription(prev => ({
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const openVitalSignsModal = () => {
    if (selectedConsultation?.vitalSigns) {
      setVitalSigns(selectedConsultation.vitalSigns);
    } else {
      setVitalSigns({
        bloodPressureSystolic: undefined,
        bloodPressureDiastolic: undefined,
        heartRate: undefined,
        temperature: undefined,
        weight: undefined,
        height: undefined,
        oxygenSaturation: undefined
      });
    }
    setShowVitalSignsModal(true);
  };

  const openDiagnosisModal = () => {
    if (selectedConsultation) {
      setDiagnosis({
        text: selectedConsultation.diagnosis || '',
        notes: selectedConsultation.notes || ''
      });
    }
    setShowDiagnosisModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('consultation.title')}</h1>
          <p className="text-slate-500">{t('consultation.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-teal-700">{doctor?.name}</span>
          </div>
          <button
            onClick={() => setShowNewConsultationModal(true)}
            className="btn btn-primary"
          >
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
                Cola ({queuedConsultations.length})
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
                Historial ({completedConsultations.length})
              </button>
            </div>

            {/* Queue List */}
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
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
                      consultation.status === 'waiting' && 'bg-amber-100',
                      consultation.status === 'in_progress' && 'bg-blue-100'
                    )}>
                      <Icon size={20} className={clsx(
                        consultation.status === 'waiting' && 'text-amber-600',
                        consultation.status === 'in_progress' && 'text-blue-600'
                      )} />
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
                  className={clsx(
                    'w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center gap-3',
                    selectedConsultation?.id === consultation.id && 'bg-teal-50'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {consultation.patientName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {consultation.diagnosis || 'Sin diagnóstico'}
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
                        {selectedConsultation.patientGender === 'male' ? 'Masculino' :
                         selectedConsultation.patientGender === 'female' ? 'Femenino' : 'Otro'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {format(selectedConsultation.createdAt, i18n.language === 'es' ? "d 'de' MMMM, yyyy - HH:mm" : "MMMM d, yyyy - HH:mm", { locale: dateLocale })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      selectedConsultation.status === 'waiting' && 'bg-amber-100 text-amber-700',
                      selectedConsultation.status === 'in_progress' && 'bg-blue-100 text-blue-700',
                      selectedConsultation.status === 'completed' && 'bg-green-100 text-green-700',
                      selectedConsultation.status === 'cancelled' && 'bg-red-100 text-red-700'
                    )}>
                      {statusConfig[selectedConsultation.status].label}
                    </span>
                    {(selectedConsultation.status === 'waiting' || selectedConsultation.status === 'in_progress') && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                        title="Cancelar consulta"
                      >
                        <XCircle size={20} />
                      </button>
                    )}
                  </div>
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
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-500">Signos Vitales</h3>
                    {selectedConsultation.status === 'in_progress' && (
                      <button
                        onClick={openVitalSignsModal}
                        className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                      >
                        <Edit2 size={14} />
                        {selectedConsultation.vitalSigns ? 'Editar' : 'Agregar'}
                      </button>
                    )}
                  </div>
                  {selectedConsultation.vitalSigns ? (
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
                      {selectedConsultation.vitalSigns.oxygenSaturation && (
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <p className="text-xs text-purple-600 mb-1">SpO2</p>
                          <p className="text-lg font-bold text-purple-700">
                            {selectedConsultation.vitalSigns.oxygenSaturation}%
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm bg-slate-50 p-4 rounded-lg">
                      No se han registrado signos vitales
                    </p>
                  )}
                </div>

                {/* Diagnosis */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Diagnóstico</h3>
                    {selectedConsultation.status === 'in_progress' && (
                      <button
                        onClick={openDiagnosisModal}
                        className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                      >
                        <Edit2 size={14} />
                        {selectedConsultation.diagnosis ? 'Editar' : 'Agregar'}
                      </button>
                    )}
                  </div>
                  {selectedConsultation.diagnosis ? (
                    <p className="text-slate-900 bg-teal-50 p-4 rounded-lg border border-teal-100">
                      {selectedConsultation.diagnosis}
                    </p>
                  ) : (
                    <p className="text-slate-400 text-sm bg-slate-50 p-4 rounded-lg">
                      No se ha registrado diagnóstico
                    </p>
                  )}
                </div>

                {/* Notes */}
                {selectedConsultation.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Notas</h3>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{selectedConsultation.notes}</p>
                  </div>
                )}

                {/* Fee */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Costo de consulta:</span>
                  <span className="text-xl font-bold text-slate-900">${selectedConsultation.fee.toFixed(2)}</span>
                </div>
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
                    <button
                      onClick={openVitalSignsModal}
                      className="btn btn-secondary"
                    >
                      <Heart size={18} />
                      Signos Vitales
                    </button>
                    <button
                      onClick={openDiagnosisModal}
                      className="btn btn-secondary"
                    >
                      <Stethoscope size={18} />
                      Diagnóstico
                    </button>
                    <button
                      onClick={() => setShowPrescriptionModal(true)}
                      className="btn btn-secondary"
                    >
                      <FileText size={18} />
                      Crear Receta
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedConsultation.id, 'completed')}
                      className="btn bg-green-500 hover:bg-green-600 text-white"
                      disabled={!selectedConsultation.diagnosis}
                    >
                      <CheckCircle size={18} />
                      Finalizar Consulta
                    </button>
                  </>
                )}

                {selectedConsultation.status === 'completed' && (
                  <>
                    <button
                      onClick={() => showNotification('Generando código QR de receta...', 'info')}
                      className="btn btn-secondary"
                    >
                      <QrCode size={18} />
                      Ver Receta QR
                    </button>
                    <button
                      onClick={() => showNotification('Abriendo expediente del paciente...', 'info')}
                      className="btn btn-secondary"
                    >
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

      {/* New Consultation Modal */}
      <Modal
        isOpen={showNewConsultationModal}
        onClose={() => setShowNewConsultationModal(false)}
        title="Nueva Consulta"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre del Paciente *
            </label>
            <input
              type="text"
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Nombre completo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Edad
              </label>
              <input
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Años"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Género
              </label>
              <select
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'male' | 'female' | 'other' })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Motivo de Consulta *
            </label>
            <textarea
              value={newPatient.complaint}
              onChange={(e) => setNewPatient({ ...newPatient, complaint: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={3}
              placeholder="Describa el motivo de la consulta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Costo de Consulta
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={newPatient.fee}
                onChange={(e) => setNewPatient({ ...newPatient, fee: e.target.value })}
                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowNewConsultationModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleNewConsultation}
              className="flex-1 btn btn-primary"
            >
              <Plus size={18} />
              Registrar Consulta
            </button>
          </div>
        </div>
      </Modal>

      {/* Vital Signs Modal */}
      <Modal
        isOpen={showVitalSignsModal}
        onClose={() => setShowVitalSignsModal(false)}
        title="Signos Vitales"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Heart size={14} className="inline mr-1 text-red-500" />
                Presión Sistólica
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={vitalSigns.bloodPressureSystolic || ''}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressureSystolic: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="120"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">mmHg</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Heart size={14} className="inline mr-1 text-red-500" />
                Presión Diastólica
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={vitalSigns.bloodPressureDiastolic || ''}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressureDiastolic: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="80"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">mmHg</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Activity size={14} className="inline mr-1 text-pink-500" />
                Frecuencia Cardíaca
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={vitalSigns.heartRate || ''}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="72"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">lpm</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Thermometer size={14} className="inline mr-1 text-amber-500" />
                Temperatura
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={vitalSigns.temperature || ''}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="36.5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">°C</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Scale size={14} className="inline mr-1 text-blue-500" />
                Peso
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={vitalSigns.weight || ''}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, weight: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="70"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">kg</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SpO2
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={vitalSigns.oxygenSaturation || ''}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="98"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowVitalSignsModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveVitalSigns}
              className="flex-1 btn btn-primary"
            >
              <Save size={18} />
              Guardar
            </button>
          </div>
        </div>
      </Modal>

      {/* Diagnosis Modal */}
      <Modal
        isOpen={showDiagnosisModal}
        onClose={() => setShowDiagnosisModal(false)}
        title="Diagnóstico"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Diagnóstico *
            </label>
            <textarea
              value={diagnosis.text}
              onChange={(e) => setDiagnosis({ ...diagnosis, text: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              rows={3}
              placeholder="Ingrese el diagnóstico"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              value={diagnosis.notes}
              onChange={(e) => setDiagnosis({ ...diagnosis, notes: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              rows={3}
              placeholder="Observaciones, recomendaciones, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowDiagnosisModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveDiagnosis}
              className="flex-1 btn btn-primary"
            >
              <Save size={18} />
              Guardar Diagnóstico
            </button>
          </div>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title="Crear Receta Médica"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Paciente:</strong> {selectedConsultation?.patientName}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Diagnóstico:</strong> {selectedConsultation?.diagnosis || 'No especificado'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-slate-900">Medicamentos</h4>
              <button
                onClick={addMedication}
                className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>

            {prescription.medications.map((med, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Medicamento {index + 1}</span>
                  {prescription.medications.length > 1 && (
                    <button
                      onClick={() => removeMedication(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                      placeholder="Nombre del medicamento"
                    />
                  </div>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    placeholder="Dosis (ej: 500mg)"
                  />
                  <input
                    type="text"
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    placeholder="Frecuencia (ej: cada 8 horas)"
                  />
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    placeholder="Duración (ej: 7 días)"
                  />
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    placeholder="Instrucciones especiales"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowPrescriptionModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreatePrescription}
              className="flex-1 btn btn-primary"
            >
              <Pill size={18} />
              Generar Receta
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Consulta"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            ¿Está seguro que desea cancelar la consulta de <strong>{selectedConsultation?.patientName}</strong>?
          </p>
          <p className="text-sm text-slate-500">
            Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 btn btn-secondary"
            >
              No, mantener
            </button>
            <button
              onClick={handleCancelConsultation}
              className="flex-1 btn bg-red-500 hover:bg-red-600 text-white"
            >
              <XCircle size={18} />
              Sí, cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
