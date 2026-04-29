import React from 'react';
import './TabNavigation.css';

export const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'issue', label: '⬡ Issue' },
    { id: 'verify', label: '◎ Verify' },
    { id: 'explorer', label: '⛓ Explorer' }
  ];

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
