import PlanningFreelance from "../models/PlanningModel.js";

// Get a planning with freelancers ID
export const getPlanningByid = async (req, res) => {
  try {
    const planning = await PlanningFreelance.getPlanningByid(req.params.id);// id utliser ici est l'id du freelancer connecté et pas l'id du planning
    if (req.params.id!=planning.freelancer_id) {
      return res.status(404).json({ message: 'Planning not found' });
    }
    res.status(200).json(planning);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
//freelancer can view his planning
export const getAllPlannings = async (req, res) => {
  try{
     const freelancerId = req.user.id;
    const plannings = await PlanningFreelance.getPlanningByid(freelancerId);
    if (plannings.length === 0) {
      console.log("No planning found for the freelancer")
    }
    res.status(200).json(plannings);

  } catch (err) {
    res.status(500).json({ error: err.message });

  }}
// Create a new planning for a freelancer
export const createPlanning = async(req,res) => {
    try{
        const {day_of_week , start_time , end_time} = req.body;
        const freelancerId = req.user.id;
        if (!day_of_week || !start_time || !end_time) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const planning ={
            freelancer_id: freelancerId,
            day_of_week,
            start_time,
            end_time
        }
        const result = await PlanningFreelance.create(planning);
        res.status(201).json({ message: 'Planning created', planningId: result.insertId });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }}
  //delete a planning by ID
export const deletePlanningById = async (req, res) => {
  try {
    const result = await PlanningFreelance.deleteById(req.params.id);
    res.status(200).json({ message: 'Planning deleted', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Update a planning by ID
export const updatePlanningById = async (req, res) => {
  try{
    const { id } = req.user.id;
    const fieldsToUpdate = req.body;

    if (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const result = await PlanningFreelance.updateById(id, fieldsToUpdate);
    res.status(200).json({ message: 'Planning updated', result });
  }catch (err) {
    res.status(500).json({ error: err.message });
  }
}