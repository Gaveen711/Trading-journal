import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import MT5SyncSetup from './MT5SyncSetup';
import BrokerLoginSync from './BrokerLoginSync';

export default function EASetup() {
  const context = useOutletContext();
  const [activeTab, setActiveTab] = useState('sync-methods');

  return (
    <div className="space-y-8">
      {/* Main sync setup with all methods */}
      <MT5SyncSetup />

      {/* Broker login sync section */}
      <div className="mt-12 pt-12 border-t border-border/40">
        <BrokerLoginSync />
      </div>
    </div>
  );
}

