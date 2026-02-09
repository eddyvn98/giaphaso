
import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import CustomNode from './CustomNode';
import TreeEdge from './TreeEdge';
import ControlPanel from './ControlPanel';
import RouteFinder from './RouteFinder';
import { useAppStore } from '@/store/store';
import { getLayoutedElements, transformDataToFlow } from '@/utils/layout';
import { getKinshipTerm, buildAdjacencyList } from '@/utils/kinship';

const FamilyTreeContent = () => {
  const people = useAppStore(state => state.people);
  const relationships = useAppStore(state => state.relationships);
  const layoutDirection = useAppStore(state => state.layoutDirection);
  const selectPerson = useAppStore(state => state.selectPerson);
  const addPerson = useAppStore(state => state.addPerson);
  const deletePerson = useAppStore(state => state.deletePerson);
  const highlightedNodeIds = useAppStore(state => state.highlightedNodeIds);
  const setHighlightedNodes = useAppStore(state => state.setHighlightedNodes);
  const visibleGenerations = useAppStore(state => state.visibleGenerations);
  const routeNodeIds = useAppStore(state => state.routeNodeIds);
  const initialize = useAppStore(state => state.initialize);
  const isLoading = useAppStore(state => state.isLoading);
  const error = useAppStore(state => state.error);

  const meId = useAppStore(state => state.meId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstance = useReactFlow();

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    tree: TreeEdge,
  }), []);

  useEffect(() => {
    console.log('🔄 Initializing app store...');
    initialize();
  }, [initialize]);


  useEffect(() => {
    if (routeNodeIds.length > 0) {
      try {
        const pathNodes = reactFlowInstance.getNodes().filter(n => routeNodeIds.includes(n.id));
        if (pathNodes.length > 0) {
          reactFlowInstance.fitBounds(
            {
              x: Math.min(...pathNodes.map(n => n.position.x)) - 100,
              y: Math.min(...pathNodes.map(n => n.position.y)) - 100,
              width: Math.max(...pathNodes.map(n => n.position.x + 130)) - Math.min(...pathNodes.map(n => n.position.x)) + 200,
              height: Math.max(...pathNodes.map(n => n.position.y + 180)) - Math.min(...pathNodes.map(n => n.position.y)) + 200,
            },
            { duration: 800, padding: 0.2 }
          );
        }
      } catch (e) {
        console.error('Error during fitBounds:', e);
      }
    }
  }, [routeNodeIds, reactFlowInstance]);

  const onNodeClick = useCallback((id: string) => {
    const connected = new Set<string>([id]);
    const findAncestors = (currId: string) => {
      relationships.forEach(rel => {
        if (rel.target === currId && rel.type === 'blood') {
          connected.add(rel.source);
          findAncestors(rel.source);
        }
      });
    };
    const findDescendants = (currId: string) => {
      relationships.forEach(rel => {
        if (rel.source === currId && rel.type === 'blood') {
          connected.add(rel.target);
          findDescendants(rel.target);
        }
      });
    };
    findAncestors(id);
    findDescendants(id);
    setHighlightedNodes(connected);
  }, [relationships, setHighlightedNodes]);

  const onAvatarClick = useCallback((id: string) => selectPerson(id, false), [selectPerson]);

  const onAddClick = useCallback((id: string, type: 'parent' | 'spouse' | 'child' | 'sibling') => {
    const currentNode = people.find(p => p.id === id);
    if (!currentNode) return;

    const newId = `new-${Date.now()}`;
    const newPerson = {
      id: newId,
      fullName: type === 'sibling' ? 'Anh/Chị/Em mới' : `Thành viên mới`,
      gender: 'male' as const,
      isAlive: true,
      order: type === 'child' ? (currentNode.order || 0) + 1 : (currentNode.order || 0),
      images: [],
    };

    if (type === 'parent') {
      addPerson(newPerson, undefined, id, undefined);
    }
    else if (type === 'child') {
      addPerson(newPerson, id, undefined, undefined);
    }
    else if (type === 'spouse') {
      addPerson(newPerson, undefined, undefined, id);
    }
    else if (type === 'sibling') {
      // Find parent
      const parentRel = relationships.find(r => r.target === id && r.type === 'blood');
      if (parentRel) {
        // Add as child of existing parent
        addPerson(newPerson, parentRel.source, undefined, undefined);
      } else {
        // No parent found (Root node). Create dummy parent first.
        const dummyParentId = `parent-of-${id}-${Date.now()}`;
        const dummyParent = {
          id: dummyParentId,
          fullName: `Bố/Mẹ của ${currentNode.fullName}`,
          gender: 'male' as const,
          isAlive: false, // Assume deceased ancestor usually
          order: Math.max(1, (currentNode.order || 1) - 1),
          images: []
        };

        // Sequence:
        // 1. Add Dummy Parent as parent of Current
        addPerson(dummyParent, undefined, id, undefined).then(() => {
          console.log(`✅ Added Dummy Parent: ${dummyParentId}`);
          // 2. Add New Sibling as child of Dummy Parent
          // Wait small bit for state refresh? logic is inside store.
          setTimeout(() => {
            addPerson(newPerson, dummyParentId, undefined, undefined)
              .then(() => console.log('✅ Sibling added successfully'))
              .catch(e => console.error('❌ Failed to add sibling:', e));
          }, 800);
        }).catch(e => {
          console.error('❌ Failed to add dummy parent:', e);
          alert('Có lỗi khi tạo bố mẹ giả định. Vui lòng thử lại.');
        });
      }
    }

    setTimeout(() => selectPerson(newId, true), 1200);
  }, [people, relationships, addPerson, selectPerson]);

  const onDeleteClick = useCallback((id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi phả hệ?')) {
      deletePerson(id);
    }
  }, [deletePerson]);

  // 0. Pre-calculate kinship terms for all people (Optimization)
  const kinshipMap = useMemo(() => {
    if (!meId) return new Map<string, string>();
    console.log('🧠 Pre-calculating kinship terms...');
    const map = new Map<string, string>();
    const adj = buildAdjacencyList(relationships);
    people.forEach(p => {
      if (p.id !== meId) {
        map.set(p.id, getKinshipTerm(meId, p.id, people, relationships, adj));
      }
    });
    return map;
  }, [people, relationships, meId]);
  // meId is not in store as a reactive dependency here to avoid full re-calc on every meId change, 
  // but usually meId is stable. If meId changes, we might need to add it.
  // Actually, useAppStore.getState().meId is safe if people/relationships change too.

  // 1. Tính toán cấu trúc và vị trí (Layout) - Chỉ chạy khi dữ liệu hoặc hướng thay đổi
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    try {
      const { nodes: initialNodes, edges: initialEdges, personLevels } = transformDataToFlow(
        people, relationships, onNodeClick, onAddClick, onDeleteClick, visibleGenerations
      );
      const result = getLayoutedElements(initialNodes, initialEdges, layoutDirection, personLevels);
      return { layoutedNodes: result.nodes, layoutedEdges: result.edges };
    } catch (err) {
      console.error('❌ Error during layout calculation:', err);
      return { layoutedNodes: [], layoutedEdges: [] };
    }
  }, [people, relationships, layoutDirection, visibleGenerations, onNodeClick, onAddClick, onDeleteClick]);

  // 2. Áp dụng phong cách (Highlight/Route) - Chạy khi tương tác nhưng KHÔNG tính lại layout
  useEffect(() => {
    const isRouteActive = routeNodeIds.length > 0;
    const hasHighlights = highlightedNodeIds.size > 0;

    const finalNodes = layoutedNodes.map(node => {
      // Determine if person is a blood member (not an in-law)
      // They are blood if they have a blood parent or are a root ancestor (no parents at all)
      const hasBloodParent = relationships.some(r => r.target === node.id && r.type === 'blood');
      // For simplicity, if they have NO parent and NO spouse, they are likely a Root
      // But more accurately, some people might be added as spouses directly.
      // Logic: If someone has a blood parent -> Blood. 
      // If someone has NO blood parent but is a SOURCE of a blood relationship -> Blood (Ancestor).
      const isBloodParent = relationships.some(r => r.source === node.id && r.type === 'blood');
      const isBloodMember = hasBloodParent || !relationships.some(r => r.target === node.id && r.type === 'spouse') || isBloodParent;
      // Wait, simpler: anyone who isn't JUST a spouse in the tree.
      // Actually, let's use: hasBloodParent || isRoot (no parents)
      // Note: Roots don't have blood parents.

      return {
        ...node,
        data: {
          ...node.data,
          onAvatarClick,
          onAddClick,
          onDeleteClick,
          kinship: kinshipMap.get(node.id),
          isHighlighted: isRouteActive ? routeNodeIds.includes(node.id) : highlightedNodeIds.has(node.id),
          isBloodMember: hasBloodParent || isBloodParent, // If they have children or parents in blood line
        }
      };
    });

    const finalEdges = layoutedEdges.map(edge => {
      const isPartOfRoute = isRouteActive && routeNodeIds.includes(edge.source) && routeNodeIds.includes(edge.target);
      const isHighlighted = hasHighlights && highlightedNodeIds.has(edge.source) && highlightedNodeIds.has(edge.target);

      return {
        ...edge,
        animated: isPartOfRoute,
        style: {
          ...edge.style,
          opacity: (isRouteActive || hasHighlights) ? (isPartOfRoute || isHighlighted ? 1 : 0.2) : 0.8,
          stroke: isPartOfRoute ? '#2563eb' : (edge.style?.stroke || '#741B1B'),
          strokeWidth: isPartOfRoute ? 5 : (edge.style?.strokeWidth || 4)
        }
      };
    });

    setNodes(finalNodes);
    setEdges(finalEdges);
  }, [layoutedNodes, layoutedEdges, highlightedNodeIds, routeNodeIds, onAvatarClick, onAddClick, onDeleteClick, setNodes, setEdges, kinshipMap]);

  // Calculate current max level for the button label
  const actualMaxLevel = useMemo(() => {
    if (nodes.length === 0) return 0;
    return Math.max(...nodes.map(n => n.data?.level || 1));
  }, [nodes]);

  try {
    if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-paper-bg z-50 font-serif">Đang tải dữ liệu gia phả...</div>;
    if (error) return <div className="fixed inset-0 flex items-center justify-center bg-paper-bg z-50 text-heritage-red font-serif font-bold">Lỗi: {error}</div>;

    return (
      <div className="w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          // KHÓA KÉO THẢ VÀ KẾT NỐI THỦ CÔNG
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          minZoom={0.05}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          onlyRenderVisibleElements={true}
          onPaneClick={() => {
            if (useAppStore.getState().interactionNodeId) {
              useAppStore.getState().setInteractionNodeId(null);
            }
          }}
        >
          <Background color="transparent" />
        </ReactFlow>

        <RouteFinder />

        <ControlPanel
          currentMaxLevel={actualMaxLevel}
          onFitView={() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({ padding: 0.2, duration: 1000 });
            }
          }}
          onLocateNode={(id) => {
            if (reactFlowInstance) {
              const node = reactFlowInstance.getNode(id);
              if (node) {
                // Calculate center
                const x = node.position.x + (node.width ?? 150) / 2;
                const y = node.position.y + (node.height ?? 220) / 2;
                reactFlowInstance.setCenter(x, y, { zoom: 1.2, duration: 1000 });
              }
            }
          }}
        />
      </div>
    );
  } catch (renderError: any) {
    console.error('CRITICAL RENDER ERROR:', renderError);
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-paper-bg z-50 p-10 text-center">
        <h1 className="text-2xl font-serif font-bold text-heritage-red mb-4">Hệ thống gặp sự cố hiển thị</h1>
        <p className="text-stone-600 mb-6">{renderError.message}</p>
        <button onClick={() => window.location.reload()} className="bg-heritage-red text-white px-6 py-2 rounded-full">Tải lại trang</button>
      </div>
    );
  }
};

const FamilyTree = () => (
  <ReactFlowProvider>
    <FamilyTreeContent />
  </ReactFlowProvider>
);

export default FamilyTree;
