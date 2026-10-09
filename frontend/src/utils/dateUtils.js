// Unified Campus ERP - 12-Hour Institutional Time & Date Utility
// Formats timestamps and schedule slots throughout the web app into 12-hour AM/PM format

/**
 * Format any time string ('14:30:00', '14:30', '2026-10-09 14:30:00', or Date) to 12-hour 'hh:mm AM/PM'
 */
export function formatTime12(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return isNaN(val.getTime())
      ? ''
      : val.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const str = String(val).trim();

  // Check if it's already in 12-hour format
  if (/\b(AM|PM)\b/i.test(str)) {
    return str;
  }

  // If it's a full date string or ISO timestamp
  if (str.includes('-') || str.includes('/') || str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  }

  // Handle standard time strings 'HH:MM' or 'HH:MM:SS'
  const match = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const hh = hours < 10 ? '0' + hours : '' + hours;
    return `${hh}:${mins} ${ampm}`;
  }

  return str;
}

/**
 * Format date + time in 12-hour format: '09 Oct 2026, 01:56 PM'
 */
export function formatDateTime12(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return String(val);

  const datePart = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `${datePart}, ${timePart}`;
}

/**
 * Format date only: '09 Oct 2026'
 */
export function formatDate12(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return String(val);

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format time range: ('09:00:00', '10:00:00') -> '09:00 AM - 10:00 AM'
 */
export function formatTimeRange12(start, end) {
  if (!start) return '';
  const s = formatTime12(start);
  if (!end) return s;
  const e = formatTime12(end);
  return `${s} - ${e}`;
}

/**
 * Format slot strings like '07:30 – 09:00' to '07:30 AM – 09:00 AM'
 */
export function formatTimeSlot12(slotStr) {
  if (!slotStr) return '';
  return slotStr.replace(/(\d{1,2}:\d{2})/g, (m) => formatTime12(m));
}
