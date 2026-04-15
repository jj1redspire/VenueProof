import jsPDF from 'jspdf'
import type { VPEvent, VPComparison } from '@/types'

const GOLD = [212, 175, 55] as [number, number, number]
const CHARCOAL = [26, 26, 26] as [number, number, number]
const WHITE = [255, 255, 255] as [number, number, number]
const LIGHT_GRAY = [200, 200, 200] as [number, number, number]
const RED = [220, 38, 38] as [number, number, number]
const GREEN = [22, 163, 74] as [number, number, number]
const ORANGE = [234, 88, 12] as [number, number, number]
const YELLOW = [234, 179, 8] as [number, number, number]

function addHeader(doc: jsPDF, event: VPEvent, reportId: string) {
  // Header bar
  doc.setFillColor(...CHARCOAL)
  doc.rect(0, 0, 210, 28, 'F')

  // Gold accent line
  doc.setFillColor(...GOLD)
  doc.rect(0, 28, 210, 1.5, 'F')

  // Logo text
  doc.setTextColor(...GOLD)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('VenueProof', 14, 12)

  doc.setTextColor(...LIGHT_GRAY)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Deposit Deduction Report', 14, 19)

  // Report ID top right
  doc.setTextColor(...LIGHT_GRAY)
  doc.setFontSize(8)
  doc.text(`Report ID: ${reportId}`, 196, 10, { align: 'right' })
  doc.text(`Generated: ${new Date().toLocaleString()}`, 196, 16, { align: 'right' })
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageHeight = doc.internal.pageSize.height
  doc.setFillColor(...CHARCOAL)
  doc.rect(0, pageHeight - 12, 210, 12, 'F')
  doc.setTextColor(...LIGHT_GRAY)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('VenueProof — venueproof.io', 14, pageHeight - 5)
  doc.text(`Page ${pageNum} of ${totalPages}`, 196, pageHeight - 5, { align: 'right' })
}

function checkPageBreak(doc: jsPDF, y: number, needed: number = 20): number {
  const pageHeight = doc.internal.pageSize.height
  if (y + needed > pageHeight - 20) {
    doc.addPage()
    return 40
  }
  return y
}

