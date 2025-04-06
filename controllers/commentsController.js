const { Comment, Post, User } = require('../models'); // Assuming you have Comment model and associations

// Create Comment (POST)
exports.createComment = async (req, res) => {
  const { post_id, content } = req.body;

  if (!content || !post_id) {
    return res.status(400).json({ message: 'Post ID and content are required.' });
  }

  try {
    // Check if the post exists
    const post = await Post.findByPk(post_id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Create the comment
    const newComment = await Comment.create({
      post_id,
      user_id: req.session.userId,
      content
    });

    // Fetch the comment along with the user details (username)
    const comment = await Comment.findByPk(newComment.id, {
      include: [
        { model: User, attributes: ['username'] }
      ]
    });

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get Comments (for a post)
exports.getComments = async (req, res) => {
  const { post_id } = req.params;

  try {
    // Fetch comments for the post
    const comments = await Comment.findAll({
      where: { post_id },
      include: [
        { model: User, attributes: ['username'] }
      ],
      order: [['created_at', 'ASC']] // Sorting comments by creation date
    });

    if (comments.length === 0) {
      return res.status(404).json({ message: 'No comments found for this post.' });
    }

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update Comment (PUT)
exports.updateComment = async (req, res) => {
  const { comment_id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Content is required.' });
  }

  try {
    const comment = await Comment.findByPk(comment_id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Ensure the comment belongs to the logged-in user
    if (comment.user_id !== req.session.userId) {
      return res.status(403).json({ message: 'You can only edit your own comments.' });
    }

    // Update the comment content
    comment.content = content;
    await comment.save();

    res.status(200).json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Delete Comment (DELETE)
exports.deleteComment = async (req, res) => {
  const { comment_id } = req.params;

  try {
    const comment = await Comment.findByPk(comment_id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Ensure the comment belongs to the logged-in user
    if (comment.user_id !== req.session.userId) {
      return res.status(403).json({ message: 'You can only delete your own comments.' });
    }

    // Delete the comment
    await comment.destroy();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
