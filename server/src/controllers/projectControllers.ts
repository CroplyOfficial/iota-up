import { Project, IProjectModel } from "../models/Project";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { getArrayMatches } from "../utils/arrayUtils";
import { Post } from "../models/Posts";
import { User } from "../models/User";
import { escapeRegex } from "../utils/searchFuzzyMatching";
import fs from "fs";
import path from path;

interface IMatchedProject {
  matches?: number;
  name: string;
  desc: string;
  projectAuthor: mongoose.Schema.Types.ObjectId;
  tags: Array<string>;
  upvotes: number;
  backers: number;
  video: string;
  category: string[];
  media: Array<string>;
  created: Date;
}

/**
 * create a new project route
 *
 * @route   POST /api/projects
 * @access  restricted, logged in only
 * @returns JSON of the created project
 */

const createProject = asyncHandler(async (req: Request, res: Response) => {
  interface IReqBody {
    name: string;
    desc: string;
    category: string[];
    wallet: string;
  }
  const { name, desc, category, wallet }: IReqBody = req.body;
  const project = await Project.create({
    name,
    desc,
    category,
    wallet,
    projectAuthor: req.user._id,
  }).catch((error) => {
    res.status(400);
    throw new Error("unable to create project");
  });
  const creator = await User.findById(req.user._id);
  creator.projects.push(project._id);
  await creator.save();
  res.json(project);
});

/**
 * Edit the project, basically the project at this point is created
 * and this route will be used to add the miscellaneous information
 * related to that specific project
 *
 * @route   PUT /api/projects/:id
 * @access  Bearer Token Auth
 * @returns Project JSON
 */

const editProject = asyncHandler(async (req: Request, res: Response) => {
  interface IReqBody {
    name?: string;
    desc?: string;
    tags?: string[];
    media?: string[];
    video?: string;
    category?: string[];
    needContributors: boolean;
    editorState: string;
  }
  const {
    name,
    desc,
    tags,
    media,
    video,
    category,
    needContributors,
    editorState,
  }: IReqBody = req.body;
  const project: IProjectModel | null = await Project.findById(req.params.id);
  if (project) {
    console.log(project.projectAuthor, req.user.id);
    if (project.projectAuthor.toString() === req.user.id) {
      project.name = name ?? project.name;
      project.desc = desc ?? project.desc;
      project.tags = tags ?? project.tags;
      project.media = media ?? project.media;
      project.video = video ?? project.video;
      project.category = category ?? project.category;
      project.needContributors = needContributors ?? project.needContributors;
      project.editorState = editorState ?? project.editorState;
      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(403);
      throw new Error("You do not own this project");
    }
  } else {
    res.status(404);
    throw new Error("Project not found");
  }
});

/**
 * get all the projects
 *
 * @route   GET /api/projects
 * @access  open
 * @returns Array of projects
 */

const indexProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q;
  if (query) {
    const regex = new RegExp(escapeRegex(String(query)), "gi");
    const matchedProjects = await Project.find({ name: regex });
    res.json(matchedProjects);
  } else {
    const projects = await Project.find({}).catch((error) => {
      res.status(404);
      throw new Error("Unable to find any projects");
    });
    res.json(projects);
  }
});

/**
 * Toggle the upvote on a project, if liked
 * by the user already then unlike else add a
 * like to the project.
 *
 * @route   GET /api/projects/:id/toggle-upvote
 * @access  restricted, bearer token
 * @returns List containing IDs of user's liked
 *          projects
 */

const toggleProjectLike = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const project: IProjectModel | null = await Project.findById(id).catch(
    (error) => {
      res.status(404);
      throw new Error("Project not found");
    }
  );

  if (project) {
    if (req.user.upvotedProjects.includes(id)) {
      project.upvotes--;
      const filtered = req.user.upvotedProjects.filter(
        (projectId: string) => projectId !== id
      );
      req.user.upvotedProjects = filtered;
    } else {
      project.upvotes++;
      req.user.upvotedProjects.push(id);
    }
    await project.save();
    await req.user.save();

    res.json(req.user.upvotedProjects);
  } else {
    res.status(404);
    throw new Error("Project not found");
  }
});

/**
 * Get the trending projects in the last 7 days, it basically gets all
 * the projects that were createed in the last 7 days and sorts them by
 * upvotes
 *
 * @route   GET /api/projects/trending
 * @access  open
 * @returns trending projects for the week
 */

const trendingProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await Project.find({}).catch((error) => {
    res.status(404);
    throw new Error("No projects found");
  });
  const latestProjects = projects.filter((project: IProjectModel) => {
    const epochNow = new Date().getTime();
    const epochAgo = Number(epochNow) - 604800000;
    const epochProject = project.created.getTime();
    return epochProject > epochAgo && epochProject < epochNow;
  });
  latestProjects.sort((a: IProjectModel, b: IProjectModel) => {
    return b.upvotes - a.upvotes;
  });
  res.json(latestProjects);
});

/**
 * add a project as backed for the user, doesn't record all the backed projects
 * but rather the tags that the user actually backs
 *
 * @route   GET /api/projects/:id/add-backed
 * @access  restricted, bearer token authorization
 * @returns Array tags the user has backed
 */

const addBackedProject = asyncHandler(async (req: Request, res: Response) => {
  const project: IProjectModel | null = await Project.findById(req.params.id);
  if (project) {
    project.tags.forEach((tag: string) => {
      req.user.backedProjects.includes(tag)
        ? null
        : req.user.backedProjects.push(tag);
    });
    await req.user.save();
    res.json(req.user.backedProjects);
  } else {
    res.status(404);
    throw new Error("Project not found");
  }
});

/**
 * Get recommended projects for the user who is logged in, the algorith takes
 * into account the tags that the user is backing already, hence interested in
 * and then return those recommended projects.
 *
 * @route   GET /api/projects/recommended
 * @access  restricted, bearer token authorization
 * @returns Array of projects recommended
 */

const recommendedProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const projects: IProjectModel[] | null = await Project.find({});
    if (projects) {
      const matches = projects.map((project: IProjectModel) => {
        const arrMatches = getArrayMatches(
          req.user.backedProjects,
          project.tags
        );
        if (arrMatches > 0) {
          let matchedProject: IMatchedProject = project.toObject();
          matchedProject.matches = arrMatches;
          return matchedProject;
        } else {
          return;
        }
      });
      matches.sort((a: any, b: any) => {
        return b.matches - a.matches;
      });
      const filtered: any[] = matches.filter(
        (match: any) => match && match !== undefined
      );
      res.json(filtered);
    } else {
      res.status(404);
      throw new Error("No projects found");
    }
  }
);

/**
 * Get a project by ID and get all the posts associated with it
 *
 * @route   GET /api/projects/:id
 * @access  open
 * @returns Objecct containing the project and all the posts
 */

const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project: any = await Project.findById(req.params.id);
  if (project) {
    const posts = await Post.find({ project: project._id });
    const projectAuthor = await User.findById(project.projectAuthor);
    const displayName =
      projectAuthor.username ||
      `${projectAuthor.firstName} ${projectAuthor.lastName}`;
    res.json({
      ...project._doc,
      posts,
      author: {
        username: projectAuthor.username,
        displayName: displayName,
        fullName: `${projectAuthor.firstName} ${projectAuthor.lastName}`,
        avatar: projectAuthor.avatar,
        city: projectAuthor.city,
        country: projectAuthor.country,
        projects: projectAuthor.projects,
      },
    });
  } else {
    res.status(404);
    throw new Error("Project not found");
  }
});

/**
 * Get all the projects that the user has made by the user
 * id, and return all the projects as an array.
 *
 * @route   /api/projects/by-user/:id
 * @access  open
 * @returns {IProject[]}
 */

const getProjectsByUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  // @ts-ignore
  const projects: IProjectModel[] | null | undefined = await Project.find({
    projectAuthor: userId,
    res.json(projects);
  } else {
    res.status(404);
    throw new Error("No projects were found");
  }
});

/**
 * Delete the project by id and also remove all the media associated
 * with that specific project.
 *
 * @route DELETE /api/projects/:id
 * @access Bearer token authorization
 * @returns {IProject}
 */

const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (project) {
    if (String(project.projectAuthor) !== String(req.user._id)) {
      res.status(403);
      throw new Error('you can only delete your own projects')
    }
    const root = path.resolve("./");
    project.media.forEach(async (image) => {
      fs.unlinkSync(`${root}/uploads/${image}`);
    });
    const deleted = Project.findByIdAndDelete(req.params.id)
    res.json(deleted);
  } else {
    res.status(404);
    throw new Error("project not found");
  }
});

export {
  createProject,
  indexProjects,
  toggleProjectLike,
  trendingProjects,
  addBackedProject,
  recommendedProjects,
  getProjectById,
  editProject,
  getProjectsByUser,
  deleteProject
};
