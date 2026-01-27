import api from './api';

export const authService = {
    signup: async (userData) => {
        const payload = {
            user: {
                email: userData.email,
                password: userData.password
            },
            profile: {
                first_name: userData.firstName,
                last_name: userData.lastName,
                birth_date: userData.birthDate,
                gender: userData.gender,
                height_cm: parseFloat(userData.height),
                weight_kg: parseFloat(userData.weight),
                experience_level: userData.experience,
                goal: userData.goal,
                frequency: parseInt(userData.frequency),
                equipment_ids: [],
                injury_ids: []
            }
        };

        const response = await api.post('/auth/sign-up', payload)
        return response.data
    },

    signin: async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post('/auth/sign-in', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    },
};