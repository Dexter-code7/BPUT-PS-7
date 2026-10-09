import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users } from 'lucide-react';

export default function PersonaBar() {
  const { user, demoAccounts, switchPersona } = useAuth();

  if (!demoAccounts || demoAccounts.length === 0) return null;

  return (
    <div className="persona-switcher-bar">
      <div className="persona-label">
        <Users size={13} />
        <span>Switch Persona:</span>
      </div>

      <div className="persona-chips">
        {demoAccounts.map((acc) => {
          const isActive = user?.id === acc.id;
          return (
            <button
              key={acc.id}
              onClick={() => switchPersona(acc.id)}
              className={`persona-chip ${isActive ? 'active' : ''}`}
              title={`Switch to ${acc.full_name} (${acc.role_label})`}
            >
              <span>{acc.full_name}</span>
              <span style={{ opacity: 0.8, marginLeft: '4px', fontSize: '10px' }}>
                [{acc.role_label}{acc.active_tags ? ` • ${acc.active_tags}` : ''}]
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
