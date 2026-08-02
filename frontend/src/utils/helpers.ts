import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export function formatChatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true })
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d')
}

export function formatFullDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d, yyyy h:mm a')
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '…' : str
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'doctor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

export function getStatusColor(isActive: boolean): string {
  return isActive
    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}
