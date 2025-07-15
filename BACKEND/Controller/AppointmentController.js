import PlanningFreelance from '../models/PlanningModel.js';
import Appointment from '../models/Appointment.Model.js';

export const createAppointment = async (req, res) => {
    try {
        const client_id = req.user.id;
        const freelancer_id = req.params.freelancerId;
        const { appointment_date, start_time, end_time } = req.body;

        if (!appointment_date || !start_time || !end_time) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const dayOfWeek = new Date(appointment_date).toLocaleDateString('en-US', { weekday: 'long' });

        // check available slots for the freelancer on the requested day
        const planning = await PlanningFreelance.getPlanningByDay(freelancer_id, dayOfWeek);

        if (!planning || planning.length === 0) {
            return res.status(400).json({ message: 'Freelancer is not available on this day' });
        }

        // Check if requested time fits within any available slot
        const isWithinAvailability = planning.some(slot =>
            start_time >= slot.start_time && end_time <= slot.end_time
        );

        if (!isWithinAvailability) {
            return res.status(400).json({ message: 'Appointment time must respect freelancer availability' });
        }

        // Get existing appointments for that freelancer on that date
        const existingAppointments = await Appointment.getByFreelancerAndDate(freelancer_id, appointment_date);

        // Check for overlapping appointments
        const hasOverlap = existingAppointments.some(app =>
            (start_time < app.end_time) && (app.start_time < end_time)
        );

        if (hasOverlap) {
            return res.status(400).json({ message: 'Appointment time overlaps with an existing appointment' });
        }

        // Create the appointment
        const appointment = {
            freelancer_id,
            client_id,
            appointment_date,
            start_time,
            end_time,
        };

        const result = await Appointment.create(appointment);
        res.status(201).json({ message: 'Appointment created', appointmentId: result.insertId });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
