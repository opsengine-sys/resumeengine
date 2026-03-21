import { useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { FiX, FiPlus, FiTrash2, FiCopy, FiCheck, FiFileText, FiEdit2 } from 'react-icons/fi';
import { TEMPLATES } from '../data/defaultData';

export default function ResumeListModal() {
  const {
    resumes, showResumeListModal, setShowResumeListModal,
    activeResumeId, setActiveResume, createResume, deleteResume, duplicateResume, renameResume
  } = useResumeStore();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!showResumeListModal) return null;

  const handleCreate = () => {
    const name = newName.trim() || 'New Resume';
    createResume(name);
    setNewName('');
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      renameResume(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">My Resumes</h2>
            <p className="text-sm text-gray-500">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowResumeListModal(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Create New */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Resume name (e.g., Software Engineer - Google)"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <FiPlus size={15} /> New Resume
            </button>
          </div>
        </div>

        {/* Resume List */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
          {resumes.map(resume => {
            const template = TEMPLATES.find(t => t.id === resume.templateId) || TEMPLATES[0];
            const isActive = resume.id === activeResumeId;
            const isEditing = editingId === resume.id;
            const updatedDate = new Date(resume.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div key={resume.id}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer group ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}
                onClick={() => !isEditing && setActiveResume(resume.id)}
              >
                <div style={{ backgroundColor: template.primaryColor }} className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiFileText className="text-white" size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                      onBlur={saveEdit}
                      autoFocus
                      onClick={e => e.stopPropagation()}
                      className="w-full text-sm font-semibold text-gray-900 bg-white border border-blue-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 truncate">{resume.name}</p>
                  )}
                  <p className="text-xs text-gray-400">{template.name} Template · Updated {updatedDate}</p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button onClick={() => startEdit(resume.id, resume.name)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-blue-600 transition-colors">
                    <FiEdit2 size={13} />
                  </button>
                  <button onClick={() => duplicateResume(resume.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-green-600 transition-colors">
                    <FiCopy size={13} />
                  </button>
                  {resumes.length > 1 && (
                    <button onClick={() => deleteResume(resume.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                      <FiTrash2 size={13} />
                    </button>
                  )}
                </div>

                {isActive && (
                  <div className="ml-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck size={10} className="text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
