import { useState } from 'react';
import { SectionConfig, CustomField, CustomSectionEntry, CustomFieldType, CustomFieldOption } from '../../types/resume';
import { v4 as uuidv4 } from 'uuid';
import {
  FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiCopy,
  FiType, FiAlignLeft, FiCalendar, FiList, FiEdit2, FiCheck,
} from 'react-icons/fi';
import { MonthPicker } from '../ui/SharedUI';

const FIELD_TYPE_META: Record<CustomFieldType, { label: string; icon: React.ReactNode; desc: string }> = {
  text:     { label: 'Short Text',  icon: <FiType size={12} />,      desc: 'Single line text' },
  longtext: { label: 'Long Text',   icon: <FiAlignLeft size={12} />, desc: 'Multi-line paragraph' },
  date:     { label: 'Date',        icon: <FiCalendar size={12} />,  desc: 'Month & year picker' },
  dropdown: { label: 'Dropdown',    icon: <FiList size={12} />,      desc: 'Select from options' },
};

/* ── Single Field Editor ── */
function FieldEditor({ field, onChange, onRemove }: {
  field: CustomField;
  onChange: (f: CustomField) => void;
  onRemove: () => void;
}) {
  const [editLabel, setEditLabel] = useState(false);
  const [labelVal, setLabelVal]   = useState(field.label);
  const [newOpt,   setNewOpt]     = useState('');

  const commitLabel = () => {
    const t = labelVal.trim();
    if (t) onChange({ ...field, label: t });
    else setLabelVal(field.label);
    setEditLabel(false);
  };

  const addOption = () => {
    if (!newOpt.trim()) return;
    const opt: CustomFieldOption = { id: uuidv4(), label: newOpt.trim() };
    onChange({ ...field, options: [...(field.options ?? []), opt] });
    setNewOpt('');
  };

  const removeOption = (id: string) =>
    onChange({ ...field, options: (field.options ?? []).filter(o => o.id !== id) });

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-gray-400 flex-shrink-0">{FIELD_TYPE_META[field.type].icon}</span>
          {editLabel ? (
            <input
              autoFocus
              value={labelVal}
              onChange={e => setLabelVal(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={e => { if (e.key === 'Enter') commitLabel(); if (e.key === 'Escape') { setLabelVal(field.label); setEditLabel(false); } }}
              className="flex-1 min-w-0 text-xs font-semibold text-gray-700 border border-emerald-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          ) : (
            <span
              className="text-xs font-semibold text-gray-700 truncate cursor-pointer hover:text-emerald-600"
              onClick={() => setEditLabel(true)}
              title="Click to rename field"
            >
              {field.label}
            </span>
          )}
          <span className="text-[10px] text-gray-400 bg-gray-200 rounded px-1.5 py-0.5 flex-shrink-0">
            {FIELD_TYPE_META[field.type].label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setEditLabel(true)} className="p-1 text-gray-300 hover:text-blue-500 transition-colors rounded" title="Rename field">
            <FiEdit2 size={11} />
          </button>
          <button onClick={onRemove} className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded" title="Remove field">
            <FiTrash2 size={11} />
          </button>
        </div>
      </div>

      {/* Value input */}
      {field.type === 'text' && (
        <input
          value={field.value}
          onChange={e => onChange({ ...field, value: e.target.value })}
          placeholder={`Enter ${field.label}…`}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
        />
      )}
      {field.type === 'longtext' && (
        <textarea
          value={field.value}
          onChange={e => onChange({ ...field, value: e.target.value })}
          placeholder={`Enter ${field.label}…`}
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white resize-none"
        />
      )}
      {field.type === 'date' && (
        <MonthPicker value={field.value} onChange={v => onChange({ ...field, value: v })} placeholder="Select month & year" />
      )}
      {field.type === 'dropdown' && (
        <div className="space-y-2">
          {/* Existing options */}
          {(field.options ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(field.options ?? []).map(opt => (
                <div key={opt.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-0.5">
                  <input
                    type="radio"
                    name={`dd-${field.id}`}
                    checked={field.value === opt.label}
                    onChange={() => onChange({ ...field, value: opt.label })}
                    className="accent-emerald-600"
                  />
                  <span className="text-xs text-gray-700">{opt.label}</span>
                  <button onClick={() => removeOption(opt.id)} className="text-gray-300 hover:text-red-500 ml-0.5">
                    <FiTrash2 size={9} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Add option */}
          <div className="flex gap-1.5">
            <input
              value={newOpt}
              onChange={e => setNewOpt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
              placeholder="Add option…"
              className="flex-1 text-xs border border-dashed border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-400 bg-white"
            />
            <button
              onClick={addOption}
              className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex-shrink-0"
            >
              <FiPlus size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Single Entry ── */
function EntryCard({ entry, onUpdate, onDelete, onDuplicate, index }: {
  entry: CustomSectionEntry;
  defs?: SectionConfig['customFieldDefs'];
  onUpdate: (e: CustomSectionEntry) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(true);

  const updateField = (fieldId: string, updated: CustomField) =>
    onUpdate({ ...entry, fields: entry.fields.map(f => f.id === fieldId ? updated : f) });

  const removeField = (fieldId: string) =>
    onUpdate({ ...entry, fields: entry.fields.filter(f => f.id !== fieldId) });

  const addField = (type: CustomFieldType) => {
    const label = FIELD_TYPE_META[type].label + ' ' + (entry.fields.length + 1);
    const newField: CustomField = { id: uuidv4(), label, type, value: '', options: type === 'dropdown' ? [] : undefined };
    onUpdate({ ...entry, fields: [...entry.fields, newField] });
  };

  const firstText = entry.fields.find(f => f.value)?.value || `Entry ${index + 1}`;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">{firstText}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); onDuplicate(); }}
            className="p-1 text-gray-300 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
            title="Duplicate entry">
            <FiCopy size={12} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            title="Delete entry">
            <FiTrash2 size={12} />
          </button>
          {expanded ? <FiChevronUp size={13} className="text-gray-400" /> : <FiChevronDown size={13} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-3 space-y-2 border-t border-gray-100">
          {entry.fields.map(field => (
            <FieldEditor
              key={field.id}
              field={field}
              onChange={updated => updateField(field.id, updated)}
              onRemove={() => removeField(field.id)}
            />
          ))}

          {/* Add field buttons */}
          <div className="pt-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Add Field</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(FIELD_TYPE_META) as CustomFieldType[]).map(type => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                >
                  {FIELD_TYPE_META[type].icon}
                  {FIELD_TYPE_META[type].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Add Field Definition (for new sections) ── */
function FieldDefRow({ def, onRemove }: {
  def: { id: string; label: string; type: CustomFieldType; options?: CustomFieldOption[] };
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
      <span className="text-gray-400">{FIELD_TYPE_META[def.type].icon}</span>
      <span className="text-xs text-gray-700 flex-1 truncate">{def.label}</span>
      <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1">{FIELD_TYPE_META[def.type].label}</span>
      <button onClick={onRemove} className="text-gray-300 hover:text-red-500 transition-colors">
        <FiTrash2 size={10} />
      </button>
    </div>
  );
}

/* ── Main Custom Section Editor ── */
interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export default function CustomSectionEditor({ section, onUpdate }: Props) {
  const [showDefBuilder, setShowDefBuilder] = useState(false);
  const [newDefLabel, setNewDefLabel]       = useState('');
  const [newDefType, setNewDefType]         = useState<CustomFieldType>('text');
  const [defAdded, setDefAdded]             = useState(false);

  const defs    = section.customFieldDefs ?? [];
  const entries = section.customEntries  ?? [];

  const addEntry = () => {
    const newEntry: CustomSectionEntry = {
      id: uuidv4(),
      fields: defs.map(d => ({
        id: uuidv4(),
        label: d.label,
        type: d.type,
        value: '',
        options: d.options ? d.options.map(o => ({ ...o })) : undefined,
      })),
    };
    // If no defs, start with a text field
    if (newEntry.fields.length === 0) {
      newEntry.fields = [{ id: uuidv4(), label: 'Text', type: 'text', value: '' }];
    }
    onUpdate({ customEntries: [...entries, newEntry] });
  };

  const updateEntry = (id: string, updated: CustomSectionEntry) =>
    onUpdate({ customEntries: entries.map(e => e.id === id ? updated : e) });

  const removeEntry = (id: string) =>
    onUpdate({ customEntries: entries.filter(e => e.id !== id) });

  const duplicateEntry = (entry: CustomSectionEntry) => {
    const copy: CustomSectionEntry = {
      id: uuidv4(),
      fields: entry.fields.map(f => ({ ...f, id: uuidv4() })),
    };
    const idx = entries.findIndex(e => e.id === entry.id);
    const updated = [...entries];
    updated.splice(idx + 1, 0, copy);
    onUpdate({ customEntries: updated });
  };

  const addFieldDef = () => {
    if (!newDefLabel.trim()) return;
    const def = { id: uuidv4(), label: newDefLabel.trim(), type: newDefType };
    onUpdate({ customFieldDefs: [...defs, def] });
    setNewDefLabel('');
    setDefAdded(true);
    setTimeout(() => setDefAdded(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Section template builder */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-bold text-blue-700">Section Template</p>
            <p className="text-[10px] text-blue-500">Define the fields each entry will have</p>
          </div>
          <button
            onClick={() => setShowDefBuilder(b => !b)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {showDefBuilder ? <FiChevronUp size={11} /> : <FiPlus size={11} />}
            {showDefBuilder ? 'Done' : 'Add Field'}
          </button>
        </div>

        {/* Existing field defs */}
        {defs.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {defs.map(d => (
              <FieldDefRow
                key={d.id}
                def={d}
                onRemove={() => onUpdate({ customFieldDefs: defs.filter(x => x.id !== d.id) })}
              />
            ))}
          </div>
        )}

        {/* Add field def form */}
        {showDefBuilder && (
          <div className="flex gap-2 mt-2">
            <input
              value={newDefLabel}
              onChange={e => setNewDefLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFieldDef(); } }}
              placeholder="Field label…"
              className="flex-1 min-w-0 text-xs border border-blue-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
            <div className="relative flex-shrink-0">
              <select
                value={newDefType}
                onChange={e => setNewDefType(e.target.value as CustomFieldType)}
                className="text-xs border border-blue-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-6 cursor-pointer"
              >
                {(Object.keys(FIELD_TYPE_META) as CustomFieldType[]).map(t => (
                  <option key={t} value={t}>{FIELD_TYPE_META[t].label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={addFieldDef}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all flex-shrink-0
                ${defAdded ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {defAdded ? <FiCheck size={11} /> : <FiPlus size={11} />}
              {defAdded ? 'Added!' : 'Add'}
            </button>
          </div>
        )}

        {defs.length === 0 && !showDefBuilder && (
          <p className="text-[11px] text-blue-400 text-center py-1">
            Click "Add Field" to define the structure for each entry
          </p>
        )}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            defs={defs}
            index={idx}
            onUpdate={updated => updateEntry(entry.id, updated)}
            onDelete={() => removeEntry(entry.id)}
            onDuplicate={() => duplicateEntry(entry)}
          />
        ))}
      </div>

      {/* Add entry button */}
      <button
        onClick={addEntry}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 border border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl hover:bg-emerald-50 transition-all"
      >
        <FiPlus size={13} />
        Add Entry to "{section.label}"
      </button>
    </div>
  );
}
