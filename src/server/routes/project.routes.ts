import express from "express";
import { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createProject)
  .get(getProjects);

router.route("/:id")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

export default router;
