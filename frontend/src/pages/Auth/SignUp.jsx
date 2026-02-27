import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    birthDate: z.string().refine((val) => {
        const birthDate = new Date(val);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 13 && age <= 100;
    }, { message: 'Age must be between 13 and 100' }),
    gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: 'Please select gender' }) }),
    height: z.coerce.number().min(50, 'Minimum height 50cm').max(250, 'Maximum height 250cm'),
    weight: z.coerce.number().min(20, 'Minimum weight 20kg').max(500, 'Maximum weight 500kg'),
    experience: z.enum(['beginner', 'intermediate', 'advanced'], { errorMap: () => ({ message: 'Select experience level' }) }),
    goal: z.enum(['cut', 'bulk', 'maintain'], { errorMap: () => ({ message: 'Select a goal' }) }),
    frequency: z.coerce.number().int().min(1, 'Minimum 1 day').max(7, 'Maximum 7 days'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function SignUp() {
    const [serverError, setServerError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            birthDate: '',
            gender: '',
            height: '',
            weight: '',
            experience: '',
            goal: '',
            frequency: '',
        }
    });

    const onSubmit = async (data) => {
        setServerError('');
        try {
            const response = await authService.signup(data);
            await login(response.access_token);
            navigate('/profile/equipment?onboarding=true');
        } catch (err) {
            setServerError(err.response?.data?.detail || 'Sign up failed');
        }
    };

    const ErrorMsg = ({ name }) => (
        errors[name] ? <p className="text-red-500 text-xs mt-1">{errors[name].message}</p> : null
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sign up</h1>

                {serverError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Email"
                        />
                        <ErrorMsg name="email" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">Password</label>
                            <input
                                type="password"
                                {...register('password')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Password"
                            />
                            <ErrorMsg name="password" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">Confirm Password</label>
                            <input
                                type="password"
                                {...register('confirmPassword')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Confirm"
                            />
                            <ErrorMsg name="confirmPassword" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">First Name</label>
                            <input
                                type="text"
                                {...register('firstName')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="First Name"
                            />
                            <ErrorMsg name="firstName" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">Last Name</label>
                            <input
                                type="text"
                                {...register('lastName')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Last Name"
                            />
                            <ErrorMsg name="lastName" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Birth Date</label>
                        <input
                            type="date"
                            {...register('birthDate')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMsg name="birthDate" />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Gender</label>
                        <select
                            {...register('gender')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled hidden>Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <ErrorMsg name="gender" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">Height (cm)</label>
                            <input
                                type="number" step="0.01"
                                {...register('height')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Height"
                            />
                            <ErrorMsg name="height" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">Weight (kg)</label>
                            <input
                                type="number" step="0.01"
                                {...register('weight')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Weight"
                            />
                            <ErrorMsg name="weight" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Experience Level</label>
                        <select
                            {...register('experience')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled hidden>Select Experience Level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                        <ErrorMsg name="experience" />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Goal</label>
                        <select
                            {...register('goal')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled hidden>Select Goal</option>
                            <option value="cut">Cut</option>
                            <option value="bulk">Bulk</option>
                            <option value="maintain">Maintain</option>
                        </select>
                        <ErrorMsg name="goal" />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Frequency (Days/Week)</label>
                        <input
                            type="number"
                            {...register('frequency')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1-7"
                        />
                        <ErrorMsg name="frequency" />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-4">
                    Already have an account? <Link to="/signin" className="text-blue-500 hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}