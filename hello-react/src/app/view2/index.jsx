import React, { useEffect, useState } from "react";
import { Tree } from 'antd';
import { view2Res } from '../test'

export const View2 = () => {
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [treeData, setTreeData] = useState()

    const [idTitle, setIdTitle] = useState([]);
    const [idParentID, setIdParentID] = useState([]);
    const [titleResult, setTitleResult] = useState([]);

    useEffect(() => {
        fetch("http://192.168.89.72:81/v1/mock/tree").then(response => response.json()).then((res) => {
            // const res = { data: view2Res };
            if (res && res.data) {
                let result = [];
                let allKey = [];
                let id_title = {};
                let id_parentId = {};
                handleTree(res.data, result, allKey, id_title, id_parentId);
                setTreeData(result);
                setExpandedKeys(allKey);
                setIdParentID(id_parentId)
                setIdTitle(id_title)
            }
        });
    }, [])

    const handleTree = (data, result, allKey, id_title, id_parentId) => {
        for(let i = 0; i < data.length; i++) {
            allKey.push(data[i].id)
            id_title[data[i].id] = data[i].name;
            id_parentId[data[i].id] = data[i].parentId;
            result[i] = {
                title: data[i].name,
                key: data[i].id,
                children: []
            };
            if (data[i].children && data[i].children.length > 0) {
                handleTree(data[i].children, result[i].children, allKey, id_title, id_parentId);
            }
        }
    }

    const onExpand = (expandedKeysValue) => {
        setExpandedKeys(expandedKeysValue);
    };

    const onSelect = (selectedKeysValue, info) => {
        let result = [];
        getTitle(result, selectedKeysValue[0]);
        result.push(idTitle[selectedKeysValue[0]]);
        setTitleResult(result);
    };

    const getTitle = (result, id) => {
        if (idParentID && idParentID[id]) {
            result.push(idTitle[idParentID[id]])
        }
        if (idParentID && idParentID[idParentID[id]]) {
            getTitle(result, idParentID[id], idParentID, idTitle);
        }
    }

    return (
        <div style={{ width: '40%',display: 'flex' }}>
            <div style={{ width: '50%', border: '1px solid', margin:'20px' }}>
                <Tree
                    className="draggable-tree"
                    expandedKeys={expandedKeys}
                    draggable
                    blockNode
                    treeData={treeData}
                    onExpand={onExpand}
                    onSelect={onSelect}
                />
            </div>
            <div style={{ width: '50%', height: '100px', border: '1px solid', marginTop: '20px' }}>
                {titleResult.join('-')}
            </div> 
        </div>
    )
}