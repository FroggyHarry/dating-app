import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './EditableList.css';

interface EditableItem {
  id: number;
  key: string;
  label: string;
  emoji: string;
  is_active: boolean;
}

interface EditableListProps {
  title: string;
  items: EditableItem[];
  table: 'activities' | 'cuisines';
  onUpdate: (items: EditableItem[]) => void;
}

export function EditableList({ title, items, table, onUpdate }: EditableListProps) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('');

  const toggleActive = async (id: number, is_active: boolean) => {
    await supabase.from(table).update({ is_active }).eq('id', id);
    onUpdate(items.map((i) => (i.id === id ? { ...i, is_active } : i)));
  };

  const handleAdd = async () => {
    if (!newLabel.trim() || !newEmoji.trim()) return;
    const key = newLabel.trim().toLowerCase().replace(/\s+/g, '_');
    const { data } = await supabase
      .from(table)
      .insert({ key, label: newLabel.trim(), emoji: newEmoji.trim(), is_active: true })
      .select()
      .single();
    if (data) {
      onUpdate([...items, data]);
      setNewLabel('');
      setNewEmoji('');
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    await supabase.from(table).delete().eq('id', id);
    onUpdate(items.filter((i) => i.id !== id));
  };

  return (
    <div className="editable-list">
      <h3>{title}</h3>
      <p className="admin-hint">开关显示/隐藏，删除或新增项目</p>

      <div className="editable-items">
        {items.map((item) => (
          <div key={item.id} className={`editable-row${!item.is_active ? ' inactive' : ''}`}>
            <span className="editable-emoji">{item.emoji}</span>
            <span className="editable-label">{item.label}</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={item.is_active}
                onChange={(e) => toggleActive(item.id, e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
            <button
              className="editable-delete"
              onClick={() => handleDelete(item.id)}
              title="删除"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="editable-add-form">
          <input
            placeholder="名称"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <input
            placeholder="emoji"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
          />
          <button className="btn-primary" onClick={handleAdd}>添加</button>
          <button className="btn-secondary" onClick={() => setAdding(false)}>取消</button>
        </div>
      ) : (
        <button className="editable-add-btn" onClick={() => setAdding(true)}>
          + 新增
        </button>
      )}
    </div>
  );
}
