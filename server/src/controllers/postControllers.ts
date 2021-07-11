import { Post } from '../models/Posts';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Project } from '../models/Project';

/**
 * Get all the posts pertaining to a provided project ID
 *
 * @route   GET /api/posts/by-project/:id
 * @access  open
 * @returns Array of all the post objects
 */

const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts: any = await Post.find({ project: req.params.id });
  if (posts && posts.length > 0) {
    res.json(posts);
  } else {
    res.status(404);
    throw new Error('Posts not found');
  }
});

/**
 * Create a new post and associate it with the project ID
 *
 * @route   POST /api/post/by-project/:id
 * @access  restricted, bearer token
 * @retunrs Post JSON
 */

const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { body, title } = req.body;
  const project = await Project.findById(req.params.id).catch((error) => {
    res.status(404);
    throw new Error('Project not found');
  });
  if (project && String(project?.projectAuthor) === String(req.user._id)) {
    const post = await Post.create({
      title,
      body,
      project: req.params.id,
    });
    res.json(post);
  } else {
    res.status(403);
    throw new Error('You do not own this project');
  }
});

/**
 * Find post by ID and edit the said post
 *
 * @route   POST /api/posts/modify/:id
 * @access  restricted, bearer token
 * @returns POST JSON
 */

const editPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    const project = await Project.findById(post.project);
    if (String(project?.projectAuthor) === String(req.user._id)) {
      const { title, body }: { title?: string; body?: string } = req.body;
      post.title = title || post.title;
      post.body = body || post.body;
      const postSaved = await post.save();
      res.json(postSaved);
    } else {
      res.status(403);
      throw new Error('You do not own the project');
    }
  } else {
    res.status(404);
    throw new Error('post not found');
  }
});

/**
 * Delete the post by ID
 *
 * @route   DELETE /api/posts/modify/:id
 * @access  restricted, bearer token
 * @returns deleted post
 */

const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    const project = await Project.findById(post.project);
    if (String(project?.projectAuthor) === String(req.user._id)) {
      const postDeleted = await Post.findByIdAndDelete(req.params.id);
      res.json(postDeleted);
    } else {
      res.status(403);
      throw new Error('You do not own the project');
    }
  } else {
    res.status(404);
    throw new Error('post not found');
  }
});

export { getPosts, createPost, editPost, deletePost };
