import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
    const { logout } = useAuth();

    const tabs = [
        { id: 'plan', label: 'Generate Plan', icon: '' },
        { id: 'calendar', label: 'Calendar', icon: '' },
        { id: 'settings', label: 'Settings', icon: '' },
    ];

    return (
        <div className={`bg-gray-900 text-white min-h-screen p-4 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
            
            <div className="flex items-center justify-between mb-8">
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-gray-800 rounded-lg text-2xl"
                >
                    ☰
                </button>
                {!isCollapsed && <h2 className="text-xl font-bold whitespace-nowrap">AI Fitness Coach</h2>}
                
            </div>

            <nav className="space-y-4 flex-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
                            activeTab === tab.id ? 'bg-blue-500' : 'hover:bg-gray-800'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? tab.label : ''}
                    >
                        <span className="text-xl">{tab.icon}</span>
                        {!isCollapsed && <span className="ml-4">{tab.label}</span>}
                    </button>
                ))}
            </nav>

            <button
                onClick={logout}
                className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition mt-auto flex items-center justify-center ${isCollapsed ? 'px-2' : 'px-4'}`}
            >
                {isCollapsed ? '⏻' : 'Logout'}
            </button>
        </div>
    );
}