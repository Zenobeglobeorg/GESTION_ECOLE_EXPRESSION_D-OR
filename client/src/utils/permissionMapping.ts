/**
 * Mapping des pages aux permissions requises
 * Utilisé pour protéger les routes et afficher/masquer les éléments de navigation
 */
export const PAGE_PERMISSIONS: Record<string, { read: string; write?: string }> = {
  // Gestion des utilisateurs
  '/admin/users': { read: 'users.read', write: 'users.create' },
  '/admin/users/admins': { read: 'users.read', write: 'users.create' },
  '/admin/users/teachers': { read: 'users.read', write: 'users.create' },
  '/admin/users/parents': { read: 'users.read', write: 'users.create' },
  '/admin/users/permissions': { read: 'users.read', write: 'users.update' },
  
  // Gestion des élèves
  '/admin/students': { read: 'students.read', write: 'students.create' },
  '/admin/students/new': { read: 'students.read', write: 'students.create' },
  '/admin/students/import': { read: 'students.read', write: 'students.create' },
  '/admin/students/associate': { read: 'students.read', write: 'students.update' },
  
  // Gestion des classes
  '/admin/classes': { read: 'classes.manage', write: 'classes.create' },
  
  // Gestion des notes
  '/admin/grades': { read: 'grades.validate', write: 'grades.modify' },
  '/admin/evaluations': { read: 'grades.validate', write: 'grades.modify' },
  
  // Gestion des bulletins
  '/admin/bulletins': { read: 'reports.generate', write: 'reports.generate' },
  
  // Gestion des présences
  '/admin/attendance': { read: 'attendance.manage', write: 'attendance.manage' },
  
  // Gestion des frais
  '/admin/fees': { read: 'fees.manage', write: 'fees.manage' },
  
  // Gestion des emplois du temps
  '/admin/timetable': { read: 'schedule.manage', write: 'schedule.manage' },
  
  // Gestion des annonces
  '/admin/announcements': { read: 'announcements.create', write: 'announcements.create' },
  
  // Gestion des remplacements
  '/admin/replacements': { read: 'schedule.manage', write: 'schedule.manage' },
  
  // Calendrier
  '/admin/calendar': { read: 'schedule.manage', write: 'schedule.manage' },
  
  // Messages
  '/admin/messages': { read: 'users.read', write: 'users.read' },
  
  // Notifications
  '/admin/notifications': { read: 'users.read', write: 'users.read' },
  
  // Rapports
  '/admin/reports': { read: 'reports.generate', write: 'reports.generate' },
  
  // Paramètres
  '/admin/settings': { read: 'system.settings', write: 'system.settings' },
};

/**
 * Obtient la permission de lecture pour une page
 */
export const getPageReadPermission = (path: string): string | undefined => {
  return PAGE_PERMISSIONS[path]?.read;
};

/**
 * Obtient la permission d'écriture pour une page
 */
export const getPageWritePermission = (path: string): string | undefined => {
  return PAGE_PERMISSIONS[path]?.write || PAGE_PERMISSIONS[path]?.read;
};


