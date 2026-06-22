import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FileText, MoreVertical, Search, Filter, Mail } from 'lucide-react';
import { useToast, ToastContainer } from '../components/Toast';
import api from '../services/api';

const initialData = {
  columns: {
    'new': { id: 'new', title: 'New Applied', candidateIds: [] },
    'shortlisted': { id: 'shortlisted', title: 'Shortlisted', candidateIds: [] },
    'interviewing': { id: 'interviewing', title: 'Interviewing', candidateIds: [] },
    'selected': { id: 'selected', title: 'Selected', candidateIds: [] },
    'hired': { id: 'hired', title: 'Hired', candidateIds: [] },
    'rejected': { id: 'rejected', title: 'Rejected', candidateIds: [] },
  },
  candidates: {},
  columnOrder: ['new', 'shortlisted', 'interviewing', 'selected', 'hired', 'rejected'],
};

const CandidatePipeline = () => {
  const [data, setData] = useState(initialData);
  const [isMounted, setIsMounted] = useState(false);
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, candidate: null });
  const [interviewData, setInterviewData] = useState({ date: '', time: '', mode: 'Virtual', meetingLink: '' });
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    
    const fetchPipelineData = async () => {
      let pipelineJobs = [];
      try {
        const res = await api.get('/jobs?myJobs=true');
        if (res.data.success && res.data.data.length > 0) {
          pipelineJobs = res.data.data;
        }
      } catch (err) {
        console.error('Failed to fetch jobs from API', err);
      }

      let hasApps = false;
      const freshCandidates = {};
      const freshColumns = {
        'new': { id: 'new', title: 'New Applied', candidateIds: [] },
        'shortlisted': { id: 'shortlisted', title: 'Shortlisted', candidateIds: [] },
        'interviewing': { id: 'interviewing', title: 'Interviewing', candidateIds: [] },
        'selected': { id: 'selected', title: 'Selected', candidateIds: [] },
        'hired': { id: 'hired', title: 'Hired', candidateIds: [] },
        'rejected': { id: 'rejected', title: 'Rejected', candidateIds: [] },
      };

      pipelineJobs.forEach(job => {
        if (job.applicants && job.applicants.length > 0) {
          hasApps = true;
          job.applicants.forEach(app => {
             const cId = String(app._id || Math.random());
             freshCandidates[cId] = {
               id: cId,
               applicationId: app._id,
               userId: app.userId?._id,
               jobId: job._id,
               name: app.userId?.name || 'Applicant',
               role: job.title,
               score: app.userId?.assessmentScore || app.matchScore || 0,
               hasReferral: !!(app.referralCode && app.referralCode !== 'None'),
               date: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Just now',
               email: app.userId?.email || 'applicant@example.com'
             };
             const statusMap = {
               'Applied': 'new', 'New': 'new', 'Shortlisted': 'shortlisted', 'Interviewing': 'interviewing', 'Selected': 'selected', 'Hired': 'hired', 'Rejected': 'rejected'
             };
             const col = statusMap[app.status] || 'new';
             if(freshColumns[col]) {
               freshColumns[col].candidateIds.push(cId);
             } else {
               freshColumns['new'].candidateIds.push(cId);
             }
          });
        }
      });

      // Always set data so we clear out initial mock data if there are no applicants
      setData({
        columns: freshColumns,
        candidates: freshCandidates,
        columnOrder: ['new', 'shortlisted', 'interviewing', 'selected', 'hired', 'rejected']
      });
    };

    fetchPipelineData();
  }, []);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newCandidateIds = Array.from(start.candidateIds);
      newCandidateIds.splice(source.index, 1);
      newCandidateIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...start, candidateIds: newCandidateIds };
      setData({ ...data, columns: { ...data.columns, [newColumn.id]: newColumn } });
      return;
    }

    const startCandidateIds = Array.from(start.candidateIds);
    startCandidateIds.splice(source.index, 1);
    const newStart = { ...start, candidateIds: startCandidateIds };

    const finishCandidateIds = Array.from(finish.candidateIds);
    finishCandidateIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, candidateIds: finishCandidateIds };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });

    const candidate = data.candidates[draggableId];
    if (destination.droppableId === 'interviewing') {
      setScheduleModal({ isOpen: true, candidate });
      // We do not call API here, we will call it on modal submit
    } else {
      // Fire the actual API update here (fire and forget)
      api.put('/applications/status', {
        applicationId: draggableId,
        status: finish.id
      }).catch(e => console.error('Failed to update status', e));
      
      if (candidate) {
        if (destination.droppableId === 'selected' || destination.droppableId === 'hired') {
          addToast(`📧 Offer letter template dispatched to ${candidate.name}`, 'success');
        } else if (destination.droppableId === 'rejected') {
          addToast(`📧 Courteous rejection email sent to ${candidate.name}`, 'default');
        }
      }
    }
  };

  const handleScheduleSubmit = async () => {
    try {
      // Update the application status and create the interview
      await api.post(`/applications/${scheduleModal.candidate.applicationId}/schedule`, {
        dateTime: `${interviewData.date}T${interviewData.time}`,
        format: interviewData.mode,
        link: interviewData.meetingLink
      });
      
      // Also create interview record if interaction API is active
      await api.post('/interviews/create', {
        candidateId: scheduleModal.candidate.userId,
        jobId: scheduleModal.candidate.jobId,
        date: interviewData.date,
        time: interviewData.time,
        mode: interviewData.mode,
        meetingLink: interviewData.meetingLink
      }).catch(() => {}); // ignore error if route isn't available

      addToast(`📧 Interview scheduled and invitation sent to ${scheduleModal.candidate.name}`, 'success');
      setScheduleModal({ isOpen: false, candidate: null });
      setInterviewData({ date: '', time: '', mode: 'Virtual', meetingLink: '' });
    } catch (e) {
      addToast('Failed to schedule interview. Ensure all details are filled.', 'error');
    }
  };

  return (
    <div className="flex bg-[#0B1120] text-slate-300 min-h-screen h-[calc(100vh-80px)] overflow-hidden font-sans">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* ATS Header */}
        <header className="p-6 border-b border-slate-800 bg-[#1E293B]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 shadow-xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-black text-white">ATS Pipeline</h1>
            <p className="text-sm text-slate-400 font-bold mt-1">Manage your active job requisitions and candidate flow</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                className="w-full pl-9 pr-4 py-2 bg-[#0B1120] border border-slate-700 rounded-xl text-sm text-white focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] focus:outline-none transition-all shadow-sm"
              />
            </div>
            <button className="px-4 py-2 bg-[#1E293B] border border-slate-700 text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 shadow-sm">
              <Filter size={16} /> Filter
            </button>
          </div>
        </header>

        {/* Kanban Board Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar z-10 relative">
          {isMounted && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-6 h-full items-start">
                {data.columnOrder.map((columnId) => {
                  const column = data.columns[columnId];
                  const candidates = column.candidateIds.map(id => data.candidates[id]).filter(Boolean);

                  return (
                    <div key={column.id} className="flex flex-col w-80 flex-shrink-0 h-full max-h-full">
                      {/* Column Header */}
                      <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          {column.title}
                          <span className="bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE] text-[10px] px-2 py-0.5 rounded-md font-bold">
                            {candidates.length}
                          </span>
                        </h3>
                        <button className="text-slate-500 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                      </div>

                      {/* Droppable Area */}
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 overflow-y-auto custom-scrollbar p-2 rounded-2xl transition-colors min-h-[200px] ${
                              snapshot.isDraggingOver 
                                ? 'bg-[#1E293B] border-2 border-dashed border-[#22D3EE]/50 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]' 
                                : 'bg-[#1E293B]/40 border border-slate-800'
                            }`}
                          >
                            {candidates.map((candidate, index) => (
                              <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-[#0B1120] border border-slate-700 shadow-lg rounded-xl p-4 mb-3 cursor-grab active:cursor-grabbing transition-all ${
                                      snapshot.isDragging ? 'ring-2 ring-[#22D3EE] scale-105 rotate-2 shadow-[0_0_20px_rgba(34,211,238,0.2)] z-50' : 'hover:border-slate-600 hover:shadow-xl'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-slate-700 flex items-center justify-center font-black text-[#22D3EE] text-lg">
                                          {candidate.name.charAt(0)}
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-black text-white leading-tight">{candidate.name}</h4>
                                          <p className="text-[10px] text-[#FBBF24] font-bold uppercase tracking-wider">{candidate.role || 'Candidate'}</p>
                                          <p className="text-[10px] text-slate-500 font-medium">{candidate.date}</p>
                                        </div>
                                      </div>
                                      <button className="text-slate-500 hover:text-[#22D3EE] p-1 transition-colors"><MoreVertical size={14} /></button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-4 border-t border-slate-800 pt-3">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${
                                          candidate.score >= 90 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                          candidate.score >= 80 ? 'bg-[#FBBF24]/10 border-[#FBBF24]/20 text-[#FBBF24]' :
                                          'bg-[#1E293B] border-slate-700 text-slate-400'
                                        }`}>
                                          {candidate.score}% Match
                                        </span>
                                        {candidate.hasReferral && (
                                          <span className="text-[10px] font-bold px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-md">
                                            Referral
                                          </span>
                                        )}
                                      </div>
                                      <button 
                                        onClick={() => candidate.userId && window.open(`/candidates/${candidate.userId}`, '_blank')}
                                        className="p-1.5 bg-[#1E293B] border border-slate-700 hover:bg-[#22D3EE]/10 hover:text-[#22D3EE] hover:border-[#22D3EE]/30 text-slate-400 rounded-lg transition-colors" 
                                        title="View Profile"
                                      >
                                        <FileText size={14} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </div>

        {/* Schedule Interview Modal */}
        {scheduleModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-2">Schedule Interview</h3>
              <p className="text-slate-400 text-sm mb-6">Set up an interview with <strong className="text-white">{scheduleModal.candidate?.name}</strong>.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" 
                      value={interviewData.date}
                      onChange={(e) => setInterviewData({...interviewData, date: e.target.value})}
                      className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22D3EE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Time</label>
                    <input 
                      type="time" 
                      value={interviewData.time}
                      onChange={(e) => setInterviewData({...interviewData, time: e.target.value})}
                      className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22D3EE]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Format</label>
                  <select 
                    value={interviewData.mode}
                    onChange={(e) => setInterviewData({...interviewData, mode: e.target.value})}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22D3EE]"
                  >
                    <option value="Virtual">Virtual (Video Call)</option>
                    <option value="In-Person">In-Person (Office)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Meeting Link / Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Zoom link or Office address"
                    value={interviewData.meetingLink}
                    onChange={(e) => setInterviewData({...interviewData, meetingLink: e.target.value})}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-slate-800">
                <button 
                  onClick={() => setScheduleModal({ isOpen: false, candidate: null })}
                  className="flex-1 py-3 rounded-xl text-slate-400 bg-[#0B1120] hover:text-white hover:bg-slate-800 font-bold transition-all border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleScheduleSubmit}
                  className="flex-1 py-3 rounded-xl text-[#0B1120] bg-[#22D3EE] hover:bg-[#22D3EE]/90 font-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                  Schedule Invite
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CandidatePipeline;
