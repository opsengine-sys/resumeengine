import { create } from 'zustand';
import { Resume, ResumeData, SectionConfig } from '../types/resume';
import type { TypographySettings, ColorSettings } from '../types/resume';
import { createNewResume, DEFAULT_TYPOGRAPHY, DEFAULT_COLORS, DEFAULT_SECTIONS, DEFAULT_LEVEL_STYLES } from '../data/defaultData';
// DEFAULT_SECTIONS is used in resetSections
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'resumeforge_resumes';
const ACTIVE_KEY  = 'resumeforge_active';

function loadFromStorage(): Resume[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed: Resume[] = JSON.parse(data);
      // Migrate older resumes — fill in any missing new fields
      return parsed.map(r => ({
        ...r,
        typography: {
          ...DEFAULT_TYPOGRAPHY,
          ...(r.typography ?? {}),
          nameFontSize:       r.typography?.nameFontSize       ?? DEFAULT_TYPOGRAPHY.nameFontSize,
          subHeadingFontSize: r.typography?.subHeadingFontSize ?? DEFAULT_TYPOGRAPHY.subHeadingFontSize,
          nameCase:           (r.typography as TypographySettings)?.nameCase       ?? DEFAULT_TYPOGRAPHY.nameCase,
          headingCase:        (r.typography as TypographySettings)?.headingCase    ?? DEFAULT_TYPOGRAPHY.headingCase,
          subHeadingCase:     (r.typography as TypographySettings)?.subHeadingCase ?? DEFAULT_TYPOGRAPHY.subHeadingCase,
          companyStyle:       (r.typography as TypographySettings)?.companyStyle   ?? DEFAULT_TYPOGRAPHY.companyStyle,
          dateStyle:          (r.typography as TypographySettings)?.dateStyle      ?? DEFAULT_TYPOGRAPHY.dateStyle,
          institutionStyle:   (r.typography as TypographySettings)?.institutionStyle ?? DEFAULT_TYPOGRAPHY.institutionStyle,
          sectionTitleStyle:  (r.typography as TypographySettings)?.sectionTitleStyle ?? DEFAULT_TYPOGRAPHY.sectionTitleStyle,
          levelStyles: {
            ...DEFAULT_LEVEL_STYLES,
            ...(r.typography as TypographySettings)?.levelStyles,
          },
        },
        colors: { ...DEFAULT_COLORS, ...(r.colors ?? {}) },
      }));
    }
  } catch { /* ignore */ }
  return [];
}

function saveToStorage(resumes: Resume[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes)); } catch { /* ignore */ }
}

interface ResumeStore {
  resumes: Resume[];
  activeResumeId: string | null;
  activeSection: string;
  isSaving: boolean;
  showPreview: boolean;
  showTemplateModal: boolean;
  showResumeListModal: boolean;

  // Getters
  getActiveResume: () => Resume | null;

  // Resume management
  createResume:   (name?: string) => void;
  deleteResume:   (id: string) => void;
  duplicateResume:(id: string) => void;
  setActiveResume:(id: string) => void;
  renameResume:   (id: string, name: string) => void;

  // Data editing
  updateResumeData:        (data: Partial<ResumeData>) => void;
  updateTemplate:          (templateId: string) => void;
  updateSections:          (sections: SectionConfig[]) => void;
  toggleSectionVisibility: (key: string) => void;
  renameSection:           (key: string, label: string) => void;
  addCustomSection:        (label: string) => void;
  removeCustomSection:     (key: string) => void;
  resetSections:           () => void;
  updateCustomSection:     (key: string, updates: Partial<import('../types/resume').SectionConfig>) => void;
  updateTypography:        (typography: Partial<TypographySettings>) => void;
  updateColors:            (colors: Partial<ColorSettings>) => void;

  // Section copy
  duplicateSection: (key: string) => void;

