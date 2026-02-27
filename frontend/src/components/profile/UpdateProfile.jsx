import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const profileSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    birth_date: z.string().refine((val) => {
        const birthDate = new Date(val);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age >= 13 && age <= 100;
    }, { message: 'Age must be between 13 and 100' }),
    gender: z.enum(['male', 'female', 'other']),
    height_cm: z.coerce.number().min(50).max(250),
    weight_kg: z.coerce.number().min(20).max(500),
    experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
    goal: z.enum(['cut', 'bulk', 'maintain']),
    frequency: z.coerce.number().int().min(1).max(7),
});

export default function UpdateProfile() {
    const { user, setUser } = useAuth();
    const [message, setMessage] = useState({ type: '', text: '' });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(profileSchema),
        values: {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            birth_date: user?.birth_date || '',
            gender: user?.gender || '',
            height_cm: user?.height_cm || '',
            weight_kg: user?.weight_kg || '',
            experience_level: user?.experience_level || '',
            goal: user?.goal || '',
            frequency: user?.frequency || '',
        }
    });

    const onSubmit = async (data) => {
        setMessage({ type: '', text: '' });
        try {
            const response = await api.put('/auth/me/profile', data);
            setUser(response.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        }
    };

    const ErrorMsg = ({ name }) => (
        errors[name] ? <p className="text-red-500 text-xs mt-1">{errors[name].message}</p> : null
    );

    return (
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-500">Your Profile</h2>

            {message.text && (
                <div className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            {...register('first_name')}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="First Name"
                        />
                        <ErrorMsg name="first_name" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            {...register('last_name')}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Last Name"
                        />
                        <ErrorMsg name="last_name" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                        <input
                            type="date"
                            {...register('birth_date')}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMsg name="birth_date" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            {...register('gender')}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="" diabled hidden>Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <ErrorMsg name="gender" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                        <input
                            type="number" step="0.01"
                            {...register('height_cm')}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMsg name="height_cm" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input
                            type="number" step="0.01"
                            {...register('weight_kg')}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMsg name="weight_kg" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                        <select
                            {...register('experience_level')}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="" disabled hidden>Select Level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                        <ErrorMsg name="experience_level" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Goal</label>
                        <select
                            {...register('goal')}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="" disabled hidden>Select Goal</option>
                            <option value="cut">Cut</option>
                            <option value="bulk">Bulk</option>
                            <option value="maintain">Maintain</option>
                        </select>
                        <ErrorMsg name="goal" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Frequency (Days/Week)</label>
                        <input
                            type="number"
                            {...register('frequency')}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMsg name="frequency" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : 'Update Profile'}
                </button>
            </form>
        </section>
    );
}