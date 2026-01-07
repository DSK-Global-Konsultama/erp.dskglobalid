import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

interface EditableListProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
  readOnly?: boolean;
  label?: string;
}

export function EditableList({
  items,
  onItemsChange,
  placeholder = 'Item description',
  readOnly = false,
  label
}: EditableListProps) {
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onItemsChange(newItems);
  };

  const handleRemove = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onItemsChange([...items, '']);
  };

  return (
    <div>
      {label && <h3 className="font-semibold text-gray-900 mb-4">{label}</h3>}
      {items.map((item, index) => (
        <div key={`editable-item-${index}-${item.slice(0, 10)}`} className="flex items-start gap-2 mb-3">
          <span className="text-gray-600 mt-2">•</span>
          <Input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder={placeholder}
            disabled={readOnly}
            className={`flex-1 ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
          />
          {!readOnly && items.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="mt-4"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      )}
    </div>
  );
}

