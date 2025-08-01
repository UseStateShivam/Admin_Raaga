'use client'

export default function QRDownloadButton() {
  const handleDownload = async () => {
    const res = await fetch('/api/seat-assign', {
      method: 'POST',
      body: JSON.stringify({
        ticket_id: '6fd9dfd2-f530-4c8b-b1b7-b7a6deb81fc7',
        seat_number: 'A1',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `qr-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Download QR PNG
    </button>
  )
}
