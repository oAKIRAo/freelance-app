import PlanningFreelance from "../models/PlanningModel.js";
import Appointment from "../models/Appointment.Model.js"// Assuming this is a utility function you created
import { calculateFreeSlots } from "../utils/calculateFreeSlots.js"; // Assuming this is a utility function you created
export const getAvailableSlots = async (req, res) =>{
    const freelancerId = req.params.freelancerId;
    const dateRange = req.query.dateRange; 
    if (!dateRange) {
        return res.status(400).json({ message: 'Date range is required' });
    }
    const[startDate, endDate] = dateRange.split(',');

    const availabilities = await PlanningFreelance.getPlanningByid(freelancerId);// pour voir la disponibilité du freelance
    if (!availabilities || availabilities.length === 0) {
        return res.status(404).json({ message: 'No availability found for this freelancer' });
    }

    const appointments = await Appointment.getAppointments(freelancerId, { startDate, endDate });// pour voir les rendez-vous du freelance dans la plage de dates donnée
    const slots = calculateFreeSlots(availabilities, appointments, { startDate, endDate });
    return res.json(slots);
}
