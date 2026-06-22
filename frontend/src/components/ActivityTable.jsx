import React from 'react';

const ActivityTable = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/40 border border-slate-850 rounded-2xl mt-6">
        No recent activity logged.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-850 rounded-2xl mt-6 shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-850">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">System Activity Logs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-850">
            <tr>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Entity</th>
              <th className="px-5 py-3 font-medium">Details</th>
              <th className="px-5 py-3 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/50">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-300">
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs">{log.action}</span>
                </td>
                <td className="px-5 py-3">{log.entityType}</td>
                <td className="px-5 py-3">{log.details}</td>
                <td className="px-5 py-3 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
