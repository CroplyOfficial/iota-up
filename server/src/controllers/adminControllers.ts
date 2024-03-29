import { Request, Response } from 'express';
import { Infraction } from '../models/infractions';
import { Project } from '../models/Project';
import { User } from '../models/User';
import asyncHandler from 'express-async-handler';
import { request } from 'http';

/**
 * get all the infractions
 *
 * @access ADMIN only
 * @route /api/admin/infractions
 * @returns {IInfraction[]}
 */

const indexInfractions = asyncHandler(async (req: Request, res: Response) => {
  Infraction.find({})
    .populate('convict')
    .populate('project')
    .exec()
    .then((infractions) => {
      res.json(infractions);
    });
});

/**
 * Delete the project mentioned in the infraction
 *
 * @access ADMIN Only
 * @route /api/admin/remove-project/:id
 * @returns {IProject}
 */

const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const infraction = await Infraction.findById(id);
  if (!infraction) throw new Error('bad request');
  const projectId = infraction.project;
  const project = await Project.findByIdAndDelete(projectId);
  if (project) {
    const projectAuthor = await User.findById(project.projectAuthor);
    const projects = projectAuthor.projects.filter(
      (project: any) => project !== projectId
    );
    projectAuthor.projects = projects;
    await projectAuthor.save();
    await Infraction.findByIdAndDelete(id);
    res.json(project);
  } else {
    res.status(404);
    throw new Error('project not found');
  }
});

/**
 * Ban the user and delete all the projects of this user
 *
 * @route /api/admin/ban-user/:id
 * @access Admin Only
 * @returns {IUser}
 */

const banUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const infraction = await Infraction.findById(id);
  if (!infraction) throw new Error('bad request');
  const user = await User.findById(infraction.convict);
  if (user) {
    if (user.isAdmin) {
      res.status(403);
      throw new Error('user is admin');
    }
    user.isBanned = true;
    await user.save();
    for (const project of user.projects) {
      await Project.findByIdAndDelete(project);
    }
    await Infraction.findByIdAndDelete(id);
    res.json(user);
  } else {
    res.status(404);
    throw new Error('user not found');
  }
});

/**
 * Remove infractions
 *
 * @access Admin Only
 * @route /api/admin/ignore-infraction/:id
 * @returns {IInfraction}
 */

const ignoreUserInfraction = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const infraction = await Infraction.findByIdAndDelete(id);
    if (infraction) {
      res.json(infraction);
    } else {
      res.status(404);
      throw new Error('Infraction not found');
    }
  }
);

/**
 * List all users
 *
 * @route /api/admin/list-users
 * @access Admin Only
 * @returns {IUserModel[]}
 */

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  User.find({})
    .populate('projects')
    .exec()
    .then((users: any) => {
      res.json(users);
    });
});

/**
 * Ban a specific user
 *
 * @route /api/admin/ban-user-by-id/:id
 * @access Admin Only
 * @returns {IUserModel}
 */

const banUserById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await User.findById(id);
  if (user) {
    if (user.isAdmin) {
      res.status(403);
      throw new Error('user is admin');
    }
    user.isBanned = true;
    await user.save();
    for (const project of user.projects) {
      await Project.findByIdAndDelete(project);
    }
    res.json(user);
  } else {
    res.status(404);
    throw new Error('user not found');
  }
});

export {
  indexInfractions,
  deleteProject,
  banUser,
  ignoreUserInfraction,
  getAllUsers,
  banUserById,
};
