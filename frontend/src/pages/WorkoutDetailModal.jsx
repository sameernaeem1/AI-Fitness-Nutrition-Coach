import { useState, useEffect } from 'react';
import { workoutService } from '../services/workoutService';

export default function WorkoutDetailModal({ workout, onClose, onUpdate }) {
    if (!workout) return null;

    const [localWorkout, setLocalWorkout] = useState(workout);
    const [loadingIdx, setLoadingIdx] = useState(null);

    useEffect(() => {
        setLocalWorkout(workout);
    }, [workout]);

    const exercises = localWorkout.exercise_list?.exercises || localWorkout.exercises || [];

    const handleSwap = async (index) => {
        console.log("Swapping exercise at index:", index, "for workout ID:", localWorkout.id);
        if (!localWorkout?.id) return;
        setLoadingIdx(index);
        try {
            const updated = await workoutService.swapExercise(localWorkout.id, index);
            console.log('swap response', updated);
            setLocalWorkout(updated);
            if (onUpdate) onUpdate(updated);
        } catch (err) {
            console.error('Swap failed', err);
        } finally {
            setLoadingIdx(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Workout Plan for {new Date(localWorkout.date).toLocaleDateString()}
                    </h2>
                    <button onClick={onClose} className="bg-red-600 text-white hover:text-black text-lg rounded-none">&times;</button>
                </div>

                <div className="space-y-4">
                    {exercises.map((ex, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between font-bold text-lg text-blue-600">
                                <span>{ex.name}</span>
                                <span>{ex.sets} x {ex.reps}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                <span className="font-semibold">Rest:</span> {ex.suggested_rest_period} |
                                <span className="font-semibold ml-2">Suggested Weight:</span> {ex.suggested_weight}
                            </div>
                            {ex.notes && (
                                <p className="text-sm italic text-gray-500 mt-2 bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                                    {ex.notes}
                                </p>
                            )}
                            <div>
                                <button
                                    onClick={() => handleSwap(index)}
                                    disabled={loadingIdx === index}
                                    className="mt-2 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs rounded-md hover:bg-amber-100 transition-colors"
                                >
                                    {loadingIdx === index ? 'Swapping...' : 'Swap'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}