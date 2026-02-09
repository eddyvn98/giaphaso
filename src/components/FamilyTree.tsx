
import React, { useEffect, useCallback, useRef, useState } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import CustomNode from './CustomNode';
import ControlPanel from './ControlPanel';
import RouteFinder from './RouteFinder';
import { useAppStore } from '@/store/store';
import { getLayoutedElements, transformDataToFlow } from '@/utils/layout';

const nodeTypes = {
  custom: CustomNode,
};

const FamilyTreeContent = () => {
  const {
    people, relationships, layoutDirection, selectPerson, addPerson, deletePerson,
    highlightedNodeIds, setHighlightedNodes, visibleGenerations, routeNodeIds,
    initialize, isLoading, error
  } = useAppStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-paper-bg z-50">Đang tải dữ liệu gia phả...</div>;
  if (error) return <div className="fixed inset-0 flex items-center justify-center bg-paper-bg z-50 text-heritage-red">Lỗi: {error}</div>;

  useEffect(() => {
    if (routeNodeIds.length > 0) {
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

  const onAddClick = useCallback((id: string, type: 'parent' | 'spouse' | 'child') => {
    const parentNode = people.find(p => p.id === id);
    if (!parentNode) return;

    const newId = `new-${Date.now()}`;
    const newPerson = {
      id: newId,
      fullName: `Thành viên mới`,
      gender: 'male' as const,
      isAlive: true,
      order: type === 'child' ? (parentNode.order || 0) + 1 : (parentNode.order || 0),
      images: [],
    };

    if (type === 'parent') addPerson(newPerson, undefined, id, undefined);
    else if (type === 'child') addPerson(newPerson, id, undefined, undefined);
    else if (type === 'spouse') addPerson(newPerson, undefined, undefined, id);

    setTimeout(() => selectPerson(newId, true), 100);
  }, [people, addPerson, selectPerson]);

  const onDeleteClick = useCallback((id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi phả hệ?')) {
      deletePerson(id);
    }
  }, [deletePerson]);

  useEffect(() => {
    const { nodes: initialNodes, edges: initialEdges } = transformDataToFlow(
      people, relationships, onNodeClick, onAddClick, onDeleteClick, visibleGenerations
    );

    const isRouteActive = routeNodeIds.length > 0;

    const finalNodes = initialNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onAvatarClick,
        onAddClick,
        onDeleteClick,
        isHighlighted: isRouteActive ? routeNodeIds.includes(node.id) : (highlightedNodeIds.has(node.id)),
      }
    }));

    const finalEdges = initialEdges.map(edge => {
      const isPartOfRoute = isRouteActive && routeNodeIds.includes(edge.source) && routeNodeIds.includes(edge.target);
      const isHighlighted = highlightedNodeIds.has(edge.source) && highlightedNodeIds.has(edge.target);

      return {
        ...edge,
        animated: isPartOfRoute,
        style: {
          ...edge.style,
          opacity: (isRouteActive || highlightedNodeIds.size > 0) ? (isPartOfRoute || isHighlighted ? 1 : 0.2) : 0.8,
          stroke: isPartOfRoute ? '#2563eb' : edge.style?.stroke,
          strokeWidth: isPartOfRoute ? 5 : edge.style?.strokeWidth
        }
      };
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(finalNodes, finalEdges, layoutDirection);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [people, relationships, layoutDirection, highlightedNodeIds, visibleGenerations, routeNodeIds, onNodeClick, onAvatarClick, onAddClick, onDeleteClick, setNodes, setEdges]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        // KHÓA KÉO THẢ VÀ KẾT NỐI THỦ CÔNG
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        minZoom={0.05}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="transparent" />
      </ReactFlow>

      <RouteFinder />

      <ControlPanel
        onFitView={() => {
          reactFlowInstance.fitView({ padding: 0.2, duration: 1000 });
        }}
      />
    </div>
  );
};

const FamilyTree = () => (
  <ReactFlowProvider>
    <FamilyTreeContent />
  </ReactFlowProvider>
);

export default FamilyTree;