  // UI state
  setActiveSection:       (section: string) => void;
  setShowPreview:         (show: boolean) => void;
  setShowTemplateModal:   (show: boolean) => void;
  setShowResumeListModal: (show: boolean) => void;
  triggerSave:            () => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => {
  const initialResumes  = loadFromStorage();
  const storedActiveId  = localStorage.getItem(ACTIVE_KEY);

  let initialResume: Resume[] = initialResumes;
  let initialActiveId: string | null = null;

  if (initialResumes.length === 0) {
    const first = createNewResume('My First Resume');
    initialResume = [first];
    initialActiveId = first.id;
    saveToStorage(initialResume);
  } else {
    initialActiveId =
      storedActiveId && initialResumes.find(r => r.id === storedActiveId)
        ? storedActiveId
        : initialResumes[0].id;
  }

  return {
    resumes:              initialResume,
    activeResumeId:       initialActiveId,
    activeSection:        'personal',
    isSaving:             false,
    showPreview:          false,
    showTemplateModal:    false,
    showResumeListModal:  false,

    getActiveResume: () => {
      const { resumes, activeResumeId } = get();
      return resumes.find(r => r.id === activeResumeId) || null;
    },

    createResume: (name = 'New Resume') => {
      const newResume = createNewResume(name);
      set(state => {
        const resumes = [...state.resumes, newResume];
        saveToStorage(resumes);
        localStorage.setItem(ACTIVE_KEY, newResume.id);
        return { resumes, activeResumeId: newResume.id, showResumeListModal: false };
      });
    },

    deleteResume: (id) => {
      set(state => {
        let resumes = state.resumes.filter(r => r.id !== id);
        let activeResumeId = state.activeResumeId;
        if (activeResumeId === id) {
          activeResumeId = resumes.length > 0 ? resumes[0].id : null;
          if (activeResumeId) localStorage.setItem(ACTIVE_KEY, activeResumeId);
        }
        if (resumes.length === 0) {
          const fresh = createNewResume('My Resume');
          resumes = [fresh];
          activeResumeId = fresh.id;
          localStorage.setItem(ACTIVE_KEY, fresh.id);
        }
        saveToStorage(resumes);
        return { resumes, activeResumeId };
      });
    },

    duplicateResume: (id) => {
      set(state => {
        const original = state.resumes.find(r => r.id === id);
        if (!original) return state;
        const copy: Resume = {
          ...JSON.parse(JSON.stringify(original)),
          id: uuidv4(),
          name: `${original.name} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const resumes = [...state.resumes, copy];
        saveToStorage(resumes);
        return { resumes };
      });
    },

    setActiveResume: (id) => {
      localStorage.setItem(ACTIVE_KEY, id);
      set({ activeResumeId: id, showResumeListModal: false });
    },

    renameResume: (id, name) => {
      set(state => {
        const resumes = state.resumes.map(r =>
          r.id === id ? { ...r, name, updatedAt: new Date().toISOString() } : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    updateResumeData: (data) => {
      set(state => {
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId
            ? { ...r, data: { ...r.data, ...data }, updatedAt: new Date().toISOString() }
            : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    updateTemplate: (templateId) => {
      set(state => {
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId
            ? { ...r, templateId, updatedAt: new Date().toISOString() }
            : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    updateSections: (sections) => {
      set(state => {
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId
            ? { ...r, sections, updatedAt: new Date().toISOString() }
            : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    toggleSectionVisibility: (key) => {
      set(state => {
        const resume = state.resumes.find(r => r.id === state.activeResumeId);
        if (!resume) return state;
        const sections = resume.sections.map(s =>
          s.key === key ? { ...s, visible: !s.visible } : s
        );
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId ? { ...r, sections, updatedAt: new Date().toISOString() } : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    renameSection: (key, label) => {
      set(state => {
        const resume = state.resumes.find(r => r.id === state.activeResumeId);
        if (!resume) return state;
        const sections = resume.sections.map(s => s.key === key ? { ...s, label } : s);
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId ? { ...r, sections, updatedAt: new Date().toISOString() } : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    addCustomSection: (label) => {
      set(state => {
        const resume = state.resumes.find(r => r.id === state.activeResumeId);
        if (!resume) return state;
        const key = `custom_${uuidv4().slice(0, 8)}`;
        const newSection: SectionConfig = {
          key, label, visible: true, icon: 'FiFileText', isCustom: true,
        };
        const sections = [...resume.sections, newSection];
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId ? { ...r, sections, updatedAt: new Date().toISOString() } : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    removeCustomSection: (key) => {
      set(state => {
        const resume = state.resumes.find(r => r.id === state.activeResumeId);
        if (!resume) return state;
        const sections = resume.sections.filter(s => s.key !== key);
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId ? { ...r, sections, updatedAt: new Date().toISOString() } : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    resetSections: () => {
      set(state => {
        const resume = state.resumes.find(r => r.id === state.activeResumeId);
        if (!resume) return state;
        // Reset to ONLY default sections — remove ALL copies, custom sections, and renamed sections
        const sections = DEFAULT_SECTIONS.map(d => ({ ...d }));
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId ? { ...r, sections, updatedAt: new Date().toISOString() } : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    updateCustomSection: (key, updates) => {
      set(state => {
        const resume = state.resumes.find(r => r.id === state.activeResumeId);
        if (!resume) return state;
        const sections = resume.sections.map(s => s.key === key ? { ...s, ...updates } : s);
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId ? { ...r, sections, updatedAt: new Date().toISOString() } : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    updateTypography: (typography) => {
      set(state => {
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId
            ? { ...r, typography: { ...r.typography, ...typography }, updatedAt: new Date().toISOString() }
            : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    updateColors: (colors) => {
      set(state => {
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId
            ? { ...r, colors: { ...(r.colors ?? DEFAULT_COLORS), ...colors }, updatedAt: new Date().toISOString() }
            : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    duplicateSection: (key) => {
      set(state => {
        const resume = state.resumes.find(r => r.id === state.activeResumeId);
        if (!resume) return state;
        const src = resume.sections.find(s => s.key === key);
        if (!src) return state;
        const newKey = `custom_${uuidv4().slice(0, 8)}`;

        // Deep clone the section config
        const srcClone: SectionConfig = JSON.parse(JSON.stringify(src));

        // For built-in sections, snapshot the resume data into customEntries
        // so the copy shows the same content
        let customEntries = srcClone.customEntries;
        let customFieldDefs = srcClone.customFieldDefs;

        if (!src.isCustom) {
          // Convert built-in section data to customEntries format
          const d = resume.data;
          const builtinDataMap: Record<string, import('../types/resume').CustomSectionEntry[]> = {
            experience: d.experience.map(exp => ({
              id: uuidv4(),
              fields: [
                { id: uuidv4(), label: 'Job Title',         type: 'text'     as const, value: exp.jobTitle },
                { id: uuidv4(), label: 'Company',           type: 'text'     as const, value: exp.company },
                { id: uuidv4(), label: 'Location',          type: 'text'     as const, value: exp.location },
                { id: uuidv4(), label: 'Start Date',        type: 'date'     as const, value: exp.startDate },
                { id: uuidv4(), label: 'End Date',          type: 'date'     as const, value: exp.currentlyWorking ? '' : exp.endDate },
                { id: uuidv4(), label: 'Currently Working', type: 'text'     as const, value: exp.currentlyWorking ? 'Yes' : 'No' },
                { id: uuidv4(), label: 'Description',       type: 'longtext' as const, value: [exp.description, ...exp.bullets.map(b => '• ' + b.text)].filter(Boolean).join('\n') },
              ],
            })),
            education: d.education.map(edu => ({
              id: uuidv4(),
              fields: [
                { id: uuidv4(), label: 'Degree',       type: 'text' as const, value: edu.degree },
                { id: uuidv4(), label: 'Field',        type: 'text' as const, value: edu.fieldOfStudy },
                { id: uuidv4(), label: 'Institution',  type: 'text' as const, value: edu.institution },
                { id: uuidv4(), label: 'Location',     type: 'text' as const, value: edu.location },
                { id: uuidv4(), label: 'Start Date',   type: 'date' as const, value: edu.startDate },
                { id: uuidv4(), label: 'End Date',     type: 'date' as const, value: edu.endDate },
                { id: uuidv4(), label: 'GPA',          type: 'text' as const, value: edu.gpa ?? '' },
              ],
            })),
            skills: d.skills.length > 0 ? [{
              id: uuidv4(),
              fields: d.skills.map(sk => ({ id: uuidv4(), label: sk.category, type: 'text' as const, value: sk.name })),
            }] : [],
            projects: d.projects.map(proj => ({
              id: uuidv4(),
              fields: [
                { id: uuidv4(), label: 'Title',        type: 'text'     as const, value: proj.title },
                { id: uuidv4(), label: 'Description',  type: 'longtext' as const, value: proj.description },
                { id: uuidv4(), label: 'Technologies', type: 'text'     as const, value: proj.technologies },
                { id: uuidv4(), label: 'URL',          type: 'text'     as const, value: proj.projectUrl },
                { id: uuidv4(), label: 'GitHub',       type: 'text'     as const, value: proj.githubUrl },
              ],
            })),
            certifications: d.certifications.map(c => ({
              id: uuidv4(),
              fields: [
                { id: uuidv4(), label: 'Name',         type: 'text' as const, value: c.name },
                { id: uuidv4(), label: 'Organization', type: 'text' as const, value: c.organization },
                { id: uuidv4(), label: 'Issue Date',   type: 'date' as const, value: c.issueDate },
                { id: uuidv4(), label: 'Expiry Date',  type: 'date' as const, value: c.expiryDate },
                { id: uuidv4(), label: 'Credential URL', type: 'text' as const, value: c.credentialUrl },
              ],
            })),
            achievements: d.achievements.map(a => ({
              id: uuidv4(),
              fields: [
                { id: uuidv4(), label: 'Title',        type: 'text'     as const, value: a.title },
                { id: uuidv4(), label: 'Organization', type: 'text'     as const, value: a.organization },
                { id: uuidv4(), label: 'Date',         type: 'date'     as const, value: a.date },
                { id: uuidv4(), label: 'Description',  type: 'longtext' as const, value: a.description },
              ],
            })),
            languages: d.languages.map(lang => ({
              id: uuidv4(),
              fields: [
                { id: uuidv4(), label: 'Language',    type: 'text' as const, value: lang.name },
                { id: uuidv4(), label: 'Proficiency', type: 'text' as const, value: lang.proficiency },
              ],
            })),
            summary: d.summary ? [{
              id: uuidv4(),
              fields: [{ id: uuidv4(), label: 'Summary', type: 'longtext' as const, value: d.summary }],
            }] : [],
          };
          customEntries = builtinDataMap[key] ?? [];
          customFieldDefs = (customEntries[0]?.fields ?? []).map(f => ({
            id: uuidv4(), label: f.label, type: f.type,
          }));
        } else {
          // Re-generate IDs for custom entries
          customEntries = (srcClone.customEntries ?? []).map(entry => ({
            ...entry,
            id: uuidv4(),
            fields: entry.fields.map(f => ({ ...f, id: uuidv4() })),
          }));
        }

        const copy: SectionConfig = {
          ...srcClone,
          key: newKey,
          label: `${src.label} (Copy)`,
          isCustom: true,
          customFieldDefs,
          customEntries,
        };

        const idx = resume.sections.findIndex(s => s.key === key);
        const sections = [
          ...resume.sections.slice(0, idx + 1),
          copy,
          ...resume.sections.slice(idx + 1),
        ];
        const resumes = state.resumes.map(r =>
          r.id === state.activeResumeId ? { ...r, sections, updatedAt: new Date().toISOString() } : r
        );
        saveToStorage(resumes);
        return { resumes };
      });
    },

    setActiveSection:       (section) => set({ activeSection: section }),
    setShowPreview:         (show)    => set({ showPreview: show }),
    setShowTemplateModal:   (show)    => set({ showTemplateModal: show }),
    setShowResumeListModal: (show)    => set({ showResumeListModal: show }),

    triggerSave: () => {
      set({ isSaving: true });
      setTimeout(() => set({ isSaving: false }), 1200);
    },
  };
});
