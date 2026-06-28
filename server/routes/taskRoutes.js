const express = require("express");
const router = express.Router();
const {
  getTasks, getTask, createTask,
  updateTask, updateStatus, deleteTask, bulkDelete,
} = require("../controllers/taskController");

router.get("/",                getTasks);
router.get("/:id",             getTask);
router.post("/",               createTask);
router.post("/bulk-delete",    bulkDelete);
router.put("/:id",             updateTask);
router.patch("/:id/status",    updateStatus);
router.delete("/:id",          deleteTask);

module.exports = router;
