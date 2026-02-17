import { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiPlus, FiTrash2, FiMove, FiChevronDown, FiRotateCcw, FiRotateCw, FiCopy, FiClipboard, FiLayers } from 'react-icons/fi';
import { analyzeBlockPerformance } from '@/utils/visualBuilder';
import {
  createEditorBlock,
  EDITOR_LAYOUT_TYPES as DEFAULT_LAYOUT_TYPES,
  EDITOR_WIDGET_TYPES as DEFAULT_WIDGET_TYPES,
  normalizeEditorBlockTree,
} from '@/components/editor/sharedEditorContract';

const MAX_HISTORY_SIZE = 80;
const PRESET_STORAGE_KEY = 'visual-builder-block-presets-v1';
const STYLE_PROP_KEYS = [
  'className',
  'style',
  'customCss',
  'animation',
  'textAlign',
  'fontSize',
  'fontWeight',
  'color',
  'background',
  'backgroundColor',
  'padding',
  'margin',
  'border',
  'borderRadius',
  'shadow',
  'opacity',
  'columns',
];

const createNode = (type = 'text') => createEditorBlock({ type, idPrefix: 'node' });

const cloneNodeWithNewIds = (node) => ({
  ...(node || {}),
  id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  children: Array.isArray(node?.children) ? node.children.map(cloneNodeWithNewIds) : [],
});

const extractStylePayload = (props = {}) => {
  if (!props || typeof props !== 'object') return {};

  return STYLE_PROP_KEYS.reduce((acc, key) => {
    if (props[key] !== undefined) {
      acc[key] = props[key];
    }
    return acc;
  }, {});
};

const normalizeNodes = (nodes) => {
  return normalizeEditorBlockTree(nodes, { defaultType: 'text', idPrefix: 'node' });
};

const cloneTree = (tree) => {
  const source = tree || [];
  if (typeof structuredClone === 'function') {
    return structuredClone(source);
  }

  return JSON.parse(JSON.stringify(source));
};

const flattenNodes = (nodes = [], parentPath = []) => {
  const result = [];
  (nodes || []).forEach((node, index) => {
    const path = [...parentPath, index];
    result.push({
      id: node.id,
      type: node.type,
      label: node?.props?.text || node?.props?.title || node.type,
      path,
      locked: Boolean(node?.props?.locked),
      hidden: Boolean(node?.props?.hidden),
    });
    result.push(...flattenNodes(node.children || [], path));
  });
  return result;
};

const reorderList = (list, activeId, overId) => {
  const oldIndex = list.findIndex((item) => item.id === activeId);
  const newIndex = list.findIndex((item) => item.id === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return list;

  const next = [...list];
  const [moved] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, moved);
  return next;
};

const updateByPath = (nodes, path, updater) => {
  if (path.length === 0) return updater(nodes);

  const [head, ...rest] = path;
  return nodes.map((node, index) => {
    if (index !== head) return node;

    if (rest.length === 0) {
      return updater(node);
    }

    return {
      ...node,
      children: updateByPath(node.children || [], rest, updater),
    };
  });
};

const removeByPath = (nodes, path) => {
  if (path.length === 1) {
    const index = path[0];
    return nodes.filter((_, i) => i !== index);
  }

  const [head, ...rest] = path;
  return nodes.map((node, index) => {
    if (index !== head) return node;
    return {
      ...node,
      children: removeByPath(node.children || [], rest),
    };
  });
};

const pathsEqual = (pathA = [], pathB = []) =>
  pathA.length === pathB.length && pathA.every((value, index) => value === pathB[index]);

const isAncestorPath = (ancestorPath = [], descendantPath = []) => {
  if (ancestorPath.length > descendantPath.length) return false;
  return ancestorPath.every((value, index) => descendantPath[index] === value);
};

const findPathById = (nodes, nodeId, prefix = []) => {
  for (let index = 0; index < (nodes || []).length; index += 1) {
    const node = nodes[index];
    const nextPath = [...prefix, index];
    if (node?.id === nodeId) return nextPath;

    const nestedPath = findPathById(node?.children || [], nodeId, [...nextPath]);
    if (nestedPath) return nestedPath;
  }

  return null;
};

const buildPathIndex = (nodes = [], parentPath = [], pathMap = new Map()) => {
  (nodes || []).forEach((node, index) => {
    const path = [...parentPath, index];
    if (node?.id) {
      pathMap.set(node.id, path);
    }
    if (Array.isArray(node?.children) && node.children.length > 0) {
      buildPathIndex(node.children, path, pathMap);
    }
  });

  return pathMap;
};

const getChildrenByPath = (nodes, parentPath = []) => {
  if (parentPath.length === 0) return nodes;

  let current = nodes;
  for (const index of parentPath) {
    current = current?.[index]?.children;
    if (!Array.isArray(current)) return [];
  }

  return current;
};

