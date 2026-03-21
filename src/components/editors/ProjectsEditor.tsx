import { useState } from 'react';
import { Project } from '../../types/resume';
import { FiPlus, FiTrash2, FiCode, FiChevronDown, FiChevronUp, FiLink, FiGithub } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { FormField, StyledInput, StyledTextarea, LinkDisplay } from '../ui/SharedUI';

interface Props {
  projects: Project[];
  onChange: (data: Project[]) => void;
}

function ProjectItem({ project, onUpdate, onDelete }: {
  project: Project; onUpdate: (d: Project) => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const up = (field: keyof Project, value: string) => onUpdate({ ...project, [field]: value });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiCode size={14} className="text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{project.title || 'Project Title'}</p>
          <p className="text-xs text-gray-500 truncate">{project.technologies || 'Technologies'}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          >
            <FiTrash2 size={13} />
          </button>
          {expanded ? <FiChevronUp size={15} className="text-gray-400" /> : <FiChevronDown size={15} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3.5 border-t border-gray-100">
          <FormField label="Project Title" required>
            <StyledInput value={project.title} onChange={v => up('title', v)} placeholder="My Awesome Project" />
          </FormField>

          <FormField label="Description">
            <StyledTextarea
              value={project.description}
              onChange={v => up('description', v)}
              placeholder="Describe the project, its purpose, and your contributions…"
              rows={3}
            />
          </FormField>

          <FormField label="Technologies / Tools">
            <StyledInput
              value={project.technologies}
              onChange={v => up('technologies', v)}
              placeholder="React, Node.js, PostgreSQL, Docker"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Project URL">
              <StyledInput value={project.projectUrl} onChange={v => up('projectUrl', v)} placeholder="myproject.com" icon={<FiLink size={13} />} />
              <LinkDisplay url={project.projectUrl} />
            </FormField>
            <FormField label="GitHub URL">
              <StyledInput value={project.githubUrl} onChange={v => up('githubUrl', v)} placeholder="github.com/user/repo" icon={<FiGithub size={13} />} />
              <LinkDisplay url={project.githubUrl} />
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsEditor({ projects, onChange }: Props) {
  const addProject = () => onChange([...projects, {
    id: uuidv4(), title: '', description: '', technologies: '', projectUrl: '', githubUrl: '',
  }]);

  return (
    <div className="space-y-3">
      {projects.map(p => (
        <ProjectItem
          key={p.id}
          project={p}
          onUpdate={updated => onChange(projects.map(pr => pr.id === p.id ? updated : pr))}
          onDelete={() => onChange(projects.filter(pr => pr.id !== p.id))}
        />
      ))}
      <button
        onClick={addProject}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-gray-400
          hover:border-violet-300 hover:text-violet-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <FiPlus size={16} /> Add Project
      </button>
    </div>
  );
}
