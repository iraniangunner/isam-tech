const SHARED_KEYWORDS_EN = [
  'ISAM',
  'industrial intelligence',
  'industrial automation',
  'digital twin',
  'IIoT',
  'SCADA',
  'EMS',
  'predictive maintenance',
  'industrial AI',
].join(', ');

const SHARED_KEYWORDS_FA = [
  'ایسام',
  'هوشمندسازی صنعتی',
  'اتوماسیون صنعتی',
  'دوقلوی دیجیتال',
  'IIoT',
  'SCADA',
  'EMS',
  'نگهداری پیش‌بینانه',
  'هوش مصنوعی صنعتی',
].join('، ');

export const PAGE_META = Object.freeze({
  home: Object.freeze({
    en: Object.freeze({
      title: 'ISAM | Industrial Intelligence and Automation Solutions',
      description: 'ISAM provides digital twin, IIoT, EMS, SCADA, predictive maintenance, and industrial AI solutions for modern industrial operations.',
      keywords: SHARED_KEYWORDS_EN,
    }),
    fa: Object.freeze({
      title: 'ایسام | هوشمندسازی صنعتی و تحلیل داده',
      description: 'ایسام ارائه‌دهنده راهکارهای دوقلوی دیجیتال، IIoT، EMS، SCADA، نگهداری پیش‌بینانه و هوش مصنوعی صنعتی برای صنایع پیشرو است.',
      keywords: SHARED_KEYWORDS_FA,
    }),
  }),
  about: Object.freeze({
    en: Object.freeze({
      title: 'About ISAM | Industrial Intelligence. Practical Impact.',
      description: 'Learn about ISAM mission, values, and delivery approach for industrial intelligence, analytics, and digital transformation.',
      keywords: `${SHARED_KEYWORDS_EN}, about ISAM, industrial transformation`,
    }),
    fa: Object.freeze({
      title: 'درباره ایسام | تحلیل هوشمند برای مدیریت صنایع',
      description: 'با ماموریت، ارزش‌ها و رویکرد اجرایی ایسام در مسیر هوشمندسازی و تحول دیجیتال صنعتی آشنا شوید.',
      keywords: `${SHARED_KEYWORDS_FA}، درباره ایسام، تحول دیجیتال صنعتی`,
    }),
  }),
  services: Object.freeze({
    en: Object.freeze({
      title: 'ISAM Services | Integrated Industrial Digitalization Capabilities',
      description: 'Explore ISAM services including digital twin, IIoT, predictive maintenance, SCADA, EMS, AI analytics, and executive decision support.',
      keywords: `${SHARED_KEYWORDS_EN}, industrial services, decision support`,
    }),
    fa: Object.freeze({
      title: 'خدمات ایسام | راهکارهای یکپارچه هوشمندسازی صنعتی',
      description: 'جزئیات خدمات ایسام شامل دوقلوی دیجیتال، IIoT، نگهداری پیش‌بینانه، SCADA، EMS، تحلیل هوشمند و تصمیم‌یار مدیریتی.',
      keywords: `${SHARED_KEYWORDS_FA}، خدمات صنعتی، تصمیم‌یار مدیریتی`,
    }),
  }),
  contact: Object.freeze({
    en: Object.freeze({
      title: 'Contact ISAM | Industrial Requirements Consultation',
      description: 'Contact ISAM to discuss your industrial requirements and receive consultation on digital transformation and intelligence projects.',
      keywords: `${SHARED_KEYWORDS_EN}, contact ISAM, industrial consulting`,
    }),
    fa: Object.freeze({
      title: 'تماس با ایسام | مشاوره نیازهای صنعتی',
      description: 'برای بررسی نیازهای صنعتی سازمان خود و دریافت مشاوره هوشمندسازی با تیم ایسام در ارتباط باشید.',
      keywords: `${SHARED_KEYWORDS_FA}، تماس با ایسام، مشاوره صنعتی`,
    }),
  }),
  privacyPolicy: Object.freeze({
    en: Object.freeze({
      title: 'Privacy Policy | ISAM',
      description: 'Read how ISAM collects, uses, stores, and protects user information on this website.',
      keywords: 'ISAM privacy policy, personal data, user privacy',
    }),
    fa: Object.freeze({
      title: 'سیاست حفظ حریم خصوصی | ایسام',
      description: 'نحوه جمع‌آوری، استفاده، نگهداری و حفاظت از اطلاعات کاربران در وب‌سایت ایسام را مطالعه کنید.',
      keywords: 'سیاست حفظ حریم خصوصی ایسام، داده شخصی، حریم خصوصی کاربران',
    }),
  }),
  dataPrivacy: Object.freeze({
    en: Object.freeze({
      title: 'Data Privacy | ISAM',
      description: 'Understand ISAM data processing, storage, security controls, and data subject rights.',
      keywords: 'ISAM data privacy, data protection, data governance',
    }),
    fa: Object.freeze({
      title: 'حریم خصوصی داده‌ها | ایسام',
      description: 'چارچوب پردازش، نگهداری، امنیت داده‌ها و حقوق مرتبط با داده‌ها در خدمات ایسام را مشاهده کنید.',
      keywords: 'حریم خصوصی داده ایسام، حفاظت داده، حاکمیت داده',
    }),
  }),
  notFound: Object.freeze({
    en: Object.freeze({
      title: 'Page Not Found | ISAM',
      description: 'The requested page could not be found on ISAM website.',
      keywords: 'ISAM 404, page not found',
    }),
    fa: Object.freeze({
      title: 'صفحه یافت نشد | ایسام',
      description: 'صفحه درخواستی در وب‌سایت ایسام یافت نشد.',
      keywords: 'ایسام 404، صفحه یافت نشد',
    }),
  }),
});

export function getPageMeta(pageKey = 'home', language = 'en') {
  const safeLanguage = language === 'fa' ? 'fa' : 'en';
  const byPage = PAGE_META[pageKey] || PAGE_META.home;
  return byPage[safeLanguage] || PAGE_META.home[safeLanguage];
}