const getNodeByPath = (nodes, path = []) => {
  if (!Array.isArray(nodes)) return null;

  let currentNodes = nodes;
  let currentNode = null;

  for (const index of path) {
    currentNode = currentNodes?.[index] || null;
    if (!currentNode) return null;
    currentNodes = currentNode.children || [];
  }

  return currentNode;
};

const setChildrenByPath = (nodes, parentPath = [], nextChildren = []) => {
  if (parentPath.length === 0) return nextChildren;

  const [head, ...rest] = parentPath;
  return nodes.map((node, index) => {
    if (index !== head) return node;
    return {
      ...node,
      children: setChildrenByPath(node.children || [], rest, nextChildren),
    };
  });
};

const extractNodeByPath = (nodes, path = []) => {
  if (!Array.isArray(nodes) || path.length === 0) {
    return { node: null, nextNodes: nodes };
  }

  if (path.length === 1) {
    const index = path[0];
    const node = nodes[index] || null;
    return {
      node,
      nextNodes: nodes.filter((_, i) => i !== index),
    };
  }

  const [head, ...rest] = path;
  const target = nodes[head];
  if (!target) {
    return { node: null, nextNodes: nodes };
  }

  const extracted = extractNodeByPath(target.children || [], rest);
  return {
    node: extracted.node,
    nextNodes: nodes.map((node, index) =>
      index === head
        ? {
            ...node,
            children: extracted.nextNodes,
          }
        : node,
    ),
  };
};

