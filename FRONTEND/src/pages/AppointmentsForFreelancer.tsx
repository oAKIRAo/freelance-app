import { useEffect, useState } from "react";
import axios from "axios";

export default function FreelancerAppointments() {
    interface Appointment {
        clientName: string;
        clientEmail: string;
        date: string;
        startTime: string;
        endTime: string;
    }
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        axios.get("/api/freelancer/appointments")
            .then(res => setAppointments(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2">Client Name</th>
                        <th className="p-2">Client Email</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Start</th>
                        <th className="p-2">End</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((app, index) => (
                        <tr key={index} className="border-t">
                            <td className="p-2">{app.clientName}</td>
                            <td className="p-2">{app.clientEmail}</td>
                            <td className="p-2">{app.date}</td>
                            <td className="p-2">{app.startTime}</td>
                            <td className="p-2">{app.endTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
