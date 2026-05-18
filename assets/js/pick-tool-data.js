// ── 入仓挑货工具 · 共享数据层 ──
(function () {
  const STORAGE_KEY = 'sdms_pick_tasks';

  function _load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function _save(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function _genId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  function _now() {
    return new Date().toISOString();
  }

  function getAllTasks() {
    return _load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function getTask(taskId) {
    return _load().find(t => t.id === taskId) || null;
  }

  function getTaskByOrderNo(orderNo) {
    return _load().find(t => t.orderNo === orderNo) || null;
  }

  function createTasksFromRows(rows) {
    const tasks = _load();
    const grouped = {};

    rows.forEach(function (r) {
      var key = r.orderNo;
      if (!grouped[key]) grouped[key] = {};
      var cartonKey = r.cartonNo;
      if (!grouped[key][cartonKey]) grouped[key][cartonKey] = {};
      grouped[key][cartonKey][r.parcelNo] = true;
    });

    var created = [];
    Object.keys(grouped).forEach(function (orderNo) {
      var cartons = grouped[orderNo];
      var task = {
        id: _genId(),
        orderNo: orderNo,
        createdAt: _now(),
        status: 'pending',
        cartons: Object.keys(cartons).map(function (cartonNo) {
          var parcelSet = cartons[cartonNo];
          return {
            cartonNo: cartonNo,
            parcels: Object.keys(parcelSet).map(function (parcelNo) {
              return { parcelNo: parcelNo, picked: false, pickedAt: null };
            })
          };
        })
      };
      tasks.push(task);
      created.push(task);
    });

    _save(tasks);
    return created;
  }

  function updateTask(task) {
    var tasks = _load();
    var idx = tasks.findIndex(function (t) { return t.id === task.id; });
    if (idx !== -1) {
      tasks[idx] = task;
      _save(tasks);
      return true;
    }
    return false;
  }

  function deleteTask(taskId) {
    if (!taskId) return;
    var tasks = _load().filter(function (t) { return t.id !== taskId; });
    _save(tasks);
  }

  function orderNoExists(orderNo) {
    return _load().some(function (t) { return t.orderNo === orderNo; });
  }

  function overwriteByOrderNo(orderNo, rows) {
    var existing = getTaskByOrderNo(orderNo);
    if (existing) deleteTask(existing.id);
    return createTasksFromRows(rows.filter(function (r) { return r.orderNo === orderNo; }));
  }

  function getTaskStats(task) {
    var total = 0, picked = 0;
    task.cartons.forEach(function (c) {
      c.parcels.forEach(function (p) {
        total++;
        if (p.picked) picked++;
      });
    });
    return { total: total, picked: picked, unpicked: total - picked, done: picked === total };
  }

  function pickParcel(taskId, cartonNo, parcelNo) {
    var task = getTask(taskId);
    if (!task) return null;
    var carton = task.cartons.find(function (c) { return c.cartonNo === cartonNo; });
    if (!carton) return null;
    var parcel = carton.parcels.find(function (p) { return p.parcelNo === parcelNo; });
    if (!parcel || parcel.picked) return null;
    parcel.picked = true;
    parcel.pickedAt = _now();
    task.status = 'in_progress';
    var stats = getTaskStats(task);
    if (stats.done) task.status = 'completed';
    updateTask(task);
    return task;
  }

  function findCarton(taskId, cartonNo) {
    var task = getTask(taskId);
    if (!task) return null;
    return task.cartons.find(function (c) { return c.cartonNo === cartonNo; }) || null;
  }

  function getCartonNos(taskId) {
    var task = getTask(taskId);
    if (!task) return [];
    return task.cartons.map(function (c) { return c.cartonNo; });
  }

  window.PickTool = {
    getAllTasks: getAllTasks,
    getTask: getTask,
    getTaskByOrderNo: getTaskByOrderNo,
    createTasksFromRows: createTasksFromRows,
    updateTask: updateTask,
    deleteTask: deleteTask,
    orderNoExists: orderNoExists,
    overwriteByOrderNo: overwriteByOrderNo,
    getTaskStats: getTaskStats,
    pickParcel: pickParcel,
    findCarton: findCarton,
    getCartonNos: getCartonNos
  };
})();
