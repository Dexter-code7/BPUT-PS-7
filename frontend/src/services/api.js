// Unified Campus ERP - API Service Layer
// Communicates with PHP Backend via REST

const API_BASE_URL = window.location.port === '5173'
  ? '/api'
  : 'http://127.0.0.1/collegelife/backend/api/index.php?r=';

export const getStoredToken = () => localStorage.getItem('campus_erp_token');
export const setStoredToken = (token) => localStorage.setItem('campus_erp_token', token);
export const clearStoredToken = () => localStorage.removeItem('campus_erp_token');

export async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Auth-Token'] = token;
  }

  // Construct URL based on whether we are using proxy or direct PHP query
  let url = '';
  if (API_BASE_URL.includes('index.php?r=')) {
    url = `${API_BASE_URL}${endpoint}`;
  } else {
    url = `${API_BASE_URL}/${endpoint}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    apiRequest('auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  getMe: () => apiRequest('auth/me'),

  logout: () =>
    apiRequest('auth/logout', { method: 'POST' }).finally(() => {
      clearStoredToken();
    }),

  getDemoAccounts: () => apiRequest('auth/demo-accounts'),

  demoSwitch: (userId) =>
    apiRequest('auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    }),

  // Profile
  getOwnProfile: () => apiRequest('profile/me'),

  updateContact: (payload) =>
    apiRequest('profile/update-contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  listStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`students${query ? '&' + query : ''}`);
  },

  // RBAC & Tags
  getRoles: () => apiRequest('rbac/roles'),
  getTags: () => apiRequest('rbac/tags'),
  getUserTags: (userId) => apiRequest(`rbac/user-tags&user_id=${userId}`),
  assignTag: (payload) =>
    apiRequest('rbac/assign-tag', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  revokeTag: (userTagId) =>
    apiRequest('rbac/revoke-tag', {
      method: 'POST',
      body: JSON.stringify({ user_tag_id: userTagId })
    }),

  // Master Data
  getDepartments: () => apiRequest('master/departments'),
  getPrograms: (deptId) => apiRequest(`master/programs${deptId ? '&department_id=' + deptId : ''}`),
  getAuditLogs: (limit = 40) => apiRequest(`master/audit-logs&limit=${limit}`),

  // Phase 2: Smart Forms Engine
  getForms: (params = {}) => {
    const clean = {};
    if (params.category && params.category !== 'all' && params.category !== 'undefined') {
      clean.category = params.category;
    }
    if (params.search && params.search.trim() !== '' && params.search !== 'undefined') {
      clean.search = params.search.trim();
    }
    if (params.status && params.status !== 'all') {
      clean.status = params.status;
    }
    const query = new URLSearchParams(clean).toString();
    return apiRequest(`forms${query ? '&' + query : ''}`);
  },

  getFormDetail: (id) => apiRequest(`forms/detail&id=${id}`),
  submitForm: (payload) =>
    apiRequest('forms/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  createForm: (payload) =>
    apiRequest('forms/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getSubmissions: (formId) => apiRequest(`forms/submissions&form_id=${formId}`),
  getExportCsvUrl: (formId) => {
    const token = getStoredToken();
    const base = window.location.port === '5173'
      ? '/api'
      : 'http://127.0.0.1/collegelife/backend/api/index.php?r=';
    const separator = base.includes('index.php?r=') ? '' : '/';
    return `${base}${separator}forms/export-csv&form_id=${formId}&token=${token}`;
  },

  // Phase 3: Digital Service Request Center (Certificates & Applications)
  getServiceCatalog: () => apiRequest('services/catalog'),
  getMyServiceRequests: () => apiRequest('services/my-requests'),
  applyServiceRequest: (payload) =>
    apiRequest('services/apply', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getServiceRequests: (params = {}) => {
    const clean = {};
    if (params.status && params.status !== 'all') clean.status = params.status;
    if (params.service_type_id && params.service_type_id > 0) clean.service_type_id = params.service_type_id;
    if (params.search && params.search.trim()) clean.search = params.search.trim();
    const query = new URLSearchParams(clean).toString();
    return apiRequest(`services/requests${query ? '&' + query : ''}`);
  },
  getServiceRequestDetail: (id) => apiRequest(`services/detail&id=${id}`),
  updateServiceStatus: (payload) =>
    apiRequest('services/update-status', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getServiceCertificate: (id) => apiRequest(`services/certificate&id=${id}`),
  getServicePickupPass: (id) => apiRequest(`services/pickup-pass&id=${id}`),
  respondServiceAction: (payload) =>
    apiRequest('services/respond-action', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Phase 4: Targeted Announcements & Notification System
  getNotices: (params = {}) => {
    const clean = {};
    if (params.category && params.category !== 'all') clean.category = params.category;
    if (params.priority && params.priority !== 'all') clean.priority = params.priority;
    if (params.scope && params.scope !== 'all') clean.scope = params.scope;
    if (params.unread_only) clean.unread_only = '1';
    if (params.search && params.search.trim()) clean.search = params.search.trim();
    const query = new URLSearchParams(clean).toString();
    return apiRequest(`notices${query ? '&' + query : ''}`);
  },
  getNoticeDetail: (id) => apiRequest(`notices/detail&id=${id}`),
  createNotice: (payload) =>
    apiRequest('notices/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  acknowledgeNotice: (payload) =>
    apiRequest('notices/acknowledge', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getNoticeComplianceExportUrl: (id) => {
    const token = getStoredToken();
    const base = window.location.port === '5173'
      ? '/api'
      : 'http://127.0.0.1/collegelife/backend/api/index.php?r=';
    const separator = base.includes('index.php?r=') ? '' : '/';
    return `${base}${separator}notices/compliance-export&id=${id}&token=${token}`;
  },
  uploadNoticeAttachment: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('notices/upload', {
      method: 'POST',
      body: formData
    });
  },
  getNoticeDownloadUrl: (id) => {
    const token = getStoredToken();
    const base = window.location.port === '5173'
      ? '/api'
      : 'http://127.0.0.1/collegelife/backend/api/index.php?r=';
    const separator = base.includes('index.php?r=') ? '' : '/';
    return `${base}${separator}notices/download&id=${id}&token=${token}`;
  },
  sendNoticeReminder: (payload) =>
    apiRequest('notices/send-reminder', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getMyEmailReminders: () => apiRequest('notices/my-email-reminders'),
  getNoticeReminderHistory: (noticeId) => apiRequest(`notices/reminder-history&notice_id=${noticeId}`),
  markNoticeReminderRead: (reminderId) =>
    apiRequest('notices/mark-reminder-read', {
      method: 'POST',
      body: JSON.stringify({ reminder_id: reminderId })
    }),
  getNoticeAutomationSettings: () => apiRequest('notices/automation-settings'),
  updateNoticeAutomationSettings: (payload) =>
    apiRequest('notices/automation-settings', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  runNoticeAutomatedCycle: (options = {}) =>
    apiRequest('notices/run-automation', {
      method: 'POST',
      body: JSON.stringify(options)
    }),
  getNoticeAutomatedLogs: () => apiRequest('notices/automated-logs'),
  toggleNoticeAutoReminder: (noticeId, enabled) =>
    apiRequest('notices/toggle-auto-reminder', {
      method: 'POST',
      body: JSON.stringify({ notice_id: noticeId, enabled })
    }),

  // Phase 5: Grievances & Maintenance Ticketing (SLA & Auto-Routing)
  getGrievances: (params = {}) => {
    const clean = {};
    if (params.status && params.status !== 'all') clean.status = params.status;
    if (params.category_id) clean.category_id = params.category_id;
    if (params.priority && params.priority !== 'all') clean.priority = params.priority;
    if (params.overdue_only) clean.overdue_only = '1';
    if (params.search && params.search.trim()) clean.search = params.search.trim();
    const query = new URLSearchParams(clean).toString();
    return apiRequest(`grievances${query ? '&' + query : ''}`);
  },
  getGrievanceDetail: (id) => apiRequest(`grievances/detail&id=${id}`),
  getGrievanceCategories: () => apiRequest('grievances/categories'),
  getGrievancePatternRadar: () => apiRequest('grievances/pattern-radar'),
  createGrievance: (payload) =>
    apiRequest('grievances/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  assignGrievanceTechnician: (payload) =>
    apiRequest('grievances/assign', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  resolveGrievance: (payload) =>
    apiRequest('grievances/resolve', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  rateGrievance: (payload) =>
    apiRequest('grievances/rate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  escalateGrievance: (payload) =>
    apiRequest('grievances/escalate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Phase 6: Institutional Examinations, Admit Cards & Academic Results
  getExamSessions: () => apiRequest('exams/sessions'),
  getExamCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`exams/courses${query ? '&' + query : ''}`);
  },
  getExamSchedules: (params = {}) => {
    const clean = {};
    if (params.session_id) clean.session_id = params.session_id;
    if (params.program_id) clean.program_id = params.program_id;
    if (params.semester) clean.semester = params.semester;
    const query = new URLSearchParams(clean).toString();
    return apiRequest(`exams/schedules${query ? '&' + query : ''}`);
  },
  getAdmitCard: (params = {}) => {
    const clean = {};
    if (params.session_id) clean.session_id = params.session_id;
    if (params.student_profile_id) clean.student_profile_id = params.student_profile_id;
    const query = new URLSearchParams(clean).toString();
    return apiRequest(`exams/admit-card${query ? '&' + query : ''}`);
  },
  getAdmitCardsRoster: (params = {}) => {
    const clean = {};
    if (params.session_id) clean.session_id = params.session_id;
    if (params.program_id) clean.program_id = params.program_id;
    if (params.status && params.status !== 'all') clean.status = params.status;
    if (params.search) clean.search = params.search;
    const query = new URLSearchParams(clean).toString();
    return apiRequest(`exams/admit-cards-roster${query ? '&' + query : ''}`);
  },
  toggleAdmitCard: (payload) =>
    apiRequest('exams/toggle-admit-card', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  bulkReleaseAdmitCards: (payload) =>
    apiRequest('exams/bulk-release-admit-cards', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getExamResults: (params = {}) => {
    const clean = {};
    if (params.session_id) clean.session_id = params.session_id;
    if (params.student_profile_id) clean.student_profile_id = params.student_profile_id;
    const query = new URLSearchParams(clean).toString();
    return apiRequest(`exams/results${query ? '&' + query : ''}`);
  },
  enterExamMarks: (payload) =>
    apiRequest('exams/enter-marks', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  publishExamResults: (payload) =>
    apiRequest('exams/publish-results', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  createExamSchedule: (payload) =>
    apiRequest('exams/create-schedule', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Phase 7: Campus Life, Gatepass, Mess & Academic Attendance
  getAttendance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`campus/attendance${query ? '&' + query : ''}`);
  },
  getAttendanceRoster: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`campus/attendance/roster${query ? '&' + query : ''}`);
  },
  submitAttendanceRoster: (payload) =>
    apiRequest('campus/attendance/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getAttendanceHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`campus/attendance/history${query ? '&' + query : ''}`);
  },
  getSubjectAllocations: () => apiRequest('campus/faculty-subject/allocations'),
  assignFacultySubject: (payload) =>
    apiRequest('campus/faculty-subject/assign', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getTimetable: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`campus/timetable${query ? '&' + query : ''}`);
  },
  updateTimetableSlot: (payload) =>
    apiRequest('campus/timetable/update-slot', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getAcademicCalendar: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`campus/academic-calendar${query ? '&' + query : ''}`);
  },
  createCalendarEvent: (payload) =>
    apiRequest('campus/calendar-events/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getDutyLeaves: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`campus/duty-leaves${query ? '&' + query : ''}`);
  },
  applyDutyLeave: (payload) =>
    apiRequest('campus/duty-leaves/apply', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  reviewDutyLeave: (payload) =>
    apiRequest('campus/duty-leaves/review', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getGatepasses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`campus/gatepasses${query ? '&' + query : ''}`);
  },
  applyGatepass: (payload) =>
    apiRequest('campus/gatepasses/apply', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  reviewGatepass: (payload) =>
    apiRequest('campus/gatepasses/review', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  punchGatepass: (payload) =>
    apiRequest('campus/gatepasses/punch', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getCampusCensus: () => apiRequest('campus/gatepasses/census'),
  getHostelLeaves: (params = {}) => {
    const clean = {};
    if (params.status && params.status !== 'all' && params.status !== 'undefined') clean.status = params.status;
    if (params.hostel && params.hostel !== 'all' && params.hostel !== 'undefined') clean.hostel = params.hostel;
    const query = new URLSearchParams(clean).toString();
    return apiRequest(`campus/hostel-leaves${query ? '&' + query : ''}`);
  },
  applyHostelLeave: (payload) =>
    apiRequest('campus/hostel-leaves/apply', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  reviewHostelLeave: (payload) =>
    apiRequest('campus/hostel-leaves/review', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  cancelHostelLeave: (payload) =>
    apiRequest('campus/hostel-leaves/cancel', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getMessMenu: () => apiRequest('campus/mess/menu'),
  getMessRsvps: () => apiRequest('campus/mess/rsvps'),
  toggleMessRsvp: (payload) =>
    apiRequest('campus/mess/rsvp', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  bulkMessRsvp: (payload) =>
    apiRequest('campus/mess/bulk-rsvp', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getMessAnalytics: () => apiRequest('campus/mess/analytics'),
  submitMessFeedback: (payload) =>
    apiRequest('campus/mess/feedback', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateMessMenu: (payload) =>
    apiRequest('campus/mess/update-menu', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getMessFeedbackLedger: () => apiRequest('campus/mess/feedback-ledger'),
  getMessRoster: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`campus/mess/roster${query ? '&' + query : ''}`);
  },
  processUssd: (payload) =>
    apiRequest('campus/feature-phone/ussd', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  processMigrationImport: (payload) =>
    apiRequest('campus/migration/import-csv', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Self-Learning Institutional CampusDesk Chatbot & Support Desk
  askChatbot: (payload) =>
    apiRequest('chatbot/ask', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getChatbotMessages: () => apiRequest('chatbot/messages'),
  escalateChatbot: () =>
    apiRequest('chatbot/escalate', {
      method: 'POST',
      body: JSON.stringify({})
    }),
  getSupportSessions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`support/sessions${query ? '&' + query : ''}`);
  },
  getSupportSessionDetail: (sessionId) =>
    apiRequest(`support/session-detail&session_id=${sessionId}`),
  sendSupportReply: (payload) =>
    apiRequest('support/send-reply', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  resolveSupportSession: (payload) =>
    apiRequest('support/resolve-session', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getSupportLearnedQA: () => apiRequest('support/learned-qa'),
  teachSupportQA: (payload) =>
    apiRequest('support/teach-qa', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  deleteSupportQA: (payload) =>
    apiRequest('support/delete-qa', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getSupportSettings: () => apiRequest('support/settings'),
  updateSupportSettings: (payload) =>
    apiRequest('support/settings', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};

