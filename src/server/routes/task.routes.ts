import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { 
  createTask, 
  getTasksByProject, 
  updateTask, 
  deleteTask,
  addComment,
  uploadAttachment
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createTask);

router.get("/project/all", async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: (req as any).user._id }, { members: (req as any).user._id }]
    });
    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("assignedTo", "name email avatar");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.route("/project/:projectId")
  .get(getTasksByProject);

router.route("/:id")
  .put(updateTask)
  .delete(deleteTask);

router.route("/:id/comments")
  .post(addComment);

router.post("/:id/attachments", upload.single("file"), uploadAttachment);

export default router;
