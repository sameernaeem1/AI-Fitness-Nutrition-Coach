import { useState } from 'react';
import { workoutService } from '../../services/workoutService';

export default function WorkoutPlan({ setActiveTab }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setShowConfirm(false);
        try {
            await workoutService.generatePlan();
            setActiveTab('calendar');
        } catch (err) {
            setError(err.response?.data.detail || 'Failed to generate plan');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Your Personal AI Trainer</h1>
                <p className="text-gray-600 mb-8">
                    Need a new workout routine? Our AI will analyse your profile, available equipment and injury history
                    to build a custom 4-week plan tailored to your goals.
                </p>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {error}
                    </div>
                )}

                {!showConfirm ? (
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Generate New Plan'}
                    </button>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                        <h3 className="text-yellow-800 font-bold mb-2">Are you sure?</h3>
                        <p className="text-yellow-700 mb-4">
                            Generating a new plan will overwrite any existing workouts scheduled for the next 28 days.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleGenerate}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="mt-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-blue-600 font-medium italic">
                            Generating Custom Plan...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}