/**
 * Lightweight inline SVG icons (stroke-based, inherit currentColor).
 * Avoids an icon-library dependency while keeping markup tidy.
 */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

export const IconMenu = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconClose = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconCalendar = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" />
  </svg>
);

export const IconPhone = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <path d="M4 4h4l2 5-2.5 1.5a12 12 0 006 6L15 14l5 2v4a2 2 0 01-2 2A16 16 0 012 6a2 2 0 012-2z" />
  </svg>
);

export const IconMail = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

export const IconMapPin = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconStar = ({ filled, ...p }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    {...p}
  >
    <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9L12 3z" />
  </svg>
);

export const IconCheck = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const IconArrow = (p) => (
  <svg {...base} width="18" height="18" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconHeart = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <path d="M12 20s-7-4.5-9.5-9A5 5 0 0112 5a5 5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z" />
  </svg>
);

export const IconActivity = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <path d="M3 12h4l2 6 4-14 2 8h6" />
  </svg>
);

export const IconChevronLeft = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const IconChevronRight = (p) => (
  <svg {...base} width="24" height="24" {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IconChat = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 9 9 0 01-4-.9L3 21l1.9-5.5a8.38 8.38 0 01-.9-4 8.5 8.5 0 018.5-8.5 8.38 8.38 0 018.5 8z" />
  </svg>
);

export const IconBell = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 01-3.4 0" />
  </svg>
);

export const IconClock = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconUsers = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <path d="M16 19v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="3.2" />
    <path d="M22 19v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0116 11" />
  </svg>
);

export const IconGrid = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconExternal = (p) => (
  <svg {...base} width="20" height="20" {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4" />
  </svg>
);
