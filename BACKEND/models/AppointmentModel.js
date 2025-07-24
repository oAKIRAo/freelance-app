import db from '../DATABASE/Connection.js';
const Appointment = {
   //read all appointment
GetAllappointment: async () => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        appointments.*, 
        freelancer.name AS freelancer_name,
        client.name AS client_name
      FROM appointments
      JOIN users AS freelancer ON appointments.freelancer_id = freelancer.id
      JOIN users AS client ON appointments.client_id = client.id
    `);
    return rows;
  } catch (err) {
    throw err;
  }
},
  // Read a  appointment by ID
    getById: async (id) => {
        try {
            const [rows] = await db.promise().query('SELECT * FROM appointments WHERE id = ?', [id]);
            return rows[0]; // Return the appointment found
        } catch (err) {
            throw err;
        }
    },
    getAllByFreelancerId: async (freelancerId) => {
        try {
            const [rows] = await db.promise().query('SELECT * FROM appointments WHERE freelancer_id = ?', [freelancerId]);
            return rows; // Return all appointments found for the freelancer
        } catch (err) {
            throw err;
        }
    },
    getAllByClientId: async (clientId) => {
        try {
            const [rows] = await db.promise().query('SELECT * FROM appointments WHERE client_id = ?', [clientId]);
            return rows; // Return all appointments found for the client
        } catch (err) {
            throw err;
        }
    },
    // Get an appointment by date range
   getAppointments: async (freelancerId,dateRange) => {
      const { startDate, endDate } = dateRange;

    try {
        if (!startDate || !endDate) {
            throw new Error('Start date and end date are required');
        }  
        const [rows] = await db.promise().query(
             `SELECT * FROM appointments 
             WHERE freelancer_id = ? 
             AND appointment_date BETWEEN ? AND ? 
             AND status = 'booked'`,
            [freelancerId, startDate, endDate]
            );
          return rows;
       }catch (err) {
            throw err;
        }
    },
    // Create a new appointment
    create: async (appointment) => {
        try {
            const result = await db.promise().query(
                'INSERT INTO appointments (freelancer_id, client_id, appointment_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
                [appointment.freelancer_id, appointment.client_id, appointment.appointment_date, appointment.start_time, appointment.end_time]
            );
            return result; // Return the result of the insert operation
        } catch (err) {
            throw err;
        }
    },
    //Cancel an appointment by ID
    cancelById: async (id) => {
        try {
            const result = await db.promise().query('UPDATE appointments SET status = ? WHERE id = ?', ['canceled', id]);
            return result; // Return the result of the update operation
        } catch (err) {
            throw err;
        }
    },
    //Complete an appointment by ID
    completeById: async (id) => {
        try {
            const result = await db.promise().query('UPDATE appointments SET status = ? WHERE id = ?', ['completed', id]);
            return result; // Return the result of the update operation
        } catch (err) {
            throw err;
        }
    },
    // Delete an appointment by ID
    deleteById: async (id) => {
        try {
            const result = await db.promise().query('DELETE FROM appointments WHERE id = ?', [id]);
            return result; // Return the result of the delete operation
        } catch (err) {
            throw err;
        }
    },
    // Update an appointment by ID
    updateById:async (id, fieldsToUpdate) => {
        try {
        const keys = Object.keys (fieldsToUpdate);
        const values = Object.values(fieldsToUpdate);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        values.push(id);
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE appointments SET ${setClause} WHERE id = ?`,
                values,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        }); }
        catch(err) {
            throw err;
        }},
    // Get appointments by freelancer and date
      getByFreelancerAndDate :async (freelancerId, date) => {
    try {
        const [rows] = await db.promise().query(
            'SELECT * FROM appointments WHERE freelancer_id = ? AND appointment_date = ?',
            [freelancerId, date]
        );
        return rows;
    } catch (err) {
        throw err;
    }},
 // Total Appointments
     CountTotalAppointments : async () => {
    try {
        const [rows] = await db.promise().query(
            "SELECT COUNT(*) AS count FROM appointments"
        );
        return rows[0].count;
    } catch (error) {
        console.error(error);
        throw error;
    }
},

// Completed Appointments
    CountCompletedAppointments : async () => {
    try {
        const [rows] = await db.promise().query(
            "SELECT COUNT(*) AS count FROM appointments WHERE status = 'completed'"
        );
        return rows[0].count;
    } catch (error) {
        console.error(error);
        throw error;
    }
},

// Canceled Appointments
    CountCancelledAppointments : async () => {
    try {
        const [rows] = await db.promise().query(
            "SELECT COUNT(*) AS count FROM appointments WHERE status = 'canceled'"
        );
        return rows[0].count;
    } catch (error) {
        console.error(error);
        throw error;
    }
},

// In-Progress Appointments
     CountInProgressAppointments : async () => {
    try {
        const [rows] = await db.promise().query(
            "SELECT COUNT(*) AS count FROM appointments WHERE status = 'booked'"
        );
        return rows[0].count;
    } catch (error) {
        console.error(error);
        throw error;
    }
},
// count appointment by status
   CountAppointmentByStatus : async () =>{
    try{
        const [rows] = await db.promise().query(' SELECT status ,COUNT(*) as count FROM appointments GROUP BY status');
        return rows;

    }catch(error){ 
        console.error(error);
        throw error;
    }
   }

};
  


export default Appointment;