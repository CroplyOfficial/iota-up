import { IProjectModel, Project } from '../models/Project';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { User } from '../models/User';

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
    tags: Array<string>;
  }
  const { name, desc, tags }: IReqBody = req.body;
  const project = await Project.create({
    name,
    tags,
    desc,
    projectAuthor: req.user._id,
  }).catch((error) => {
    res.status(400);
    throw new Error('unable to create project');
  });

  res.json(project);
});

/**
 * get all the projects
 *
 * @route   GET /api/projects
 * @access  open
 * @returns Array of projects
 */

const indexProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await Project.find({}).catch((error) => {
    res.status(404);
    throw new Error('Unable to find any projects');
  });
  res.json(projects);
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
      throw new Error('Project not found');
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
    throw new Error('Project not found');
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
    throw new Error('No projects found');
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
 * @access  restricted, bearer token authentication
 * @returns Array of recommended projects for the user
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
    throw new Error('Project not found');
  }
});

export {
  createProject,
  indexProjects,
  toggleProjectLike,
  trendingProjects,
  addBackedProject,
};
