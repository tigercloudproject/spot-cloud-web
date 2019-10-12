function compareUp(propertyName) { // 升序排序  
    return function (object1, object2) { // 属性值为数字  
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value1 - value2;
    }
}
function compareDown(propertyName) { // 降序排序  
    return function (object1, object2) { // 属性值为数字  
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value2 - value1;
    }
} 

//升序
export function getSortUp(list,key) {
    return list.sort(compareUp(key));
}

//降序
export function getSortDown(list,key) {
    if(list && list.length>0) {
        return list.sort(compareDown(key));
    }else {
        return [];
    }
}