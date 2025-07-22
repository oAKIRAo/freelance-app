import Appointment from '../models/AppointmentModel.js'

export const getAppointmentsAnalytics = async (req,res) => {
    try{
      const Total = await Appointment.CountTotalAppointments();
      const TotalCancelled = await Appointment.CountCancelledAppointments();
      const Totalcompleted = await Appointment.CountCompletedAppointments();
      const TotalInprogress = await Appointment.CountInProgressAppointments();
      res.json({
        Total,
        TotalCancelled,
        Totalcompleted,
        TotalInprogress
      })
    }catch(error)
    {
        res.status(500).json({message : "Internal server error"});
    }
}