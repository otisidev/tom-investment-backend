exports.BatchDataLoader = (ids, results) => {
    const list = {};
    results.forEach(item => {
        list[item.id] = item;
    });
    return ids.map(id => list[id]);
};
