// src/locales/tr/common.ts
const trCommon = {
  appName: 'Kurulum Takip',

  nav: {
    dashboard: 'Kontrol Paneli',
    orders: 'Siparişler',
    installations: 'Kurulumlar',
    calendar: 'Takvim',
    reports: 'Raporlar',
    usersAndRoles: 'Kullanıcılar & Roller',
    integrations: 'Entegrasyonlar',
    audit: 'Denetim',

    crewHome: 'Ana Sayfa',
    crewJobs: 'İşler',
    crewIssues: 'Sorunlar',
    crewSettings: 'Ayarlar',
  },

  settings: {
    title: 'Ayarlar',
    subtitle: 'Tercihlerinizi yapılandırın.',
    languageSectionTitle: 'Dil',
    languageSectionDescription: 'Arayüz dilini seçin.',
    english: 'İngilizce',
    turkish: 'Türkçe',
  },

  common: {
    save: 'Kaydet',
    cancel: 'İptal',
    searchPlaceholder: 'Ara...',
  },

  pages: {
    adminDashboard: 'Kontrol Paneli',
    installations: 'Kurulumlar',
  },

  roles: {
  admin: 'Yönetici',
  storeManager: 'Mağaza Müdürü',
  crew: 'Kurulum Ekibi',
},
  header: {
  openUserMenu: 'Kullanıcı menüsünü aç',
  yourProfile: 'Profiliniz',
  settings: 'Ayarlar',
  signOut: 'Çıkış yap',
},

adminDashboard: {
  subtitle: 'Mobilya kurulum operasyonlarınızın genel görünümü',
  loading: 'Canlı veriler yükleniyor…',
  loadError: 'API’den bazı veriler yüklenemedi.',
  storeLabel: 'Mağaza',
  allStores: 'Tüm Mağazalar',

  monthlyTitle: 'Aylık Kurulumlar',
  weeklyTitle: 'Haftalık Kurulumlar',
  successfulInstallations: 'başarılı kurulum',
  of: ' / toplam',
  vsLastMonth: 'geçen aya göre',
  vsLastWeek: 'geçen haftaya göre',
  changeVsLastMonth: 'Geçen aya göre değişim (yüzde)',
  changeVsLastWeek: 'Geçen haftaya göre değişim (yüzde)',

  recentActivityTitle: 'Son Aktiviteler',
  recentActivityDescription:
    'Kurulum operasyonlarınızdan en güncel hareketler (canlı denetim kayıtları)',
  noRecentActivity: 'Bu filtre için son aktivite bulunmuyor.',

  quickViewOrdersTitle: 'Siparişleri Görüntüle',
  quickViewOrdersSubtitle: 'Siparişleri yönet ve takip et',
  quickViewInstallationsTitle: 'Kurulumları Görüntüle',
  quickViewInstallationsSubtitle: 'Tüm kurulumları yönet',
  quickManageUsersTitle: 'Kullanıcıları Yönet',
  quickManageUsersSubtitle: 'Kullanıcı ekle ve düzenle',
  quickViewReportsTitle: 'Raporları Görüntüle',
  quickViewReportsSubtitle: 'Analizler ve içgörüler',
},

usersPage: {
    title: 'Kullanıcılar',
    subtitle: 'Erişimi ve rolleri yönetin',

    refresh: 'Yenile',
    newUserButton: 'Yeni Kullanıcı',

    searchPlaceholder: 'İsim, e-posta, telefon veya kimlik ile ara…',

    filters: {
      allRoles: 'Tüm roller',
      allStatuses: 'Tüm durumlar',
    },

    status: {
      active: 'Aktif',
      disabled: 'Devre dışı',
    },

    table: {
      name: 'Ad',
      email: 'E-posta',
      role: 'Rol',
      status: 'Durum',
      actions: 'İşlemler',
    },

    actions: {
      edit: 'Düzenle',
      disable: 'Devre dışı bırak',
      activate: 'Aktifleştir',
      create: 'Oluştur',
      saveChanges: 'Değişiklikleri kaydet',
    },

    noUsers: 'Kullanıcı bulunamadı.',
    loading: 'Kullanıcılar yükleniyor…',
    loadError: 'Kullanıcılar yüklenemedi.',

    toasts: {
      userCreated: 'Kullanıcı oluşturuldu',
      createFailed: 'Kullanıcı oluşturulamadı',
      userUpdated: 'Kullanıcı güncellendi',
      updateFailed: 'Kullanıcı güncellenemedi',
    },

    validation: {
      missingRequired:
        'İsim, e-posta, şifre ve rol zorunludur.',
    },

    create: {
      title: 'Yeni Kullanıcı',
      subtitle: 'Yeni bir hesap oluştur',
    },

    edit: {
      title: 'Kullanıcıyı Düzenle',
      subtitle: 'Hesap ayarlarını güncelle',
    },

    form: {
      fullName: 'Ad Soyad',
      email: 'E-posta',
      phoneOptional: 'Telefon (opsiyonel)',
      initialPassword: 'İlk şifre',
      selectRolePlaceholder: 'Rol seçin…',
    },
  },

    audit: {
    title: 'Denetim Kayıtları',
    subtitle: 'Backend\'den gelen gerçek loglar.',

    filters: {
      searchPlaceholder: 'ID, işlem, varlık, IP ara...',
      actorPlaceholder: 'Aktör ID',
      entityPlaceholder: 'Varlık (Kullanıcı, Sipariş, Kurulum...)',
      dateTo: 'ile',
    },

    table: {
      timestamp: 'Zaman damgası',
      actor: 'Aktör',
      action: 'İşlem',
      entity: 'Varlık',
      entityId: 'Varlık ID',
      ip: 'IP',
      payload: 'Yük (Payload)',
      noLogs: 'Herhangi bir denetim kaydı bulunamadı.',
    },

    buttons: {
      refresh: 'Yenile',
      viewJson: 'JSON\'u görüntüle',
      copyJson: 'JSON\'u kopyala',
      close: 'Kapat',
    },

    pagination: {
      page: 'Sayfa',
      of: ' / ',
    },

    drawer: {
      payload: 'Yük (Payload)',
      actor: 'Aktör',
      ip: 'IP',
    },
  },

  reportsPage: {
  title: 'Raporlar',
  filtersTitle: 'Filtreler',
  startLabel: 'Başlangıç',
  endLabel: 'Bitiş',
  cityLabel: 'Şehir',
  storeLabel: 'Mağaza',
  allStores: 'Tüm Mağazalar',

  installationsTitle: 'Kurulumlar',
  totalSuccessfulLabel: 'Toplam Başarılı Kurulum',
  successRateLabel: 'Başarı oranı',

  difficultyTitle: 'Kurulum Zorluk Toplamı',
  easyLabel: 'Kolay',
  intermediateLabel: 'Orta',
  hardLabel: 'Zor',

  serviceAfterTitle: 'Kurulum Sonrası Servis',
  serviceAfterDescription: 'Toplam Kurulum / Kurulum Sonrası Servisli',

  showing: 'Gösteriliyor',
  item: 'kayıt',
  items: 'kayıt',
  for: 'için',
  selectedStoreSuffix: '• seçili mağaza',
  between: 'arasında',
  and: 've',

  noInstallations: 'Seçilen filtrelere uyan kurulum bulunamadı.',

  viewInstallation: 'Kurulumu Görüntüle',
  viewInstallationTooltip: 'Kurulum detayına git',

  debugCurrentParams: 'Geçerli parametreler →',
},

calendarPage: {
  prev: 'Önceki',
  next: 'Sonraki',
  weekView: 'Haftalık Görünüm',
  storeLabelShort: 'Mağaza',

  monthly: 'Aylık',
  month: 'Ay',
  weekly: 'Haftalık',
  week: 'Hafta',

  refresh: 'Yenile',
  jumpToThisMonth: 'Bu aya git',
  today: 'Bugün',
  createInstallation: 'Kurulum Oluştur',

  legend: {
    completed: 'Tamamlandı',
    acceptedPendingScheduled: 'Kabul / Bekliyor / Planlandı',
    failedCanceled: 'Başarısız / İptal',
    inProgress: 'Devam ediyor',
  },

  weekdays: {
    mon: 'Pzt',
    tue: 'Sal',
    wed: 'Çar',
    thu: 'Per',
    fri: 'Cum',
    sat: 'Cmt',
    sun: 'Paz',
  },

  more: 'daha…',

  loadingInstallations: 'Kurulumlar yükleniyor…',
  failedToLoadInstallations: 'Kurulumlar yüklenemedi.',
  noInstallationsThisMonth: 'Bu ay için kurulum bulunmuyor.',
  noInstallationsThisWeek: 'Bu hafta için kurulum bulunmuyor.',

  timeColumn: 'Saat',
},


};

export default trCommon;
