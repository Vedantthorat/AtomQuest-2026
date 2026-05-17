export const translations = {
  en: {
    dashboard: 'Dashboard',
    goals: 'My Goals',
    calendar: 'Calendar',
    analytics: 'Analytics',
    aiAssistant: 'AI Assistant',
    sharedGoals: 'Shared Goals',
    escalations: 'Escalations',
    teamChat: 'Team Chat',
    badges: 'Badges',
    auditTrail: 'Audit Trail',
    team: 'Team',
    admin: 'Admin',
    profile: 'Profile',
    settings: 'Settings',
    reports: 'Reports',
    login: 'Login',
    logout: 'Logout',
    welcome: 'Welcome',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    add: 'Add',
    remove: 'Remove',
    view: 'View',
    loading: 'Loading...',
    noData: 'No data available',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    confirmDelete: 'Are you sure you want to delete?',
  },
  es: {
    dashboard: 'Panel',
    goals: 'Mis Metas',
    calendar: 'Calendario',
    analytics: 'Analíticas',
    aiAssistant: 'Asistente IA',
    sharedGoals: 'Metas Compartidas',
    escalations: 'Escalaciones',
    teamChat: 'Chat de Equipo',
    badges: 'Insignias',
    auditTrail: 'Registro de Auditoría',
    team: 'Equipo',
    admin: 'Administración',
    profile: 'Perfil',
    settings: 'Configuración',
    reports: 'Informes',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    welcome: 'Bienvenido',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    add: 'Agregar',
    remove: 'Quitar',
    view: 'Ver',
    loading: 'Cargando...',
    noData: 'Sin datos disponibles',
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    confirmDelete: '¿Está seguro de que desea eliminar?',
  },
  fr: {
    dashboard: 'Tableau de Bord',
    goals: 'Mes Objectifs',
    calendar: 'Calendrier',
    analytics: 'Analytique',
    aiAssistant: 'Assistant IA',
    sharedGoals: 'Objectifs Partagés',
    escalations: 'Escalades',
    teamChat: 'Chat d\'Équipe',
    badges: 'Badges',
    auditTrail: 'Piste d\'Audit',
    team: 'Équipe',
    admin: 'Admin',
    profile: 'Profil',
    settings: 'Paramètres',
    reports: 'Rapports',
    login: 'Connexion',
    logout: 'Déconnexion',
    welcome: 'Bienvenue',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    add: 'Ajouter',
    remove: 'Retirer',
    view: 'Voir',
    loading: 'Chargement...',
    noData: 'Aucune donnée disponible',
    success: 'Succès',
    error: 'Erreur',
    warning: 'Avertissement',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer?',
  }
};

export type Language = keyof typeof translations;

let currentLanguage: Language = 'en';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
};

export const getLanguage = (): Language => {
  const saved = localStorage.getItem('language') as Language;
  if (saved && translations[saved]) {
    currentLanguage = saved;
  }
  return currentLanguage;
};

export const t = (key: keyof typeof translations.en): string => {
  return translations[currentLanguage][key] || translations.en[key] || key;
};