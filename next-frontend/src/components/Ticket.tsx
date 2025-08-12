import { Ticket } from "@/lib/types/types";
import QRCode from 'qrcode'

// Ticket.tsx
export async function TicketTsx({ ticket }: { ticket: Ticket }) {
    const qrDataURL = await QRCode.toDataURL(ticket.ticket_id)
    return (
        <div
            id="ticket-preview"
            className="w-[1359px] h-[539px] bg-white flex"
        >
            {/* Left Blue Bar */}
            <div className="w-[50px] bg-[#2E3A87] flex items-center justify-center rotate-180">
                <span className="text-white text-xs">Event Ticket</span>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 text-xs text-black">
                <h1 className="font-bold text-sm">Ustad Amjad Ali Khan</h1>
                <p>Pandit Sajan Misra</p>
                <p>The Anirudh Varma Collective</p>

                <div className="mt-2 font-bold">
                    11 OCT 2025 | 4 PM ONWARDS
                </div>
                <div>At Bharat Mandapam, New Delhi</div>

                <div className="mt-2">Name: {ticket.name}</div>
                <div>Email: {ticket.email}</div>
                <div>Phone: {ticket.phone}</div>
            </div>

            {/* QR Section */}
            <div className="w-[70px] bg-[#E5B14C] flex flex-col items-center justify-center">
                <img src={qrDataURL} alt="QR" className="w-10 h-10" />
                <span className="text-[8px] mt-1">RAGA-NIV001</span>
            </div>
        </div>
    );
}
