export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getEventStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    pre_complete: 'Pre-Event Done',
    post_complete: 'Post-Event Done',
    compared: 'Compared',
    exported: 'Report Exported',
  }
  return labels[status] ?? status
}

export function getEventStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-charcoal-600 text-gray-300',
    pre_complete: 'bg-blue-900 text-blue-300',
    post_complete: 'bg-purple-900 text-purple-300',
    compared: 'bg-yellow-900 text-yellow-300',
    exported: 'bg-green-900 text-green-300',
  }
  return colors[status] ?? 'bg-charcoal-600 text-gray-300'
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    minor: 'text-yellow-400',
    moderate: 'text-orange-400',
    major: 'text-red-400',
  }
  return colors[severity] ?? 'text-gray-400'
}

export function getSeverityBg(severity: string): string {
  const colors: Record<string, string> = {
    minor: 'bg-yellow-900 text-yellow-300',
    moderate: 'bg-orange-900 text-orange-300',
    major: 'bg-red-900 text-red-300',
  }
  return colors[severity] ?? 'bg-charcoal-600 text-gray-300'
}
