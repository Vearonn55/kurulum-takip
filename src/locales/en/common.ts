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

  usersPage: {
    title: 'Users',
    subtitle: 'Manage access and roles',

    refresh: 'Refresh',
    newUserButton: 'New User',

    searchPlaceholder: 'Search by name, email, phone, id…',

    filters: {
      allRoles: 'All roles',
      allStatuses: 'All statuses',
    },

    status: {
      active: 'Active',
      disabled: 'Disabled',
    },

    table: {
      name: 'Name',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      actions: 'Actions',
    },

    actions: {
      edit: 'Edit',
      disable: 'Disable',
      activate: 'Activate',
      create: 'Create',
      saveChanges: 'Save changes',
    },

    noUsers: 'No users found.',
    loading: 'Loading users…',
    loadError: 'Failed to load users.',

    toasts: {
      userCreated: 'User created',
      createFailed: 'Failed to create user',
      userUpdated: 'User updated',
      updateFailed: 'Failed to update user',
    },

    validation: {
      missingRequired:
        'Name, email, password and role are required',
    },

    create: {
      title: 'New User',
      subtitle: 'Create a new account',
    },

    edit: {
      title: 'Edit User',
      subtitle: 'Update account settings',
    },

    form: {
      fullName: 'Full name',
      email: 'Email',
      phoneOptional: 'Phone (optional)',
      initialPassword: 'Initial password',
      selectRolePlaceholder: 'Select role…',
    },
  },
  
   audit: {
    title: 'Audit Logs',
    subtitle: 'Real logs from backend.',

    filters: {
      searchPlaceholder: 'Search id, action, entity, ip...',
      actorPlaceholder: 'Actor ID',
      entityPlaceholder: 'Entity (User, Order, Installation...)',
      dateTo: 'to',
    },

    table: {
      timestamp: 'Timestamp',
      actor: 'Actor',
      action: 'Action',
      entity: 'Entity',
      entityId: 'Entity ID',
      ip: 'IP',
      payload: 'Payload',
      noLogs: 'No audit logs found.',
    },

    buttons: {
      refresh: 'Refresh',
      viewJson: 'View JSON',
      copyJson: 'Copy JSON',
      close: 'Close',
    },

    pagination: {
      page: 'Page',
      of: ' / ',
    },

    drawer: {
      payload: 'Payload',
      actor: 'Actor',
      ip: 'IP',
    },
  },

  reportsPage: {
  title: 'Reports',
  filtersTitle: 'Filters',
  startLabel: 'Start',
  endLabel: 'End',
  cityLabel: 'City',
  storeLabel: 'Store',
  allStores: 'All Stores',

  installationsTitle: 'Installations',
  totalSuccessfulLabel: 'Total Successful Installations',
  successRateLabel: 'Success rate',

  difficultyTitle: 'Installation Difficulty Total',
  easyLabel: 'Easy',
  intermediateLabel: 'Intermediate',
  hardLabel: 'Hard',

  serviceAfterTitle: 'Service After Installation',
  serviceAfterDescription: 'Total Installations / With Service After Installation',

  showing: 'Showing',
  item: 'item',
  items: 'items',
  for: 'for',
  selectedStoreSuffix: '• selected store',
  between: 'between',
  and: 'and',

  noInstallations: 'No installations match the selected filters.',

  viewInstallation: 'View Installation',
  viewInstallationTooltip: 'Go to Installation Detail',

  debugCurrentParams: 'Current params →',
},

calendarPage: {
  prev: 'Previous',
  next: 'Next',
  weekView: 'Week View',
  storeLabelShort: 'Store',

  monthly: 'Monthly',
  month: 'Month',
  weekly: 'Weekly',
  week: 'Week',

  refresh: 'Refresh',
  jumpToThisMonth: 'Jump to this month',
  today: 'Today',
  createInstallation: 'Create Installation',

  legend: {
    completed: 'Completed',
    acceptedPendingScheduled: 'Accepted / Pending / Scheduled',
    failedCanceled: 'Failed / Canceled',
    inProgress: 'In Progress',
  },

  weekdays: {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
  },

  more: 'more…',

  loadingInstallations: 'Loading installations…',
  failedToLoadInstallations: 'Failed to load installations.',
  noInstallationsThisMonth: 'No installations in this month.',
  noInstallationsThisWeek: 'No installations in this week.',

  timeColumn: 'Time',
},


};

export default enCommon;