function ChildDropZone({ id, onAutoExpand, containerId, onExternalDrop }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  useEffect(() => {
    if (!isOver || !onAutoExpand || !containerId) return undefined;

    const timer = setTimeout(() => {
      onAutoExpand(containerId);
    }, 280);

    return () => clearTimeout(timer);
  }, [isOver, onAutoExpand, containerId]);

  return (
    <div
      ref={setNodeRef}
      onDragOver={(event) => {
        if (event.dataTransfer?.types?.includes('application/x-widget-type')) {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDrop={(event) => {
        const type = event.dataTransfer?.getData('application/x-widget-type');
        if (!type) return;
        event.preventDefault();
        onExternalDrop?.(type, 'inside');
      }}
      className={`text-xs border border-dashed rounded px-2 py-2 text-center transition-colors ${
        isOver ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-400 hover:border-gray-400'
      }`}
    >
      {isOver ? 'Inside' : 'Drop Inside'}
    </div>
  );
}

function EdgeDropZone({ id, position = 'before', onExternalDrop }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const label = position === 'after' ? 'After' : 'Before';

  return (
    <div
      ref={setNodeRef}
      onDragOver={(event) => {
        if (event.dataTransfer?.types?.includes('application/x-widget-type')) {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDrop={(event) => {
        const type = event.dataTransfer?.getData('application/x-widget-type');
        if (!type) return;
        event.preventDefault();
        onExternalDrop?.(type, position);
      }}
      className={`h-4 rounded-sm border border-dashed transition-colors flex items-center justify-end px-2 ${
        isOver
          ? 'border-blue-400 bg-blue-100 text-blue-700'
          : 'border-transparent bg-transparent text-transparent hover:border-gray-300 hover:text-gray-500'
      }`}
      aria-label={`Drop ${position}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
    </div>
  );
}

function SortableItem({ id, headerRight, body }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-md bg-white p-3 space-y-3 ${isDragging ? 'border-blue-400 shadow-md' : 'border-gray-200'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-gray-500">
          <button
            type="button"
            className="p-1.5 rounded hover:bg-gray-100 cursor-move"
            {...attributes}
            {...listeners}
          >
            <FiMove size={14} />
          </button>
          <span className="text-xs font-medium">Drag</span>
        </div>
        {headerRight}
      </div>
      {body}
    </div>
  );
}

function NodeEditor({
  node,
  path,
  onChangeNode,
  onDeleteNode,
  onAddChild,
  selectedNodeId,
  onSelectNode,
  selectedBreakpoint,
  expandedNodeIds,
  onToggleExpand,
  onAutoExpand,
  isTopLevel = false,
    onExternalDrop,
}) {
  const childIds = useMemo(() => (node.children || []).map((child) => child.id), [node.children]);

  const updateProps = (nextRawValue) => {
    onChangeNode(path, {
      ...node,
      props: nextRawValue,
    });
  };

  const handlePropsTextChange = (value) => {
    try {
      const parsed = value ? JSON.parse(value) : {};
      updateProps(parsed);
    } catch {
      updateProps({ __raw: value });
    }
  };

  const propsValue =
    node.props && typeof node.props === 'object' && !('__raw' in node.props)
      ? JSON.stringify(node.props, null, 2)
      : node.props?.__raw || '';

  const canNest = DEFAULT_LAYOUT_TYPES.includes(node.type);
  const isExpanded = canNest ? expandedNodeIds.has(node.id) : true;
  const isSelected = selectedNodeId === node.id;

  const updateNodeProps = (nextProps) => {
    onChangeNode(path, {
      ...node,
      props: nextProps,
    });
  };

  const setBaseProp = (key, value) => {
    updateNodeProps({
      ...(node.props || {}),
      [key]: value,
    });
  };

  const setResponsiveProp = (key, value) => {
    const responsive = node.props?.responsive || {};
    const currentBreakpoint = responsive[selectedBreakpoint] || {};
    updateNodeProps({
      ...(node.props || {}),
      responsive: {
        ...responsive,
        [selectedBreakpoint]: {
          ...currentBreakpoint,
          [key]: value,
        },
      },
    });
  };

  const responsiveProps = node.props?.responsive?.[selectedBreakpoint] || {};

  return (
    <div className="space-y-1">
        <EdgeDropZone
        id={`edge-before-${node.id}`}
        position="before"
        onExternalDrop={(type, position) => onExternalDrop(node.id, position, type)}
        />
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectNode(node.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelectNode(node.id);
          }
        }}
        className={`rounded-md transition-colors ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
      >
      <SortableItem
        id={node.id}
        headerRight={(
            <button
              type="button"
              onClick={() => onDeleteNode(path)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete node"
            >
              <FiTrash2 size={14} />
            </button>
        )}
        body={(
            <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <select
                value={node.type}
                onChange={(e) => onChangeNode(path, { ...node, type: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
              >
                {[...DEFAULT_LAYOUT_TYPES, ...DEFAULT_WIDGET_TYPES].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {isTopLevel ? (
                <select
                  value={node.zone || 'after'}
                  onChange={(e) => onChangeNode(path, { ...node, zone: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                >
                  <option value="before">before section</option>
                  <option value="after">after section</option>
                </select>
              ) : (
                <div className="text-xs text-gray-400 flex items-center px-2">Nested</div>
              )}

              <button
                type="button"
                className="inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => onAddChild(path, canNest ? 'text' : 'row')}
              >
                <FiPlus size={12} /> {canNest ? 'Add Child' : 'Convert + Child'}
              </button>
            </div>

            {canNest && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onToggleExpand(node.id)}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
                >
                  <FiChevronDown
                    size={12}
                    className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                  />
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-gray-100 pt-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Text</label>
                <input
                  type="text"
                  value={node.props?.text ?? ''}
                  onChange={(e) => setBaseProp('text', e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                  placeholder="Content text"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Link</label>
                <input
                  type="text"
                  value={node.props?.link ?? node.props?.href ?? ''}
                  onChange={(e) => {
                    setBaseProp('link', e.target.value);
                    setBaseProp('href', e.target.value);
                  }}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                  placeholder="/products"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Global Class</label>
                <input
                  type="text"
                  value={node.props?.globalClassName ?? ''}
                  onChange={(e) => setBaseProp('globalClassName', e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                  placeholder="heroTitle"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Class ({selectedBreakpoint})</label>
                <input
                  type="text"
                  value={responsiveProps.className ?? ''}
                  onChange={(e) => setResponsiveProp('className', e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                  placeholder="text-2xl md:text-4xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Global Widget ID</label>
                <input
                  type="text"
                  value={node.props?.globalWidgetId ?? ''}
                  onChange={(e) => setBaseProp('globalWidgetId', e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                  placeholder="promoButton"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Animation</label>
                <select
                  value={node.props?.animationType ?? node.props?.animation ?? 'none'}
                  onChange={(e) => {
                    setBaseProp('animationType', e.target.value);
                    setBaseProp('animation', e.target.value);
                  }}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                >
                  <option value="none">none</option>
                  <option value="fade-up">fade-up</option>
                  <option value="slide-in">slide-in</option>
                  <option value="zoom-in">zoom-in</option>
                </select>
              </div>
              <div className="flex items-end gap-3 text-xs text-gray-600">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={Boolean(node.props?.sticky)}
                    onChange={(e) => setBaseProp('sticky', e.target.checked)}
                  />
                  Sticky
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={Boolean(node.props?.hidden)}
                    onChange={(e) => setBaseProp('hidden', e.target.checked)}
                  />
                  Hidden
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={Boolean(node.props?.locked)}
                    onChange={(e) => setBaseProp('locked', e.target.checked)}
                  />
                  Locked
                </label>
              </div>
            </div>

            <textarea
              value={propsValue}
              onChange={(e) => handlePropsTextChange(e.target.value)}
              rows={4}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 font-mono"
              placeholder='{"text":"Hello","className":"text-primary-900"}'
            />

            {canNest && isExpanded && (
              <div className="space-y-2 border-t border-dashed border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide inline-flex items-center gap-1">
                    <FiChevronDown size={12} /> Children
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddChild(path, 'text')}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <FiPlus size={12} /> Add Child
                  </button>
                </div>

                {(node.children || []).length === 0 ? (
                  <>
                    <p className="text-xs text-gray-400">No children yet.</p>
                    <ChildDropZone
                      id={`drop-${node.id}`}
                      containerId={node.id}
                      onAutoExpand={onAutoExpand}
                      onExternalDrop={(type, position) => onExternalDrop(node.id, position, type)}
                    />
                  </>
                ) : (
                  <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {node.children.map((child, childIndex) => (
                        <NodeEditor
                          key={child.id}
                          node={child}
                          path={[...path, childIndex]}
                          onChangeNode={onChangeNode}
                          onDeleteNode={onDeleteNode}
                          onAddChild={onAddChild}
                          onExternalDrop={onExternalDrop}
                          selectedNodeId={selectedNodeId}
                          onSelectNode={onSelectNode}
                          selectedBreakpoint={selectedBreakpoint}
                          expandedNodeIds={expandedNodeIds}
                          onToggleExpand={onToggleExpand}
                          onAutoExpand={onAutoExpand}
                        />
                      ))}
                      <ChildDropZone
                        id={`drop-${node.id}`}
                        containerId={node.id}
                        onAutoExpand={onAutoExpand}
                        onExternalDrop={(type, position) => onExternalDrop(node.id, position, type)}
                      />
                    </div>
                  </SortableContext>
                )}
              </div>
            )}
            </div>
        )}
      />
      </div>
        <EdgeDropZone
        id={`edge-after-${node.id}`}
        position="after"
        onExternalDrop={(type, position) => onExternalDrop(node.id, position, type)}
        />
    </div>
  );
}

export default function BlockTreeEditor({ value, onChange }) {
  const nodes = useMemo(() => normalizeNodes(value), [value]);
  const performance = useMemo(() => analyzeBlockPerformance(nodes), [nodes]);
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeDragId, setActiveDragId] = useState(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedBreakpoint, setSelectedBreakpoint] = useState('desktop');
  const [clipboardNode, setClipboardNode] = useState(null);
  const [styleClipboard, setStyleClipboard] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedPresetName, setSelectedPresetName] = useState('');
  const [historyPast, setHistoryPast] = useState([]);
  const [historyFuture, setHistoryFuture] = useState([]);
  const [navigatorQuery, setNavigatorQuery] = useState('');

  const snapshotNodes = useCallback((tree) => JSON.stringify(normalizeNodes(tree)), []);

  const parseSnapshot = useCallback((snapshot) => {
    try {
      return normalizeNodes(JSON.parse(snapshot));
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    const allContainerIds = [];

    const collect = (list) => {
      (list || []).forEach((node) => {
        if (DEFAULT_LAYOUT_TYPES.includes(node.type)) {
          allContainerIds.push(node.id);
        }
        collect(node.children || []);
      });
    };

    collect(nodes);

    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      allContainerIds.forEach((id) => next.add(id));
      return next;
    });
  }, [nodes]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(PRESET_STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) {
        setPresets(saved);
      }
    } catch {
      setPresets([]);
    }
  }, []);

  const persistPresets = useCallback((nextPresets) => {
    setPresets(nextPresets);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(nextPresets));
    }
  }, []);

  const commitTree = useCallback((nextTree, { recordHistory = true } = {}) => {
    const normalizedNext = normalizeNodes(nextTree);
    const currentSnapshot = snapshotNodes(nodes);
    const nextSnapshot = snapshotNodes(normalizedNext);

    if (nextSnapshot === currentSnapshot) return;

    if (recordHistory) {
      setHistoryPast((prev) => {
        const nextPast = [...prev, currentSnapshot];
        return nextPast.slice(-MAX_HISTORY_SIZE);
      });
      setHistoryFuture([]);
    }

    onChange(normalizedNext);
  }, [nodes, onChange, snapshotNodes]);

  const updateTree = useCallback((updater, options = { recordHistory: true }) => {
    const nextTree = updater(cloneTree(nodes));
    commitTree(nextTree, options);
  }, [commitTree, nodes]);

  const nodePathIndex = useMemo(() => buildPathIndex(nodes), [nodes]);

  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;

    const previousSnapshot = historyPast[historyPast.length - 1];
    const currentSnapshot = snapshotNodes(nodes);

    setHistoryPast((prev) => prev.slice(0, -1));
    setHistoryFuture((prev) => [currentSnapshot, ...prev].slice(0, MAX_HISTORY_SIZE));
    onChange(parseSnapshot(previousSnapshot));
  }, [historyPast, nodes, onChange, parseSnapshot, snapshotNodes]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;

    const nextSnapshot = historyFuture[0];
    const currentSnapshot = snapshotNodes(nodes);

    setHistoryFuture((prev) => prev.slice(1));
    setHistoryPast((prev) => [...prev, currentSnapshot].slice(-MAX_HISTORY_SIZE));
    onChange(parseSnapshot(nextSnapshot));
  }, [historyFuture, nodes, onChange, parseSnapshot, snapshotNodes]);

  const handleChangeNode = (path, nextNode) => {
    updateTree((tree) => updateByPath(tree, path, () => nextNode));
  };

  const handleDeleteNode = useCallback((path) => {
    const deletedNode = getNodeByPath(nodes, path);
    updateTree((tree) => removeByPath(tree, path));
    if (deletedNode?.id && deletedNode.id === selectedNodeId) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId, updateTree]);

  const handleAddTopLevel = (type) => {
    updateTree((tree) => [...tree, createNode(type)]);
  };

  const handleAddChild = (path, fallbackChildType = 'text') => {
    updateTree((tree) =>
      updateByPath(tree, path, (node) => {
        const baseNode = node || createNode('container');
        const nodeType = DEFAULT_LAYOUT_TYPES.includes(baseNode.type) ? baseNode.type : 'container';

        return {
          ...baseNode,
          type: nodeType,
          children: [...(baseNode.children || []), createNode(fallbackChildType)],
        };
      }),
    );
  };

  const handleExternalDrop = useCallback((targetNodeId, position, widgetType) => {
    if (!targetNodeId || !widgetType) return;

    updateTree((tree) => {
      const nextNode = createNode(widgetType);
      const targetPath = findPathById(tree, targetNodeId);
      if (!targetPath) return [...tree, nextNode];

      if (position === 'inside') {
        return updateByPath(tree, targetPath, (node) => {
          const baseNode = node || createNode('container');
          const nodeType = DEFAULT_LAYOUT_TYPES.includes(baseNode.type) ? baseNode.type : 'container';
          return {
            ...baseNode,
            type: nodeType,
            children: [...(baseNode.children || []), nextNode],
          };
        });
      }

      const parentPath = targetPath.slice(0, -1);
      const siblings = [...getChildrenByPath(tree, parentPath)];
      const targetIndex = targetPath[targetPath.length - 1];
      const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
      siblings.splice(insertIndex, 0, nextNode);
      return setChildrenByPath(tree, parentPath, siblings);
    });
  }, [updateTree]);

  const handleToggleExpand = (nodeId) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleAutoExpand = (nodeId) => {
    setExpandedNodeIds((prev) => {
      if (prev.has(nodeId)) return prev;
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });
  };

  const handleMoveNode = (activeId, overId) => {
    updateTree((tree) => {
      const activePath = findPathById(tree, String(activeId));
      if (!activePath) return tree;

      const parseEdgeTarget = (targetId) => {
        const target = String(targetId || '');
        if (target.startsWith('edge-before-')) {
          return { mode: 'before', targetNodeId: target.replace('edge-before-', '') };
        }
        if (target.startsWith('edge-after-')) {
          return { mode: 'after', targetNodeId: target.replace('edge-after-', '') };
        }
        return null;
      };

      const edgeTarget = parseEdgeTarget(overId);

      if (edgeTarget) {
        const targetPath = findPathById(tree, edgeTarget.targetNodeId);
        if (!targetPath) return tree;
        if (isAncestorPath(activePath, targetPath)) return tree;

        const extracted = extractNodeByPath(tree, activePath);
        if (!extracted.node) return tree;

        const refreshedTargetPath = findPathById(extracted.nextNodes, edgeTarget.targetNodeId);
        if (!refreshedTargetPath) return extracted.nextNodes;

        const targetParentPath = refreshedTargetPath.slice(0, -1);
        const targetSiblings = [...getChildrenByPath(extracted.nextNodes, targetParentPath)];
        const targetIndex = refreshedTargetPath[refreshedTargetPath.length - 1];
        const insertIndex = edgeTarget.mode === 'after' ? targetIndex + 1 : targetIndex;

        targetSiblings.splice(insertIndex, 0, extracted.node);
        return setChildrenByPath(extracted.nextNodes, targetParentPath, targetSiblings);
      }

      if (String(overId).startsWith('drop-')) {
        const targetContainerId = String(overId).replace('drop-', '');
        const targetContainerPath = findPathById(tree, targetContainerId);
        if (!targetContainerPath || pathsEqual(activePath, targetContainerPath)) return tree;
        if (isAncestorPath(activePath, targetContainerPath)) return tree;

        const extracted = extractNodeByPath(tree, activePath);
        if (!extracted.node) return tree;

        const refreshedContainerPath = findPathById(extracted.nextNodes, targetContainerId);
        if (!refreshedContainerPath) return extracted.nextNodes;

        return updateByPath(extracted.nextNodes, refreshedContainerPath, (containerNode) => ({
          ...containerNode,
          children: [...(containerNode.children || []), extracted.node],
        }));
      }

      const overPath = findPathById(tree, String(overId));
      if (!overPath || pathsEqual(activePath, overPath)) return tree;
        if (isAncestorPath(activePath, overPath)) return tree;

      const activeParentPath = activePath.slice(0, -1);
      const overParentPath = overPath.slice(0, -1);

      if (pathsEqual(activeParentPath, overParentPath)) {
        const siblings = getChildrenByPath(tree, activeParentPath);
        const reordered = reorderList(siblings, String(activeId), String(overId));
        return setChildrenByPath(tree, activeParentPath, reordered);
      }

      const extracted = extractNodeByPath(tree, activePath);
      if (!extracted.node) return tree;

      const refreshedOverPath = findPathById(extracted.nextNodes, String(overId));
      if (!refreshedOverPath) return extracted.nextNodes;

      const refreshedOverParentPath = refreshedOverPath.slice(0, -1);
      const targetSiblings = [...getChildrenByPath(extracted.nextNodes, refreshedOverParentPath)];
      const insertIndex = refreshedOverPath[refreshedOverPath.length - 1];

      targetSiblings.splice(insertIndex, 0, extracted.node);
      return setChildrenByPath(extracted.nextNodes, refreshedOverParentPath, targetSiblings);
    });
  };

  const handleCopySelected = useCallback(() => {
    if (!selectedNodeId) return;
    const selectedPath = nodePathIndex.get(selectedNodeId) || null;
    if (!selectedPath) return;
    const selectedNode = getNodeByPath(nodes, selectedPath);
    if (!selectedNode) return;

    setClipboardNode(cloneTree(selectedNode));
  }, [nodePathIndex, nodes, selectedNodeId]);

  const handlePasteClipboard = useCallback(() => {
    if (!clipboardNode) return;

    updateTree((tree) => {
      const pastedNode = cloneNodeWithNewIds(cloneTree(clipboardNode));

      if (!selectedNodeId) {
        return [...tree, pastedNode];
      }

      const selectedPath = findPathById(tree, selectedNodeId);
      if (!selectedPath) {
        return [...tree, pastedNode];
      }

      const parentPath = selectedPath.slice(0, -1);
      const siblings = [...getChildrenByPath(tree, parentPath)];
      const insertIndex = selectedPath[selectedPath.length - 1] + 1;
      siblings.splice(insertIndex, 0, pastedNode);

      return setChildrenByPath(tree, parentPath, siblings);
    });
  }, [clipboardNode, selectedNodeId, updateTree]);

  const handleCopyStyle = useCallback(() => {
    if (!selectedNodeId) return;

    const selectedPath = nodePathIndex.get(selectedNodeId) || null;
    if (!selectedPath) return;

    const selectedNode = getNodeByPath(nodes, selectedPath);
    if (!selectedNode) return;

    const stylePayload = extractStylePayload(selectedNode.props || {});
    if (Object.keys(stylePayload).length === 0) return;

    setStyleClipboard(stylePayload);
  }, [nodePathIndex, nodes, selectedNodeId]);

  const handlePasteStyle = useCallback(() => {
    if (!selectedNodeId || !styleClipboard) return;

    updateTree((tree) => {
      const selectedPath = findPathById(tree, selectedNodeId);
      if (!selectedPath) return tree;

      return updateByPath(tree, selectedPath, (node) => ({
        ...node,
        props: {
          ...(node?.props || {}),
          ...cloneTree(styleClipboard),
        },
      }));
    });
  }, [selectedNodeId, styleClipboard, updateTree]);

  const handleDuplicateSelected = useCallback(() => {
    if (!selectedNodeId) return;

    updateTree((tree) => {
      const selectedPath = findPathById(tree, selectedNodeId);
      if (!selectedPath) return tree;

      const selectedNode = getNodeByPath(tree, selectedPath);
      if (!selectedNode) return tree;

      const duplicateNode = cloneNodeWithNewIds(cloneTree(selectedNode));
      const parentPath = selectedPath.slice(0, -1);
      const siblings = [...getChildrenByPath(tree, parentPath)];
      const insertIndex = selectedPath[selectedPath.length - 1] + 1;
      siblings.splice(insertIndex, 0, duplicateNode);

      setSelectedNodeId(duplicateNode.id);
      return setChildrenByPath(tree, parentPath, siblings);
    });
  }, [selectedNodeId, updateTree]);

  const handleSavePreset = useCallback(() => {
    if (!selectedNodeId) return;

    const selectedPath = nodePathIndex.get(selectedNodeId) || null;
    if (!selectedPath) return;
    const selectedNode = getNodeByPath(nodes, selectedPath);
    if (!selectedNode) return;

    const defaultName = `Preset ${presets.length + 1}`;
    const name = typeof window !== 'undefined'
      ? window.prompt('Preset name', defaultName)
      : defaultName;

    if (!name) return;

    const nextPresets = [
      ...presets.filter((item) => item.name !== name),
      { name, node: cloneTree(selectedNode), updatedAt: new Date().toISOString() },
    ];
    persistPresets(nextPresets);
    setSelectedPresetName(name);
  }, [nodePathIndex, nodes, persistPresets, presets, selectedNodeId]);

  const handleInsertPreset = useCallback(() => {
    const preset = presets.find((item) => item.name === selectedPresetName);
    if (!preset?.node) return;

    updateTree((tree) => [...tree, cloneNodeWithNewIds(cloneTree(preset.node))]);
  }, [presets, selectedPresetName, updateTree]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedNodeId) return;
    const selectedPath = nodePathIndex.get(selectedNodeId) || null;
    if (!selectedPath) return;
    handleDeleteNode(selectedPath);
  }, [handleDeleteNode, nodePathIndex, selectedNodeId]);

  const moveSelectedByDelta = useCallback((delta) => {
    if (!selectedNodeId || !Number.isFinite(delta)) return;

    updateTree((tree) => {
      const activePath = findPathById(tree, selectedNodeId);
      if (!activePath) return tree;

      const parentPath = activePath.slice(0, -1);
      const siblings = [...getChildrenByPath(tree, parentPath)];
      const currentIndex = activePath[activePath.length - 1];
      const targetIndex = Math.min(Math.max(currentIndex + delta, 0), siblings.length - 1);
      if (targetIndex === currentIndex) return tree;

      const [moved] = siblings.splice(currentIndex, 1);
      siblings.splice(targetIndex, 0, moved);

      return setChildrenByPath(tree, parentPath, siblings);
    });
  }, [selectedNodeId, updateTree]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      const isMeta = event.ctrlKey || event.metaKey;
      const key = String(event.key || '').toLowerCase();

      if (isMeta && !event.shiftKey && key === 'z') {
        event.preventDefault();
        handleUndo();
        return;
      }

      if ((isMeta && key === 'y') || (isMeta && event.shiftKey && key === 'z')) {
        event.preventDefault();
        handleRedo();
        return;
      }

      if (isMeta && !event.shiftKey && key === 'c') {
        event.preventDefault();
        handleCopySelected();
        return;
      }

      if (isMeta && event.shiftKey && key === 'c') {
        event.preventDefault();
        handleCopyStyle();
        return;
      }

      if (isMeta && !event.shiftKey && key === 'v') {
        event.preventDefault();
        handlePasteClipboard();
        return;
      }

      if (isMeta && event.shiftKey && key === 'v') {
        event.preventDefault();
        handlePasteStyle();
        return;
      }

      if (isMeta && !event.shiftKey && key === 'd') {
        event.preventDefault();
        handleDuplicateSelected();
        return;
      }

      if ((key === 'delete' || key === 'backspace') && selectedNodeId) {
        event.preventDefault();
        handleDeleteSelected();
        return;
      }

      if (event.altKey && key === 'arrowup') {
        event.preventDefault();
        moveSelectedByDelta(-1);
        return;
      }

      if (event.altKey && key === 'arrowdown') {
        event.preventDefault();
        moveSelectedByDelta(1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleCopySelected,
    handleCopyStyle,
    handleDeleteSelected,
    handleDuplicateSelected,
    handlePasteClipboard,
    handlePasteStyle,
    handleRedo,
    handleUndo,
    moveSelectedByDelta,
    selectedNodeId,
  ]);

  const rootIds = nodes.map((node) => node.id);
  const navigatorItems = useMemo(() => flattenNodes(nodes), [nodes]);
  const filteredNavigatorItems = useMemo(() => {
    const query = navigatorQuery.trim().toLowerCase();
    if (!query) return navigatorItems;
    return navigatorItems.filter((item) =>
      `${item.type} ${item.label}`.toLowerCase().includes(query),
    );
  }, [navigatorItems, navigatorQuery]);
  const activeDragPath = activeDragId ? nodePathIndex.get(String(activeDragId)) || null : null;
  const activeDragNode = activeDragPath ? getNodeByPath(nodes, activeDragPath) : null;

  const handleExportTemplates = () => {
    if (typeof window === 'undefined') return;
    const payload = {
      exportedAt: new Date().toISOString(),
      presets,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `builder-templates-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTemplates = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming = Array.isArray(parsed?.presets) ? parsed.presets : [];
      if (!incoming.length) return;
      const merged = [...presets];
      incoming.forEach((item) => {
        if (!item?.name || !item?.node) return;
        const existingIndex = merged.findIndex((entry) => entry.name === item.name);
        if (existingIndex >= 0) {
          merged[existingIndex] = item;
        } else {
          merged.push(item);
        }
      });
      persistPresets(merged);
    } catch {
      // ignore invalid import
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleAddTopLevel('row')}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
        >
          <FiPlus size={12} /> Add Row
        </button>
        <button
          type="button"
          onClick={() => handleAddTopLevel('text')}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
        >
          <FiPlus size={12} /> Add Widget
        </button>
        <button
          type="button"
          onClick={handleUndo}
          disabled={historyPast.length === 0}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl/Cmd+Z)"
        >
          <FiRotateCcw size={12} /> Undo
        </button>
        <button
          type="button"
          onClick={handleRedo}
          disabled={historyFuture.length === 0}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z)"
        >
          <FiRotateCw size={12} /> Redo
        </button>
        <button
          type="button"
          onClick={handleCopySelected}
          disabled={!selectedNodeId}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Copy (Ctrl/Cmd+C)"
        >
          <FiCopy size={12} /> Copy
        </button>
        <button
          type="button"
          onClick={handlePasteClipboard}
          disabled={!clipboardNode}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Paste (Ctrl/Cmd+V)"
        >
          <FiClipboard size={12} /> Paste
        </button>
        <button
          type="button"
          onClick={handleCopyStyle}
          disabled={!selectedNodeId}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Copy Style (Ctrl/Cmd+Shift+C)"
        >
          <FiCopy size={12} /> Copy Style
        </button>
        <button
          type="button"
          onClick={handlePasteStyle}
          disabled={!selectedNodeId || !styleClipboard}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Paste Style (Ctrl/Cmd+Shift+V)"
        >
          <FiClipboard size={12} /> Paste Style
        </button>
        <button
          type="button"
          onClick={handleDuplicateSelected}
          disabled={!selectedNodeId}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Duplicate (Ctrl/Cmd+D)"
        >
          <FiLayers size={12} /> Duplicate
        </button>
        <button
          type="button"
          onClick={handleDeleteSelected}
          disabled={!selectedNodeId}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete selected (Delete/Backspace)"
        >
          <FiTrash2 size={12} /> Delete
        </button>
        <button
          type="button"
          onClick={handleSavePreset}
          disabled={!selectedNodeId}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save selected node as reusable preset"
        >
          <FiLayers size={12} /> Save Preset
        </button>
        <select
          value={selectedPresetName}
          onChange={(e) => setSelectedPresetName(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1.5"
        >
          <option value="">Select Preset</option>
          {presets.map((preset) => (
            <option key={preset.name} value={preset.name}>{preset.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleInsertPreset}
          disabled={!selectedPresetName}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Insert selected preset"
        >
          <FiClipboard size={12} /> Insert Preset
        </button>
        <button
          type="button"
          onClick={handleExportTemplates}
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
          title="Export template presets"
        >
          Export Templates
        </button>
        <label className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
          Import Templates
          <input type="file" accept="application/json" className="hidden" onChange={handleImportTemplates} />
        </label>
      </div>
      <div className="rounded border border-gray-200 bg-white p-2 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Navigator</p>
          <span className="text-[10px] text-gray-400">{filteredNavigatorItems.length} items</span>
        </div>
        <input
          type="text"
          value={navigatorQuery}
          onChange={(event) => setNavigatorQuery(event.target.value)}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          placeholder="Search layers..."
        />
        <div className="max-h-32 overflow-y-auto space-y-1">
          {filteredNavigatorItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedNodeId(item.id)}
              className={`w-full text-left text-xs px-2 py-1.5 rounded border ${selectedNodeId === item.id ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
            >
              <span className="font-medium">{item.type}</span> · {item.label}
              {item.locked ? ' · locked' : ''}
              {item.hidden ? ' · hidden' : ''}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {['desktop', 'tablet', 'mobile'].map((bp) => (
          <button
            key={bp}
            type="button"
            onClick={() => setSelectedBreakpoint(bp)}
            className={`text-xs px-2 py-1 rounded border ${selectedBreakpoint === bp ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            {bp}
          </button>
        ))}
        <span className={`ml-auto text-[10px] font-semibold uppercase px-2 py-1 rounded ${performance.level === 'high' ? 'bg-red-100 text-red-700' : performance.level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
          Render Cost {performance.level}
        </span>
      </div>
      {(performance.count > 40 || performance.maxDepth > 5 || performance.imageCount > 8) && (
        <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800 space-y-0.5">
          {performance.count > 40 && <p>High node count ({performance.count}) may reduce editor and page performance.</p>}
          {performance.maxDepth > 5 && <p>Tree depth is high ({performance.maxDepth}); flatten layout where possible.</p>}
          {performance.imageCount > 8 && <p>Many image blocks ({performance.imageCount}); optimize sizes for LCP.</p>}
        </div>
      )}
      <p className="text-[11px] text-gray-500">
        Move: <span className="font-medium">Alt + ↑/↓</span> · Undo/Redo: <span className="font-medium">Ctrl/Cmd+Z</span>/<span className="font-medium">Ctrl/Cmd+Y</span> · Copy/Paste Node: <span className="font-medium">Ctrl/Cmd+C</span>/<span className="font-medium">Ctrl/Cmd+V</span> · Copy/Paste Style: <span className="font-medium">Ctrl/Cmd+Shift+C</span>/<span className="font-medium">Ctrl/Cmd+Shift+V</span>.
      </p>

      {nodes.length === 0 ? (
        <p className="text-xs text-gray-400">No blocks yet. Add a row or widget.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => setActiveDragId(String(active.id))}
          onDragCancel={() => setActiveDragId(null)}
          onDragEnd={(event) => {
            const { active, over } = event;
            if (over && active.id !== over.id) {
              handleMoveNode(active.id, over.id);
            }
            setActiveDragId(null);
          }}
        >
          <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {nodes.map((node, index) => (
                <NodeEditor
                  key={node.id}
                  node={node}
                  path={[index]}
                  onChangeNode={handleChangeNode}
                  onDeleteNode={handleDeleteNode}
                  onAddChild={handleAddChild}
                  onExternalDrop={handleExternalDrop}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  selectedBreakpoint={selectedBreakpoint}
                  expandedNodeIds={expandedNodeIds}
                  onToggleExpand={handleToggleExpand}
                  onAutoExpand={handleAutoExpand}
                  isTopLevel
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeDragNode ? (
              <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 shadow-lg">
                {activeDragNode.type || 'node'}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
