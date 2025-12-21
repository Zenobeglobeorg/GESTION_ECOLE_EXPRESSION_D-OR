import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { AdminLayout } from '../../components/admin/AdminLayout';
import * as userService from '../../services/userService';
import * as classService from '../../services/classService';
import * as scheduleService from '../../services/scheduleService';
import * as replacementService from '../../services/replacementService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ClassSubject {
  id: number;
  name: string;
  classId: number;
  teacherId?: number | null;
  hours?: number;
  subject?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
}

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const dayToNumber: Record<string, number> = {
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
};

// Interface pour un créneau horaire modifiable (identique à celle du service)
interface TimeSlot {
  id: string; // Identifiant unique pour la ligne
  startTime: string; // "08:00"
  endTime: string; // "09:00"
}

// Générer les créneaux horaires initiaux de 08:00 à 17:00 par tranches de 1h
const generateInitialTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour < 17; hour++) {
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
    slots.push({
      id: `slot-${hour}`,
      startTime: start,
      endTime: end,
    });
  }
  return slots;
};

export const Timetable = () => {
  const [classes, setClasses] = useState<classService.Class[]>([]);
  const [teachers, setTeachers] = useState<userService.UserWithDate[]>([]);
  const [subjects, setSubjects] = useState<ClassSubject[]>([]);
  const [schedules, setSchedules] = useState<scheduleService.Schedule[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Créneaux horaires modifiables
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateInitialTimeSlots());

  // Modal pour créer/modifier un créneau
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<scheduleService.Schedule | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ day: string; timeSlotId: string; startTime: string; endTime: string } | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: 1,
    type: 'SUBJECT' as 'SUBJECT' | 'EVENT',
    subjectId: '' as number | '',
    eventName: '',
  });

  // Replacement form
  const [absentTeacher, setAbsentTeacher] = useState<number | ''>('');
  const [replacementTeacher, setReplacementTeacher] = useState<number | ''>('');
  const [repStartDate, setRepStartDate] = useState('');
  const [repEndDate, setRepEndDate] = useState('');
  const [repReason, setRepReason] = useState<'MALADIE' | 'FORMATION' | 'CONGES' | 'PERSONNEL' | 'AUTRE'>('MALADIE');
  const [repNotes, setRepNotes] = useState('');
  const [activeReplacements, setActiveReplacements] = useState<replacementService.Replacement[]>([]);

  useEffect(() => {
    loadData();
    loadActiveReplacements();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const loadData = async () => {
        await Promise.all([loadSchedules(), loadClassTimeSlots()]);
      };
      loadData();
    } else {
      setSchedules([]);
      setTimeSlots(generateInitialTimeSlots());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const [classesData, users, subjectsRes] = await Promise.all([
        classService.getClasses(),
        userService.getUsers(),
        fetch(`${API_BASE_URL}/api/subjects`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : [])
          .catch(() => []),
      ]);

      setClasses(classesData);
      setTeachers(users.filter(u => u.role === 'TEACHER'));
      setSubjects(subjectsRes || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    if (!selectedClass) return;
    setLoading(true);
    setError(null);
    try {
      const schedulesData = await scheduleService.getSchedules(selectedClass);
      setSchedules(schedulesData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des emplois du temps');
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassTimeSlots = async () => {
    if (!selectedClass) return;
    try {
      const { timeSlots: savedTimeSlots } = await scheduleService.getClassTimeSlots(selectedClass);
      if (savedTimeSlots && savedTimeSlots.length > 0) {
        // Utiliser les créneaux horaires sauvegardés
        setTimeSlots(savedTimeSlots as TimeSlot[]);
      } else {
        // Utiliser les créneaux horaires par défaut
        setTimeSlots(generateInitialTimeSlots());
      }
    } catch (err: unknown) {
      console.error('Error loading class time slots:', err);
      // En cas d'erreur, utiliser les créneaux horaires par défaut
      setTimeSlots(generateInitialTimeSlots());
    }
  };

  const getScheduleForCell = (day: string, startTime: string): scheduleService.Schedule | null => {
    const dayNum = dayToNumber[day];
    
    return schedules.find(s => 
      s.dayOfWeek === dayNum && 
      s.startTime === startTime
    ) || null;
  };

  const handleCellClick = (day: string, timeSlotId: string, startTime: string, endTime: string) => {
    const schedule = getScheduleForCell(day, startTime);
    
    if (schedule) {
      // Modifier un créneau existant
      setEditingSchedule(schedule);
      setScheduleForm({
        dayOfWeek: schedule.dayOfWeek,
        type: schedule.type || 'SUBJECT',
        subjectId: schedule.subjectId ? schedule.subjectId : '',
        eventName: schedule.eventName || '',
      });
    } else {
      // Créer un nouveau créneau
      setEditingSchedule(null);
      setScheduleForm({
        dayOfWeek: dayToNumber[day],
        type: 'SUBJECT',
        subjectId: '',
        eventName: '',
      });
    }
    
    setSelectedCell({ day, timeSlotId, startTime, endTime });
    setIsScheduleModalOpen(true);
  };

  // Gérer la modification des heures dans la colonne "Heure"
  const handleTimeSlotChange = (timeSlotId: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(prev => {
      const updated = prev.map(slot => 
        slot.id === timeSlotId 
          ? { ...slot, [field]: value }
          : slot
      );
      // Sauvegarder automatiquement les modifications
      if (selectedClass) {
        scheduleService.saveClassTimeSlots(selectedClass, updated).catch(err => {
          console.error('Error auto-saving time slots:', err);
        });
      }
      return updated;
    });
  };

  // Ajouter un nouveau créneau horaire
  const handleAddTimeSlot = async () => {
    if (timeSlots.length === 0) {
      // Si aucun créneau, créer le premier avec des valeurs par défaut
      const defaultSlot: TimeSlot = {
        id: `slot-${Date.now()}`,
        startTime: '08:00',
        endTime: '08:30',
      };
      setTimeSlots([defaultSlot]);
      
      if (selectedClass) {
        try {
          await scheduleService.saveClassTimeSlots(selectedClass, [defaultSlot]);
          setSuccess('Premier créneau horaire ajouté et sauvegardé');
        } catch (err) {
          console.error('Error saving new time slot:', err);
          setError('Erreur lors de la sauvegarde du nouveau créneau horaire');
        }
      }
      return;
    }

    const lastSlot = timeSlots[timeSlots.length - 1];
    const lastHour = parseInt(lastSlot.endTime.split(':')[0]);
    const lastMinutes = parseInt(lastSlot.endTime.split(':')[1]) || 0;
    
    // Calculer la nouvelle heure de fin (30 minutes après la fin du dernier créneau)
    let newHour = lastHour;
    let newMinutes = lastMinutes + 30;
    if (newMinutes >= 60) {
      newHour += 1;
      newMinutes = 0;
    }
    
    const newStartTime = lastSlot.endTime;
    const newEndTime = `${newHour.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    
    const updatedTimeSlots = [
      ...timeSlots,
      {
        id: `slot-${Date.now()}`,
        startTime: newStartTime,
        endTime: newEndTime,
      },
    ];
    
    setTimeSlots(updatedTimeSlots);
    
    // Sauvegarder automatiquement
    if (selectedClass) {
      try {
        await scheduleService.saveClassTimeSlots(selectedClass, updatedTimeSlots);
        setSuccess('Créneau horaire ajouté et sauvegardé');
      } catch (err) {
        console.error('Error saving new time slot:', err);
        setError('Erreur lors de la sauvegarde du nouveau créneau horaire');
      }
    }
  };

  // Ajouter plusieurs créneaux horaires à la fois
  const handleAddMultipleTimeSlots = async () => {
    const count = prompt('Combien de créneaux horaires voulez-vous ajouter ?', '5');
    if (!count || isNaN(parseInt(count)) || parseInt(count) <= 0) {
      return;
    }

    const numberOfSlots = parseInt(count);
    const newSlots: TimeSlot[] = [];
    let currentStartTime = timeSlots.length > 0 
      ? timeSlots[timeSlots.length - 1].endTime 
      : '08:00';

    for (let i = 0; i < numberOfSlots; i++) {
      const [hour, minutes] = currentStartTime.split(':').map(Number);
      let newHour = hour;
      let newMinutes = minutes + 30;
      
      if (newMinutes >= 60) {
        newHour += 1;
        newMinutes = 0;
      }
      
      const newEndTime = `${newHour.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
      
      newSlots.push({
        id: `slot-${Date.now()}-${i}`,
        startTime: currentStartTime,
        endTime: newEndTime,
      });
      
      currentStartTime = newEndTime;
    }

    const updatedTimeSlots = [...timeSlots, ...newSlots];
    setTimeSlots(updatedTimeSlots);

    // Sauvegarder automatiquement
    if (selectedClass) {
      try {
        await scheduleService.saveClassTimeSlots(selectedClass, updatedTimeSlots);
        setSuccess(`${numberOfSlots} créneau(x) horaire(s) ajouté(s) et sauvegardé(s)`);
      } catch (err) {
        console.error('Error saving new time slots:', err);
        setError('Erreur lors de la sauvegarde des nouveaux créneaux horaires');
      }
    }
  };

  // Supprimer un créneau horaire
  const handleRemoveTimeSlot = async (timeSlotId: string) => {
    // Vérifier qu'il n'y a pas de créneaux utilisant cette heure
    const slot = timeSlots.find(s => s.id === timeSlotId);
    if (slot) {
      const hasSchedules = schedules.some(s => s.startTime === slot.startTime);
      if (hasSchedules) {
        setError('Impossible de supprimer ce créneau horaire car il contient des créneaux programmés');
        return;
      }
      
      const updatedTimeSlots = timeSlots.filter(s => s.id !== timeSlotId);
      setTimeSlots(updatedTimeSlots);
      
      // Sauvegarder automatiquement
      if (selectedClass) {
        try {
          await scheduleService.saveClassTimeSlots(selectedClass, updatedTimeSlots);
          setSuccess('Créneau horaire supprimé et sauvegarde effectuée');
        } catch (err) {
          console.error('Error saving after removal:', err);
          setError('Erreur lors de la sauvegarde après suppression');
        }
      }
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      setError('Veuillez sélectionner une classe');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!selectedCell) {
      setError('Aucun créneau horaire sélectionné');
      return;
    }

    try {
      if (editingSchedule) {
        // Mettre à jour
        await scheduleService.updateSchedule(editingSchedule.id, {
          dayOfWeek: scheduleForm.dayOfWeek,
          startTime: selectedCell.startTime,
          endTime: selectedCell.endTime,
          type: scheduleForm.type,
          subjectId: scheduleForm.type === 'SUBJECT' ? (scheduleForm.subjectId || null) : null,
          eventName: scheduleForm.type === 'EVENT' ? (scheduleForm.eventName || null) : null,
        });
        setSuccess('Créneau horaire modifié avec succès');
      } else {
        // Créer
        await scheduleService.createSchedule({
          classId: selectedClass,
          dayOfWeek: scheduleForm.dayOfWeek,
          startTime: selectedCell.startTime,
          endTime: selectedCell.endTime,
          type: scheduleForm.type,
          subjectId: scheduleForm.type === 'SUBJECT' ? (scheduleForm.subjectId || null) : null,
          eventName: scheduleForm.type === 'EVENT' ? (scheduleForm.eventName || null) : null,
        });
        setSuccess('Créneau horaire créé avec succès');
      }

      setIsScheduleModalOpen(false);
      setEditingSchedule(null);
      setSelectedCell(null);
      await loadSchedules();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setError(errorMessage);
      console.error('Error saving schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau horaire ?')) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await scheduleService.deleteSchedule(scheduleId);
      setSuccess('Créneau horaire supprimé avec succès');
      await loadSchedules();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Error deleting schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherForSubject = (subjectId: number | null | undefined): userService.UserWithDate | null => {
    if (!subjectId) return null;
    const classSubject = subjects.find(s => s.classId === selectedClass && s.subject?.id === subjectId);
    if (!classSubject || !classSubject.teacherId) return null;
    return teachers.find(t => t.id === classSubject.teacherId) || null;
  };

  const getClassSubjects = (): ClassSubject[] => {
    if (!selectedClass) return [];
    return subjects.filter(s => s.classId === selectedClass);
  };

  const loadActiveReplacements = async () => {
    try {
      const replacements = await replacementService.getReplacements('ACTIVE');
      setActiveReplacements(replacements);
    } catch (err) {
      console.error('Error loading active replacements:', err);
    }
  };

  const handleCreateReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!absentTeacher || !replacementTeacher) {
      setError('Veuillez sélectionner les deux enseignants');
      return;
    }

    if (absentTeacher === replacementTeacher) {
      setError('L\'enseignant absent et le remplaçant ne peuvent pas être la même personne');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await replacementService.createReplacement({
        absentTeacherId: Number(absentTeacher),
        replacementTeacherId: Number(replacementTeacher),
        startDate: repStartDate,
        endDate: repEndDate,
        reason: repReason,
        notes: repNotes || undefined,
      });

      setSuccess('Remplacement programmé avec succès');
      setAbsentTeacher('');
      setReplacementTeacher('');
      setRepStartDate('');
      setRepEndDate('');
      setRepReason('MALADIE');
      setRepNotes('');
      await loadActiveReplacements();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du remplacement';
      setError(errorMessage);
      console.error('Error creating replacement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (confirm('Êtes-vous sûr de vouloir publier cet emploi du temps ?')) {
      if (selectedClass) {
        try {
          // Sauvegarder les créneaux horaires avant publication
          await scheduleService.saveClassTimeSlots(selectedClass, timeSlots);
          setSuccess('Emploi du temps publié avec succès. Les créneaux horaires ont été sauvegardés.');
        } catch (err) {
          console.error('Error saving time slots on publish:', err);
          setError('Erreur lors de la sauvegarde des créneaux horaires');
        }
      } else {
        setSuccess('Emploi du temps publié avec succès');
      }
    }
  };

  const handlePrintTimetable = () => {
    window.print();
  };

  return (
    <AdminLayout
      title="Générer l'emploi du temps"
      subtitle="Créer et gérer les horaires des classes."
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <Card title="Sélection de la classe" className="mb-8 border-0 shadow-lg">
        <div className="p-6">
          <div className="form-group">
            <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="timetable-class">
              Classe
            </label>
            <select
              title="Sélectionner une classe"
              className="form-control"
              id="timetable-class"
              value={String(selectedClass)}
              onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {classes.length === 0 && (
              <p className="text-xs text-blue-600 mt-2">
                Aucune classe disponible. Veuillez d'abord créer des classes.
              </p>
            )}
          </div>
        </div>
      </Card>

      {selectedClass && (
        <Card 
          title={`Emploi du temps - ${classes.find(c => c.id === selectedClass)?.name || 'Classe'}`} 
          className="mb-8 border-0 shadow-lg"
        >
          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de l'emploi du temps...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                      <th className="border border-blue-600 p-2 md:p-3 text-left font-semibold text-xs md:text-sm sticky left-0 z-10 bg-gradient-to-r from-blue-700 to-blue-800">
                        Heure
                      </th>
                      {days.map(day => (
                        <th key={day} className="border border-blue-600 p-2 md:p-3 text-center font-semibold text-xs md:text-sm">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(slot => (
                      <tr key={slot.id}>
                        <td className="border border-blue-100 p-1 md:p-2 bg-blue-50 font-semibold text-blue-900 w-32 md:w-40 text-xs md:text-sm sticky left-0 z-10 bg-blue-50">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleTimeSlotChange(slot.id, 'startTime', e.target.value)}
                                className="w-full px-1 py-0.5 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                title="Heure de début"
                              />
                            </div>
                            <div className="text-center text-[10px] text-blue-600">-</div>
                            <div className="flex items-center gap-1">
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleTimeSlotChange(slot.id, 'endTime', e.target.value)}
                                className="w-full px-1 py-0.5 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                title="Heure de fin"
                              />
                            </div>
                            {timeSlots.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTimeSlot(slot.id);
                                }}
                                className="mt-1 text-[10px] px-1 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                title="Supprimer ce créneau horaire"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </td>
                        {days.map(day => {
                          const schedule = getScheduleForCell(day, slot.startTime);
                          const teacher = schedule ? getTeacherForSubject(schedule.subjectId) : null;
                          return (
                            <td
                              key={`${day}-${slot.id}`}
                              className={`border border-blue-100 p-1 md:p-2 h-16 md:h-20 min-w-[100px] md:min-w-[120px] transition-all ${
                                schedule
                                  ? schedule.type === 'EVENT'
                                    ? 'bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 cursor-pointer'
                                    : 'bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 cursor-pointer'
                                  : 'hover:bg-blue-50 cursor-pointer'
                              }`}
                              onClick={() => handleCellClick(day, slot.id, slot.startTime, slot.endTime)}
                              title={schedule ? 'Cliquer pour modifier' : 'Cliquer pour ajouter un créneau'}
                            >
                              {schedule ? (
                                <div className="text-xs">
                                  {schedule.type === 'EVENT' ? (
                                    <>
                                      <div className="font-semibold text-purple-900 mb-0.5 md:mb-1 truncate">
                                        📅 {schedule.eventName || 'Événement'}
                                      </div>
                                      <div className="text-purple-600/70 mt-0.5 text-[10px]">
                                        {schedule.startTime} - {schedule.endTime}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="font-semibold text-blue-900 mb-0.5 md:mb-1 truncate">
                                        {schedule.subject?.name || 'Sans matière'}
                                      </div>
                                      {teacher && (
                                        <div className="text-blue-700/80 text-[10px] md:text-xs truncate">
                                          {teacher.firstName} {teacher.lastName}
                                        </div>
                                      )}
                                      <div className="text-blue-600/70 mt-0.5 text-[10px]">
                                        {schedule.startTime} - {schedule.endTime}
                                      </div>
                                    </>
                                  )}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-1 text-[10px] px-1 py-0.5 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSchedule(schedule.id);
                                    }}
                                  >
                                    Supprimer
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-xs text-blue-400 text-center">+ Ajouter</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="border border-blue-100 p-2 bg-blue-50 sticky left-0 z-10 bg-blue-50">
                        <button
                          type="button"
                          onClick={handleAddTimeSlot}
                          className="w-full px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 hover:border-green-400 transition-colors flex items-center justify-center gap-2"
                          title="Ajouter un nouveau créneau horaire"
                        >
                          <span className="text-lg">+</span>
                          <span>Ajouter une ligne</span>
                        </button>
                      </td>
                      {days.map(day => (
                        <td key={`footer-${day}`} className="border border-blue-100 p-2 bg-gray-50">
                          <div className="text-center text-xs text-gray-400">
                            {day}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center mt-6">
              <Button
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                onClick={handleAddTimeSlot}
              >
                + Ajouter un créneau horaire
              </Button>
              <Button
                variant="outline"
                className="border-green-400 text-green-800 hover:bg-green-100 hover:border-green-500"
                onClick={handleAddMultipleTimeSlots}
                title="Ajouter plusieurs créneaux horaires à la fois"
              >
                + Ajouter plusieurs créneaux
              </Button>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                onClick={handlePublish}
              >
                Publier
              </Button>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                onClick={handlePrintTimetable}
              >
                Imprimer
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card title="Gestion des remplacements" className="border-0 shadow-lg">
        <div className="p-6 space-y-6">
          <form onSubmit={handleCreateReplacement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="absent-teacher">
                  Enseignant absent
                </label>
                <select
                  title="Sélectionner l'enseignant absent"
                  className="form-control"
                  id="absent-teacher"
                  value={String(absentTeacher)}
                  onChange={(e) => setAbsentTeacher(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="">Sélectionner un enseignant</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="replacement-teacher">
                  Enseignant remplaçant
                </label>
                <select
                  title="Sélectionner le remplaçant"
                  className="form-control"
                  id="replacement-teacher"
                  value={String(replacementTeacher)}
                  onChange={(e) => setReplacementTeacher(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="">Sélectionner un remplaçant</option>
                  {teachers
                    .filter(t => t.id !== absentTeacher)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="replacement-start">
                  Date de début
                </label>
                <Input
                  type="date"
                  id="replacement-start"
                  value={repStartDate}
                  onChange={(e) => setRepStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="replacement-end">
                  Date de fin
                </label>
                <Input
                  type="date"
                  id="replacement-end"
                  value={repEndDate}
                  onChange={(e) => setRepEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="replacement-reason">
                Motif de l&apos;absence
              </label>
              <select
                title="Sélectionner le motif"
                className="form-control"
                id="replacement-reason"
                value={repReason}
                onChange={(e) => setRepReason(e.target.value as typeof repReason)}
                required
              >
                <option value="MALADIE">Maladie</option>
                <option value="FORMATION">Formation</option>
                <option value="CONGES">Congés</option>
                <option value="PERSONNEL">Raison personnelle</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="replacement-notes">
                Notes (optionnel)
              </label>
              <textarea
                id="replacement-notes"
                className="form-control"
                rows={2}
                value={repNotes}
                onChange={(e) => setRepNotes(e.target.value)}
                placeholder="Informations supplémentaires..."
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
            >
              {loading ? 'Programmation...' : 'Programmer le remplacement'}
            </Button>
          </form>

          {/* Liste des remplacements actifs */}
          {activeReplacements.length > 0 && (
            <div className="mt-6 pt-6 border-t border-blue-200">
              <h3 className="font-semibold text-lg text-blue-900 mb-4">Remplacements actifs</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeReplacements.map((rep) => {
                  const reasonLabels: Record<string, string> = {
                    MALADIE: 'Maladie',
                    FORMATION: 'Formation',
                    CONGES: 'Congés',
                    PERSONNEL: 'Raison personnelle',
                    AUTRE: 'Autre',
                  };
                  return (
                    <div
                      key={rep.id}
                      className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900 text-sm">
                            {rep.absentTeacher?.firstName} {rep.absentTeacher?.lastName} → {rep.replacementTeacher?.firstName} {rep.replacementTeacher?.lastName}
                          </p>
                          <p className="text-xs text-blue-700/80 mt-1">
                            {new Date(rep.startDate).toLocaleDateString('fr-FR')} au {new Date(rep.endDate).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-blue-600/70 mt-1">
                            Motif : {reasonLabels[rep.reason] || rep.reason}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          Actif
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modal pour créer/modifier un créneau */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
          setSelectedCell(null);
        }}
        title={editingSchedule ? 'Modifier le créneau horaire' : 'Créer un créneau horaire'}
        size="md"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <p className="text-sm text-blue-900">
              <strong>Jour :</strong> {selectedCell?.day}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>Horaire :</strong> {selectedCell?.startTime} - {selectedCell?.endTime}
            </p>
            <p className="text-xs text-blue-600 mt-1 italic">
              Pour modifier les heures, éditez directement la colonne "Heure" dans le tableau.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de créneau</label>
            <select
              title="Sélectionner le type"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={scheduleForm.type}
              onChange={(e) => {
                const newType = e.target.value as 'SUBJECT' | 'EVENT';
                setScheduleForm({ 
                  ...scheduleForm, 
                  type: newType,
                  subjectId: newType === 'EVENT' ? '' : scheduleForm.subjectId,
                  eventName: newType === 'SUBJECT' ? '' : scheduleForm.eventName,
                });
              }}
            >
              <option value="SUBJECT">Matière</option>
              <option value="EVENT">Événement/Activité</option>
            </select>
          </div>

          {scheduleForm.type === 'SUBJECT' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matière</label>
              <select
                title="Sélectionner une matière"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={String(scheduleForm.subjectId)}
                onChange={(e) => setScheduleForm({ ...scheduleForm, subjectId: e.target.value ? Number(e.target.value) : '' })}
                required={scheduleForm.type === 'SUBJECT'}
              >
                <option value="">Sélectionner une matière</option>
                {getClassSubjects().map(s => (
                  <option key={s.id} value={s.subject?.id || ''}>
                    {s.name}
                    {s.teacher && ` (${s.teacher.firstName} ${s.teacher.lastName})`}
                  </option>
                ))}
              </select>
              {getClassSubjects().length === 0 && (
                <p className="text-xs text-yellow-700 mt-1">
                  Aucune matière assignée à cette classe. Veuillez d'abord assigner des matières à la classe via la page "Classes".
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'événement/activité</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: Prière, Récréation, Déjeuner, etc."
                value={scheduleForm.eventName}
                onChange={(e) => setScheduleForm({ ...scheduleForm, eventName: e.target.value })}
                required={scheduleForm.type === 'EVENT'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Exemples : Prière, Récréation, Déjeuner, Sport, etc.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsScheduleModalOpen(false);
                setEditingSchedule(null);
                setSelectedCell(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
            >
              {loading ? 'Enregistrement...' : editingSchedule ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};
