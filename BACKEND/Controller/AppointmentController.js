import PlanningFreelance from '../models/PlanningModel.js';
import Appointment from '../models/Appointment.Model.js';
import User from '../models/UserModel.js';

// Utility to convert "HH:mm" to minutes
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export const createAppointment = async (req, res) => {
    try {
        const client_id = req.user.id;
        const freelancer_id = req.params.freelancerId;
        const { appointment_date, start_time, end_time } = req.body;

        if (!appointment_date || !start_time || !end_time) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const dayOfWeek = new Date(appointment_date).toLocaleDateString('en-US', { weekday: 'long' });
        const planning = await PlanningFreelance.getPlanningByDay(freelancer_id, dayOfWeek);

        if (!planning || planning.length === 0) {
            return res.status(400).json({ message: 'Freelancer is not available on this day' });
        }

        const requestedStart = timeToMinutes(start_time);
        const requestedEnd = timeToMinutes(end_time);

        const isWithinAvailability = planning.some(slot => {
            const slotStart = timeToMinutes(slot.start_time);
            const slotEnd = timeToMinutes(slot.end_time);
            return requestedStart >= slotStart && requestedEnd <= slotEnd;
        });

        if (!isWithinAvailability) {
            return res.status(400).json({ message: 'Appointment time must respect freelancer availability' });
        }

        const existingAppointments = await Appointment.getByFreelancerAndDate(freelancer_id, appointment_date);
        const hasOverlap = existingAppointments.some(app => {
            const existingStart = timeToMinutes(app.start_time);
            const existingEnd = timeToMinutes(app.end_time);
            return requestedStart < existingEnd && existingStart < requestedEnd;
        });

        if (hasOverlap ) {
            return res.status(400).json({ message: 'Appointment time overlaps with an existing appointment' });
        }

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

export const CancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.getById(appointmentId);

        if (!appointment || appointment.status !== 'booked') {
            return res.status(400).json({ message: 'Only booked appointments can be canceled' });
        }

        const result = await Appointment.cancelById(appointmentId);
        res.status(200).json({ message: 'Appointment canceled', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const CompleteAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.getById(appointmentId);

        if (!appointment || appointment.status !== 'booked') {
            return res.status(400).json({ message: 'Only booked appointments can be completed' });
        }

        const result = await Appointment.completeById(appointmentId);
        res.status(200).json({ message: 'Appointment completed', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getAllAppointmentsByFreelancer = async (req, res) => {
    try {
        const freelancerId = req.user.id;
        if (!freelancerId) {
            return res.status(400).json({ message: 'Freelancer ID is required' });
        };
        const appointments = await Appointment.getAllByFreelancerId(freelancerId);
        const bookedAppointments = appointments.filter(app => app.status === 'booked' );
        //fetch the data of the client that has the appointment with the freelancer
        const clientPromises = bookedAppointments.map(async (appointment) => {
            const client = await User.getById(appointment.client_id);
            return {
                id: appointment.id,
                client_name: client.name,
                client_email: client.email,
                date : appointment.appointment_date,
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                status: appointment.status , 
            };
        });
        const clients = await Promise.all(clientPromises);
        res.status(200).json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getAllApointementsByClient = async (req, res) => {
    try {
         const client_id = req.user.id;
        if (!client_id) {
            return res.status(400).json({ message: 'Client ID is required' });
        }
        const appointments = await Appointment.getAllByClientId(client_id);
        const bookedAppointments = appointments.filter(app => app.status === 'booked' );

        const freelancerPromises = bookedAppointments.map(async (appointment) => {
            const freelancer = await User.getById(appointment.freelancer_id);
            return {
                id: appointment.id,
                freelancer_name: freelancer.name,
                freelancer_email: freelancer.email,
                date: appointment.appointment_date,
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                status: appointment.status,
            };
        });
        const freelancers = await Promise.all(freelancerPromises);
        res.status(200).json(freelancers);
        

    }catch(err) {
        res.status(500).json({ error: err.message });
    }};