export function generateDepositReport(
  event: VPEvent,
  comparisons: VPComparison[],
  locationName: string,
  deductionAmounts: Record<string, number>
): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const reportId = event.id.slice(0, 8).toUpperCase()
  const totalPages = 2 + Math.ceil(comparisons.length / 2)

  // --- PAGE 1: Summary ---
  addHeader(doc, event, reportId)

  let y = 38

  // Event Info Block
  doc.setFillColor(30, 30, 30)
  doc.roundedRect(12, y, 186, 40, 2, 2, 'F')

  doc.setTextColor(...GOLD)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(event.event_name, 18, y + 9)

  doc.setTextColor(...LIGHT_GRAY)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Client: ${event.client_name}`, 18, y + 17)
  doc.text(`Venue: ${locationName}`, 18, y + 24)
  doc.text(`Event Date: ${new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 18, y + 31)
  if (event.guest_count) doc.text(`Estimated Guests: ${event.guest_count}`, 18, y + 38)

  const depositStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(event.deposit_amount)
  doc.setTextColor(...GOLD)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Deposit: ${depositStr}`, 155, y + 9, { align: 'right' })

  y += 48

  // Calculate totals
  const totalDeductions = Object.values(deductionAmounts).reduce((sum, v) => sum + v, 0)
  const netRefund = Math.max(0, event.deposit_amount - totalDeductions)
  const totalDamageItems = comparisons.reduce((sum, c) => sum + (c.damage_items?.new_damage?.length || 0), 0)

  // Deposit Summary Box
  doc.setFillColor(20, 20, 20)
  doc.roundedRect(12, y, 186, 38, 2, 2, 'F')
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.5)
  doc.roundedRect(12, y, 186, 38, 2, 2, 'S')

  doc.setTextColor(...WHITE)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Deposit Summary', 18, y + 9)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...LIGHT_GRAY)
  doc.text('Original Deposit:', 18, y + 18)
  doc.text('Total Deductions:', 18, y + 25)
  doc.text('Net Refund to Client:', 18, y + 34)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(event.deposit_amount), 196, y + 18, { align: 'right' })

  if (totalDeductions > 0) {
    doc.setTextColor(...RED)
    doc.text(`-${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalDeductions)}`, 196, y + 25, { align: 'right' })
  } else {
    doc.setTextColor(...GREEN)
    doc.text('$0', 196, y + 25, { align: 'right' })
  }

  doc.setTextColor(...GOLD)
  doc.setFontSize(12)
  doc.text(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netRefund), 196, y + 34, { align: 'right' })

  y += 46

  // Stats row
  const stats = [
    { label: 'Zones Inspected', value: String(comparisons.length) },
    { label: 'Damage Items Found', value: String(totalDamageItems) },
    { label: 'Zones with Damage', value: String(comparisons.filter(c => (c.damage_items?.new_damage?.length ?? 0) > 0).length) },
  ]

  const statW = 60
  stats.forEach((stat, i) => {
    const sx = 12 + i * (statW + 3)
    doc.setFillColor(38, 38, 38)
    doc.roundedRect(sx, y, statW, 22, 2, 2, 'F')
    doc.setTextColor(...GOLD)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.value, sx + statW / 2, y + 12, { align: 'center' })
    doc.setTextColor(...LIGHT_GRAY)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(stat.label, sx + statW / 2, y + 19, { align: 'center' })
  })

  y += 30

  // Itemized Deductions Table
  doc.setTextColor(...WHITE)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Itemized Deductions', 14, y)
  y += 6

  if (totalDamageItems === 0) {
    doc.setFillColor(30, 30, 30)
    doc.roundedRect(12, y, 186, 14, 2, 2, 'F')
    doc.setTextColor(...GREEN)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('No damage found — full deposit refund recommended', 105, y + 9, { align: 'center' })
    y += 20
  } else {
    // Table header
    doc.setFillColor(38, 38, 38)
    doc.rect(12, y, 186, 8, 'F')
    doc.setTextColor(...GOLD)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text('Zone / Item', 15, y + 5.5)
    doc.text('Severity', 110, y + 5.5)
    doc.text('Deduction', 196, y + 5.5, { align: 'right' })
    y += 8

    let rowAlt = false
    comparisons.forEach(comp => {
      const damages = comp.damage_items?.new_damage || []
      if (damages.length === 0) return

      damages.forEach(dmg => {
        y = checkPageBreak(doc, y, 10)
        doc.setFillColor(rowAlt ? 28 : 33, rowAlt ? 28 : 33, rowAlt ? 28 : 33)
        doc.rect(12, y, 186, 9, 'F')

        doc.setTextColor(...LIGHT_GRAY)
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        const itemText = `${comp.zone_name}: ${dmg.item}`
        doc.text(itemText.length > 55 ? itemText.slice(0, 52) + '...' : itemText, 15, y + 6)

        const sevColor = dmg.severity === 'major' ? RED : dmg.severity === 'moderate' ? ORANGE : YELLOW
        doc.setTextColor(...sevColor)
        doc.text(dmg.severity.charAt(0).toUpperCase() + dmg.severity.slice(1), 110, y + 6)

        doc.setTextColor(...WHITE)
        doc.setFont('helvetica', 'bold')
        const amt = deductionAmounts[`${comp.zone_id}_${dmg.item}`] ?? dmg.deduction_suggestion ?? 0
        doc.text(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amt), 196, y + 6, { align: 'right' })

        y += 9
        rowAlt = !rowAlt
      })
    })

    // Total row
    doc.setFillColor(...CHARCOAL)
    doc.rect(12, y, 186, 10, 'F')
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.3)
    doc.line(12, y, 198, y)
    doc.setTextColor(...GOLD)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL DEDUCTIONS', 15, y + 7)
    doc.text(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalDeductions), 196, y + 7, { align: 'right' })
    y += 16
  }

  // Zone-by-zone detail pages
  comparisons.forEach((comp, idx) => {
    doc.addPage()
    addHeader(doc, event, reportId)
    y = 38

    const damages = comp.damage_items?.new_damage || []
    const unchanged = comp.damage_items?.unchanged || []
    const missing = comp.damage_items?.missing || []

    doc.setTextColor(...GOLD)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(comp.zone_name, 14, y)

    if (comp.severity) {
      const sevColor = comp.severity === 'major' ? RED : comp.severity === 'moderate' ? ORANGE : YELLOW
      doc.setFillColor(...(damages.length > 0 ? sevColor : GREEN))
      doc.roundedRect(156, y - 7, 42, 10, 2, 2, 'F')
      doc.setTextColor(...WHITE)
      doc.setFontSize(8)
      doc.text(damages.length > 0 ? `${damages.length} damage item${damages.length > 1 ? 's' : ''}` : 'No damage', 177, y - 1, { align: 'center' })
    }
    y += 8

    // New damage section
    if (damages.length > 0) {
      doc.setFillColor(60, 10, 10)
      doc.roundedRect(12, y, 186, 8, 2, 2, 'F')
      doc.setTextColor(...RED)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('NEW DAMAGE', 16, y + 5.5)
      y += 10

      damages.forEach(dmg => {
        y = checkPageBreak(doc, y, 22)
        doc.setFillColor(30, 30, 30)
        doc.roundedRect(12, y, 186, 20, 2, 2, 'F')

        const sevColor = dmg.severity === 'major' ? RED : dmg.severity === 'moderate' ? ORANGE : YELLOW
        doc.setFillColor(...sevColor)
        doc.roundedRect(14, y + 3, 20, 7, 1, 1, 'F')
        doc.setTextColor(...(dmg.severity === 'major' ? WHITE : CHARCOAL))
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(dmg.severity.toUpperCase(), 24, y + 7.5, { align: 'center' })

        doc.setTextColor(...WHITE)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(dmg.item, 38, y + 7)

        doc.setTextColor(...LIGHT_GRAY)
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        const desc = dmg.description.length > 80 ? dmg.description.slice(0, 77) + '...' : dmg.description
        doc.text(desc, 38, y + 13)
        doc.text(`Before: ${dmg.pre_condition} → After: ${dmg.post_condition}`, 38, y + 18)

        doc.setTextColor(...GOLD)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        const amt = deductionAmounts[`${comp.zone_id}_${dmg.item}`] ?? dmg.deduction_suggestion ?? 0
        doc.text(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amt), 196, y + 7, { align: 'right' })

        y += 23
      })
    }

    // Missing items
    if (missing.length > 0) {
      y = checkPageBreak(doc, y, 16)
      doc.setFillColor(50, 30, 5)
      doc.roundedRect(12, y, 186, 8, 2, 2, 'F')
      doc.setTextColor(...ORANGE)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('MISSING ITEMS', 16, y + 5.5)
      y += 10

      missing.forEach(item => {
        y = checkPageBreak(doc, y, 8)
        doc.setTextColor(...LIGHT_GRAY)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`• ${item}`, 16, y)
        y += 6
      })
      y += 4
    }

    // Unchanged items
    if (unchanged.length > 0) {
      y = checkPageBreak(doc, y, 16)
      doc.setFillColor(10, 35, 10)
      doc.roundedRect(12, y, 186, 8, 2, 2, 'F')
      doc.setTextColor(...GREEN)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('UNCHANGED', 16, y + 5.5)
      y += 10

      doc.setTextColor(120, 120, 120)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.text(unchanged.join(' • '), 16, y, { maxWidth: 180 })
      y += 8
    }

    addFooter(doc, idx + 2, totalPages)
  })

  // Add footers to all pages
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    addFooter(doc, i, pageCount)
  }

  return doc.output('blob')
}
