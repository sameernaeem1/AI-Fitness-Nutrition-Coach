import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export default function SelectEquipment() {
    const { user, setUser } = useAuth();
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isOnboarding = searchParams.get('onboarding') === 'true';
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if(user?.equipment) {
            setSelectedIds(user.equipment.map(i => i.id));
        }
    }, [user]);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const res = await api.get('/auth/equipment');
                setEquipmentList(res.data.filter(e => e.name.toLowerCase() !== 'bodyweight'));
            } catch (err) {
                console.error("Failed to fetch options", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, []);

    const handleUpdate = async () => {
        setMessage({ type: '', text: '' });
        try {
            const res = await api.put('/auth/me/equipment', { equipment_ids: selectedIds });
            if (setUser) setUser(res.data);
            
            if (isOnboarding) {
                navigate('/profile/injuries?onboarding=true');
            } else {
                setMessage({ type: 'success', text: 'Equipment updated successfully!' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update equipment' });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading options...</div>;

    return (
        <div className={isOnboarding ? "min-h-screen bg-gray-50 flex items-center justify-center p-4" : ""}>
            <div className={`w-full ${isOnboarding ? 'max-w-2xl' : 'max-w-4xl'}`}>
                
                {isOnboarding && (
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Step 1: Your Equipment</h1>
                        <p className="text-gray-600">Tell us what equipment you have so we can tailor your plan.</p>
                    </div>
                )}

                {message.text && (
                    <div className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-2 border-b pb-2 text-gray-500">Available Equipment</h2>
                    <p className="text-sm text-gray-500 mb-4">Select the equipment you have access to.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {equipmentList.map(eq => (
                            <label 
                                key={eq.id} 
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                    selectedIds.includes(eq.id) 
                                    ? 'bg-green-100 border-green-500 shadow-sm' 
                                    : 'bg-white hover:bg-gray-50 border-gray-200'
                                }`}
                            >
                                <input 
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedIds.includes(eq.id)}
                                    onChange={() => {
                                        const next = selectedIds.includes(eq.id) 
                                            ? selectedIds.filter(id => id !== eq.id)
                                            : [...selectedIds, eq.id];
                                        setSelectedIds(next);
                                    }}
                                />
                                <span className={`text-sm font-medium ${selectedIds.includes(eq.id) ? 'text-green-800' : 'text-gray-600'}`}>
                                    {eq.name}
                                </span>
                            </label>
                        ))}
                    </div>

                    <button 
                        onClick={handleUpdate}
                        className="mt-8 w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
                    >
                        {isOnboarding ? "Next" : "Save"}
                    </button>
                </section>
            </div>
        </div>
    );
}