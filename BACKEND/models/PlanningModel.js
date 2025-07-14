import db from '../DATABASE/Connection.js';
const PlanningFreelance = {
    // Method to read a  planning 
    getPlanningByid: async (id) => {
        try {
            const [rows] = await db.promise().query('SELECT * FROM planning_freelance WHERE freelancer_id = ?', [id]);
            return rows;
        }
        catch (err) {
            throw err;
        }
    },
    //Method to get planning of a freelancer by day of the week
    getPlanningByDay: async (freelancerId, dayOfWeek) => {
        try {
            const [rows] = await db.promise().query(
                'SELECT * FROM planning_freelance WHERE freelancer_id = ? AND day_of_week = ?',
                [freelancerId, dayOfWeek]
            );
            return rows; // Return all planning found for the freelancer on that day
        } catch (err) {
            throw err;
        }
    },
    // Method to create a new planning
    create: async (planning) => {
         try{ 
            const result = await db.promise().query(
                'INSERT INTO planning_freelance (freelancer_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
                [planning.freelancer_id, planning.day_of_week, planning.start_time, planning.end_time]
            );  
            return result;
        } catch (err) {
            throw err;
        }   
    },
    // Method to delete a planning by ID
    deleteById: async (id) => {
        try{
            const result = await db.promise().query('DELETE FROM planning_freelance WHERE id = ?', [id]);
            return result;
        }catch (err) {
            throw err;
        }},
    // Method to update a planning by ID
    updateById: async (id, fieldsToUpdate) => {
        const keys = Object.keys(fieldsToUpdate);
        const values = Object.values(fieldsToUpdate);
    
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        values.push(id);
    
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE planning_freelance SET ${setClause} WHERE id = ?`,
                values,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    }
};
export default PlanningFreelance;