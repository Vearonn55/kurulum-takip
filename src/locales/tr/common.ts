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
};

export default trCommon;
