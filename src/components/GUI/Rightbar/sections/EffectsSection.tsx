import React, { useState, useMemo, useEffect } from 'react';
import styles from '../../../../styles/Sidebar.module.css';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import type { ElementNode } from '../../../TreeView/TreeView';
import { ColorControl } from '../../../ColorPicker/ColorControl';

interface EffectsSectionProps {
  selectedElement: ElementNode | null;
  onStyleChange: (style: React.CSSProperties) => void;
  onColorControlClick: (
    event: React.MouseEvent,
    property: string,
    onChange?: (newColor: string) => void,
    currentValue?: string
  ) => void;
}

type EffectType =
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'grayscale'
  | 'hue-rotate'
  | 'invert'
  | 'saturate'
  | 'sepia'
  | 'drop-shadow';

const effectDefaults: Record<EffectType, string> = {
  blur: '5px',
  brightness: '100%',
  contrast: '100%',
  grayscale: '0%',
  'hue-rotate': '0deg',
  invert: '0%',
  saturate: '100%',
  sepia: '0%',
  'drop-shadow': '0px 4px 4px rgba(0,0,0,0.25)',
};

export const EffectsSection: React.FC<EffectsSectionProps> = ({
  selectedElement,
  onStyleChange,
  onColorControlClick,
}) => {
  const [activeEffects, setActiveEffects] = useState<EffectType[]>([]);
  const [effectValues, setEffectValues] = useState<Record<EffectType, string>>({ ...effectDefaults });
  const [dropShadowParts, setDropShadowParts] = useState({
    offsetX: '0px',
    offsetY: '4px',
    blur: '4px',
    color: 'rgba(0,0,0,0.25)',
  });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const filterString = selectedElement?.style?.filter;
    if (!filterString || filterString === 'none') {
        setActiveEffects([]);
        return;
    }
    const newActiveEffects: EffectType[] = [];
    const newEffectValues: Record<string, string> = {};
    const filterRegex = /(\w+-?\w+)\(([^)]+)\)/g;
    let match;
    while ((match = filterRegex.exec(filterString)) !== null) {
        const effectName = match[1] as EffectType;
        const effectValue = match[2];
        if (effectName in effectDefaults) {
            newActiveEffects.push(effectName);
            newEffectValues[effectName] = effectValue;
            if (effectName === 'drop-shadow') {
                const parts = effectValue.split(' ');
                if (parts.length >= 4) {
                    setDropShadowParts({
                        offsetX: parts[0],
                        offsetY: parts[1],
                        blur: parts[2],
                        color: parts.slice(3).join(' '),
                    });
                }
            }
        }
    }
    setActiveEffects(newActiveEffects);
    setEffectValues(prev => ({ ...prev, ...newEffectValues }));
  }, [selectedElement]);

  const availableEffects = useMemo(
    () => (Object.keys(effectDefaults) as EffectType[]).filter((e) => !activeEffects.includes(e)),
    [activeEffects]
  );

  const updateFilter = (effects: EffectType[], values: Record<EffectType, string>) => {
    const filterString = effects.map((e) => `${e}(${values[e]})`).join(' ');
    onStyleChange({ filter: filterString || 'none' });
  };

  const handleAddEffect = (effect: EffectType) => {
    const newActiveEffects = [...activeEffects, effect];
    const newEffectValues = { ...effectValues, [effect]: effectDefaults[effect] };
    if (effect === 'drop-shadow') {
        const defaultParts = { offsetX: '0px', offsetY: '4px', blur: '4px', color: 'rgba(0,0,0,0.25)' };
        setDropShadowParts(defaultParts);
        newEffectValues['drop-shadow'] = `${defaultParts.offsetX} ${defaultParts.offsetY} ${defaultParts.blur} ${defaultParts.color}`;
    }
    setActiveEffects(newActiveEffects);
    setEffectValues(newEffectValues);
    updateFilter(newActiveEffects, newEffectValues);
    setShowDropdown(false);
  };
  
  const handleChange = (effect: EffectType, value: string) => {
    const newEffectValues = { ...effectValues, [effect]: value };
    setEffectValues(newEffectValues);
    updateFilter(activeEffects, newEffectValues);
  };
  
  const handleDropShadowChange = (
    key: 'offsetX' | 'offsetY' | 'blur' | 'color',
    value: string
  ) => {
    const newDropShadowParts = { ...dropShadowParts, [key]: value };
    setDropShadowParts(newDropShadowParts);
    
    const formatted = `${newDropShadowParts.offsetX} ${newDropShadowParts.offsetY} ${newDropShadowParts.blur} ${newDropShadowParts.color}`;
    const newEffectValues = { ...effectValues, 'drop-shadow': formatted };
    
    setEffectValues(newEffectValues);
    updateFilter(activeEffects, newEffectValues);
  };

  const handleRemove = (effect: EffectType) => {
    const newActiveEffects = activeEffects.filter((e) => e !== effect);
    setActiveEffects(newActiveEffects);
    updateFilter(newActiveEffects, effectValues);
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className={styles.section}>
      <div className={styles.container} style={{ flexDirection: 'column', gap: '8px' }}>
        <div className={styles.row} style={{ justifyContent: 'space-between' }}>
          Effects
          {availableEffects.length > 0 && (
            <div style={{ position: 'relative' }}>
              <PlusIcon
                className={`${styles.icon} ${styles.button}`}
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className={styles.dropdownContainer} style={{ left: 'unset', right: '100%', width: 'fit-content' }}>
                  {availableEffects.map((effect) => (
                    <div
                      key={effect}
                      className={styles.dropdownOption}
                      onClick={() => handleAddEffect(effect)}
                      style={{ cursor: 'pointer' }}
                    >
                      {capitalize(effect)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {activeEffects.map((effect) => (
          <div key={effect} className={styles.strokeItemContainer}>
            <div className={styles.groupTitleRow}>
              <div className={styles.groupTitle}>{capitalize(effect.replace('-', ' '))}</div>
              <TrashIcon
                className={`${styles.icon} ${styles.button}`}
                onClick={() => handleRemove(effect)}
              />
            </div>
            {effect === 'drop-shadow' ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div className={styles.row}>
                  <div className={styles.groupInput}><input type="text" placeholder='X' title="Offset X" className={styles.input} value={dropShadowParts.offsetX} onChange={(e) => handleDropShadowChange('offsetX', e.target.value)} /></div>
                  <div className={styles.groupInput}><input type="text" placeholder='Y' title="Offset Y" className={styles.input} value={dropShadowParts.offsetY} onChange={(e) => handleDropShadowChange('offsetY', e.target.value)} /></div>
                </div>
                <div className={styles.row}>
                  <div className={styles.groupInput}><input type="text" placeholder='Blur' title="Blur Radius" className={styles.input} value={dropShadowParts.blur} onChange={(e) => handleDropShadowChange('blur', e.target.value)} /></div>
                  
                </div>
                <div className={styles.row}>
                  <ColorControl
                    label="Color"
                    property={'effectDropShadowColor' as any} 
                    value={dropShadowParts.color}
                    onClick={(e) =>
                        onColorControlClick(
                            e, 
                            'effectDropShadowColor', 
                            (newColor) => handleDropShadowChange('color', newColor),
                            dropShadowParts.color
                        )
                    }
                />
                </div>
              </div>
            ) : (
              <div className={styles.row}>
                <div className={`${styles.group} ${styles.fill}`}>
                  <div className={styles.groupTitle}>Value</div>
                  <div className={styles.groupInput}>
                    <input
                      type="text"
                      className={styles.input}
                      value={effectValues[effect] || ''}
                      onChange={(e) => handleChange(effect, e.target.value)}
                      placeholder={effectDefaults[effect]}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};