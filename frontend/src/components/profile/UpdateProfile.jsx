import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export default function UpdateProfile() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        height_cm: '',
        weight_kg: '',
        experience_level: '',
        goal: '',
        frequency: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                birth_date: user.birth_date || '',
                gender: user.gender || '',
                height_cm: user.height_cm || '',
                weight_kg: user.weight_kg || '',
                experience_level: user.experience_level || '',
                goal: user.goal || '',
                frequency: user.frequency || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const payload = {
            ...formData,
            height_cm: parseFloat(formData.height_cm),
            weight_kg: parseFloat(formData.weight_kg),
            frequency: parseInt(formData.frequency)
        };

        try {
            const response = await api.put('/auth/me/profile', payload);
            setUser(response.data)
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-500">Your Profile</h2>

            {message.text && (
                <div className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                        type="text"
                            name="first_name"
                            className="mt-1 w-full p-2 border rounded-md"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            placeholder="First Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            className="mt-1 w-full p-2 border rounded-md"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            placeholder="Last Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                        <input
                            type="date"
                            name="birth_date"
                            className="mt-1 w-full p-2 border rounded-md"
                            value={formData.birth_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            name="gender"
                            className="mt-1 w-full p-2 border rounded-md"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="" disabled hidden>Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                        <input
                            type="number" step="0.01"
                            name="height_cm"
                            className="mt-1 w-full p-2 border rounded-md"
                            value={formData.height_cm}
                            onChange={handleChange}
                            required
                            placeholder="Height"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input
                            type="number" step="0.01"
                            name="weight_kg"
                            className="mt-1 w-full p-2 border rounded-md"
                            value={formData.weight_kg}
                            onChange={handleChange}
                            required
                            placeholder="Weight"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                        <select
                            name="experience_level"
                            className="mt-1 w-full p-2 border rounded-md"
                            value={formData.experience_level}
                            onChange={handleChange}
                        >
                            <option value="" disabled hidden>Select Experience Level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Goal</label>
                        <select
                            name="goal"
                            className="mt-1 w-full p-2 border rounded-md"
                            value={formData.goal}
                            onChange={handleChange}
                        >
                            <option value="" disabled hidden>Select Goal</option>
                            <option value="cut">Cut</option>
                            <option value="bulk">Bulk</option>
                            <option value="maintain">Maintain</option>
                        </select>
                    </div>   
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Frequency (Days/Week)</label>
                        <input
                            type="number"
                            name="frequency"
                            className="mt-1 w-full p-2 border rounded-md"
                            value={formData.frequency}
                            onChange={handleChange}
                            min="1" max="7"
                            required
                            placeholder="Frequency"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Update Profile'}
                </button>
            </form>
        </section>
    );
}