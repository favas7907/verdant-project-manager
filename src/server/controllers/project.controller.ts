import Project from "../models/Project.js";

export const createProject = async (req, res) => {
  try {
    if (req.user.role === "Team Member") {
      return res.status(403).json({ message: "Team members cannot create projects" });
    }
    const project = await Project.create({
      ...req.body,
      owner: req.user._id,
      members: [req.user._id, ...(req.body.members || [])]
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "Admin") {
      query = { $or: [{ owner: req.user._id }, { members: req.user._id }] };
    }
    const projects = await Project.find(query).populate("owner members", "name email avatar");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("owner members", "name email avatar");
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    // Check if user has access
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    
    if (req.user.role !== "Admin" && !isMember && !isOwner) {
      return res.status(403).json({ message: "Not authorized to access this project" });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (req.user.role !== "Admin" && req.user.role !== "Manager" && !isOwner) {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (req.user.role !== "Admin" && !isOwner) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
