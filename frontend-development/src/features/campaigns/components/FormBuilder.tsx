/**
 * BD_MEO: Form Builder (Simplified)
 */
import { useState, useEffect } from 'react';
import { Trash2, GripVertical, Eye, Save, Send } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FormField, FormFieldType, Form } from '../../../lib/leadManagementTypes';
import { mockForms } from '../../../lib/leadManagementMockData';

interface FormBuilderProps {
  campaignId: string;
  campaignName: string;
  formId?: string; // Optional: for editing existing form
  onBack: () => void;
  onSave: (form: Partial<Form>) => void;
}

// Core fields (locked, cannot be deleted)
const CORE_FIELDS: FormField[] = [
  {
    id: 'core1',
    type: 'SHORT_TEXT',
    label: 'Nama Perusahaan / Client',
    required: true,
    isCore: true,
    placeholder: 'PT ABC Indonesia'
  },
  {
    id: 'core2',
    type: 'SHORT_TEXT',
    label: 'Nama PIC',
    required: true,
    isCore: true,
    placeholder: 'John Doe'
  },
  {
    id: 'core3',
    type: 'SHORT_TEXT',
    label: 'Email',
    required: true,
    isCore: true,
    placeholder: 'john@company.com'
  },
  {
    id: 'core4',
    type: 'SHORT_TEXT',
    label: 'Nomor Telepon / WhatsApp',
    required: true,
    isCore: true,
    placeholder: '+62 812-3456-7890'
  }
];

interface SortableFieldProps {
  field: FormField;
  selectedField: FormField | null;
  onSelectField: (field: FormField) => void;
  onDeleteField: (fieldId: string) => void;
}

