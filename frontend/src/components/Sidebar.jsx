import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ activeTab, setActiveTab }) {
    const { logout } = useAuth();

    const tabs = [
        { id: 'plan', label: 'Generate Plan', icon: '' },
        { id: 'calendar', label: 'Calendar', icon: '' },
    ];

    return (
        <div className = "bg-gray-900 text-white w-64 min-h-screen p-6">
            <h2 className="text-2xl font-bold mb-8">Fitness Coach</h2>

            <nav className="space-y-4 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition ${
                            activeTab === tab.id
                                ? 'bg-blue-500'
                                : 'hover:bg-gray-800'
                        }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </nav>

            <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition mt-auto"
            >
                Logout
            </button>
        </div>
    );
}