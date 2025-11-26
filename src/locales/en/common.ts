// src/locales/en/common.ts
const enCommon = {
  appName: 'Kurulum Takip',

  nav: {
    dashboard: 'Dashboard',
    orders: 'Orders',
    installations: 'Installations',
    calendar: 'Calendar',
    reports: 'Reports',
    usersAndRoles: 'Users & Roles',
    integrations: 'Integrations',
    audit: 'Audit',

    crewHome: 'Home',
    crewJobs: 'Jobs',
    crewIssues: 'Issues',
    crewSettings: 'Settings',
  },

  settings: {
    title: 'Settings',
    subtitle: 'Configure your preferences.',
    languageSectionTitle: 'Language',
    languageSectionDescription: 'Choose the interface language.',
    english: 'English',
    turkish: 'Turkish',
  },

  common: {
    save: 'Save',
    cancel: 'Cancel',
    searchPlaceholder: 'Search...',
  },

  pages: {
    adminDashboard: 'Dashboard',
    installations: 'Installations',
  },

  roles: {
  admin: 'Administrator',
  storeManager: 'Store Manager',
  crew: 'Installation Crew',
},
  header: {
  openUserMenu: 'Open user menu',
  yourProfile: 'Your Profile',
  settings: 'Settings',
  signOut: 'Sign out',
},

adminDashboard: {
  subtitle: 'Overview of your furniture installation operations',
  loading: 'Loading live data…',
  loadError: 'Failed to load some data from the API.',
  storeLabel: 'Store',
  allStores: 'All Stores',

  monthlyTitle: 'Monthly Installations',
  weeklyTitle: 'Weekly Installations',
  successfulInstallations: 'successful installations',
  of: 'of',
  vsLastMonth: 'vs last month',
  vsLastWeek: 'vs last week',
  changeVsLastMonth: 'Change vs last month (percentage)',
  changeVsLastWeek: 'Change vs last week (percentage)',

  recentActivityTitle: 'Recent Activity',
  recentActivityDescription:
    'Latest updates from your installation operations (live audit logs)',
  noRecentActivity: 'No recent activity for this filter.',

  quickViewOrdersTitle: 'View Orders',
  quickViewOrdersSubtitle: 'Manage and track orders',
  quickViewInstallationsTitle: 'View Installations',
  quickViewInstallationsSubtitle: 'Manage all installations',
  quickManageUsersTitle: 'Manage Users',
  quickManageUsersSubtitle: 'Add and edit users',
  quickViewReportsTitle: 'View Reports',
  quickViewReportsSubtitle: 'Analytics and insights',
},
};

export default enCommon;