function SortableField({ 
  field, 
  selectedField, 
  onSelectField,
  onDeleteField
}: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: field.id,
    disabled: field.isCore, // Core fields cannot be dragged
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelectField(field)}
      className={`bg-white rounded-lg border-2 p-4 transition-all ${
        selectedField?.id === field.id
          ? 'border-blue-500 shadow-sm'
          : 'border-gray-200 hover:border-gray-300'
      } ${field.isCore ? 'bg-blue-50/30' : ''} ${
        !field.isCore ? 'cursor-pointer' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className={`mt-1 ${
            field.isCore 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600'
          }`}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-medium text-gray-900">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {field.type}
                {field.isCore && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">CORE</span>}
              </div>
            </div>
            {!field.isCore && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteField(field.id);
                }}
                className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Field Preview */}
          <div className="text-sm text-gray-600">
            {field.placeholder && (
              <div className="italic">Placeholder: {field.placeholder}</div>
            )}
            {field.options && (
              <div className="mt-1">Options: {field.options.join(', ')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Field item component for drag overlay
function FieldItem({ field }: { field: FormField }) {
  return (
    <div className="bg-white rounded-lg border-2 border-blue-500 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="text-gray-400 mt-1">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="text-xs text-gray-500 mt-1">{field.type}</div>
        </div>
      </div>
    </div>
  );
}

export function FormBuilder({ campaignId, campaignName, formId, onBack, onSave }: FormBuilderProps) {
  const [formTitle, setFormTitle] = useState(`Form: ${campaignName}`);
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([...CORE_FIELDS]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load existing form if formId is provided
  useEffect(() => {
    if (formId) {
      const existingForm = mockForms.find(form => form.id === formId);
      if (existingForm) {
        setFormTitle(existingForm.title);
        setFormDescription(existingForm.description || '');
        setFields(existingForm.fields);
      }
    }
  }, [formId]);

  // Add new field
  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: 'New Field',
      required: false,
      placeholder: ''
    };
    
    if (type === 'DROPDOWN' || type === 'RADIO' || type === 'CHECKBOX') {
      newField.options = ['Option 1', 'Option 2'];
    }
    
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  // Update field
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  // Delete field
  const deleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        // Prevent moving into core fields area (index < 4)
        if (oldIndex < 4 || newIndex < 4) return items;
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Save form
  const handleSave = (status: 'DRAFT' | 'PUBLISHED') => {
    const form: Partial<Form> = {
      campaignId,
      title: formTitle,
      description: formDescription,
      fields,
      status,
      publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined,
      publicLink: status === 'PUBLISHED' 
        ? `https://forms.company.com/${campaignId}/${Date.now()}`
        : undefined
    };

    onSave(form);
    alert(`Form ${status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully!`);
    onBack();
  };

  const activeField = activeId ? fields.find(f => f.id === activeId) : null;

  return (
    <div className="h-screen flex flex-col bg-gray-200 rounded-lg overflow-hidden shadow-lg">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg shadow-sm">
        {/* Left side - Form info */}
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm font-medium text-gray-900">{formTitle}</div>
            {formDescription && (
              <div className="text-xs text-gray-500 mt-0.5">{formDescription}</div>
            )}
          </div>
        </div>
        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => handleSave('DRAFT')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave('PUBLISHED')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-200">
        {showPreview ? (
          // PREVIEW MODE
          <div className="h-full overflow-y-auto p-8 scrollbar-thin">
            <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="mb-2">{formTitle}</h2>
              {formDescription && (
                <p className="text-gray-600 mb-6">{formDescription}</p>
              )}

              <div className="space-y-5">
                {fields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {field.type === 'SHORT_TEXT' && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    )}

                    {field.type === 'LONG_TEXT' && (
                      <textarea
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 resize-none"
                      />
                    )}

                    {field.type === 'DROPDOWN' && (
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select an option</option>
                        {field.options?.map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {field.type === 'RADIO' && (
                      <div className="space-y-2">
                        {field.options?.map((opt, idx) => (
                          <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={field.id} className="w-4 h-4" />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === 'CHECKBOX' && (
                      <div className="space-y-2">
                        {field.options?.map((opt, idx) => (
                          <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4" />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === 'DATE' && (
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                disabled
                className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          // EDIT MODE: 2-column layout
          <div className="flex h-full">
            {/* Left: Form Canvas */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-200 scrollbar-thin">
              <div className="max-w-3xl mx-auto">
                {/* Form Title & Description */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full text-2xl font-semibold mb-3 border-none focus:outline-none focus:ring-0 p-0"
                    placeholder="Form Title"
                  />
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full text-sm text-gray-600 border-none focus:outline-none focus:ring-0 p-0 resize-none"
                    placeholder="Form description (optional)"
                    rows={2}
                  />
                </div>

                {/* Fields List */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {fields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          selectedField={selectedField}
                          onSelectField={setSelectedField}
                          onDeleteField={deleteField}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  {/* Drag Overlay */}
                  {activeField && (
                    <DragOverlay>
                      <FieldItem field={activeField} />
                    </DragOverlay>
                  )}
                </DndContext>

                {/* Add Field Buttons */}
                <div className="mt-6 bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
                  <div className="text-sm font-medium text-gray-700 mb-3">Add Field:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => addField('SHORT_TEXT')}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Short Text
                    </button>
                    <button
                      onClick={() => addField('LONG_TEXT')}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Long Text
                    </button>
                    <button
                      onClick={() => addField('DROPDOWN')}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Dropdown
                    </button>
                    <button
                      onClick={() => addField('RADIO')}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Radio
                    </button>
                    <button
                      onClick={() => addField('CHECKBOX')}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Checkbox
                    </button>
                    <button
                      onClick={() => addField('DATE')}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      + Date
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Field Settings Panel */}
            <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-6 scrollbar-thin">
              {selectedField ? (
                <div>
                  <h3 className="mb-4">Field Settings</h3>

                  {selectedField.isCore && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      This is a core field and cannot be deleted. You can edit the label and placeholder.
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Label */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Placeholder (text fields only) */}
                    {(selectedField.type === 'SHORT_TEXT' || selectedField.type === 'LONG_TEXT') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={selectedField.placeholder || ''}
                          onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Required Toggle */}
                    {!selectedField.isCore && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="required"
                          checked={selectedField.required}
                          onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor="required" className="text-sm text-gray-700">
                          Required field
                        </label>
                      </div>
                    )}

                    {/* Options (for dropdown/radio/checkbox) */}
                    {(selectedField.type === 'DROPDOWN' || selectedField.type === 'RADIO' || selectedField.type === 'CHECKBOX') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {selectedField.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(selectedField.options || [])];
                                  newOptions[idx] = e.target.value;
                                  updateField(selectedField.id, { options: newOptions });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = selectedField.options?.filter((_, i) => i !== idx);
                                  updateField(selectedField.id, { options: newOptions });
                                }}
                                className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`];
                              updateField(selectedField.id, { options: newOptions });
                            }}
                            className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <p>Select a field to edit its settings</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
