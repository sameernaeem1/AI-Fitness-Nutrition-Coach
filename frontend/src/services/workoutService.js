import api from './api';

export const workoutService = {

    generatePlan: async () => {
        const response = await api.post('/workouts/generate');
        return response.data;
    },

    getWorkouts: async () => {
        const response = await api.get('/workouts');
        return response.data;
    },

    getWorkoutById: async (id) => {
        const response = await api.get('/workouts/${id}');
        return response.data;
    }
};